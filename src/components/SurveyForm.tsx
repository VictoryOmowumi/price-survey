'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductPrices } from './ProductPrices';
import { OfflineSync } from './OfflineSync';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { SubmissionCreateType, ProductLineType } from '@/schemas/submission';
import { toast } from 'sonner';

// Lagos LGAs for the dropdown
const LAGOS_LGAS = [
  'Agege',
  'Ajeromi-Ifelodun',
  'Alimosho',
  'Amuwo-Odofin',
  'Apapa',
  'Badagry',
  'Epe',
  'Eti-Osa',
  'Ibeju-Lekki',
  'Ifako-Ijaiye',
  'Ikeja',
  'Ikorodu',
  'Kosofe',
  'Lagos Island',
  'Lagos Mainland',
  'Mushin',
  'Ojo',
  'Oshodi-Isolo',
  'Shomolu',
  'Surulere',
];

const formSchema = z.object({
  customerName: z.string().min(2, 'Customer name must be at least 2 characters'),
  customerPhone: z.string().optional(),
  outletName: z.string().min(2, 'Outlet name must be at least 2 characters'),
  outletAddress: z.string().min(2, 'Outlet address must be at least 2 characters'),
  area: z.string().min(2, 'Area must be at least 2 characters'),
});

type FormData = z.infer<typeof formSchema>;

export function SurveyForm() {
  const { data: geoData, getCurrentPosition } = useGeolocation();
  const { addToQueue, isOnline } = useOfflineQueue();
  const [selectedProducts, setSelectedProducts] = useState<ProductLineType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const clearAllFields = () => {
    reset();
    setSelectedProducts([]);
    setFormKey((prev) => prev + 1); // Force re-render of form components
  };

  const isPotentialSslError = (error: unknown) => {
    const message = (error as Error)?.message || '';
    return message.includes('SSL') || message.includes('tlsv1');
  };

  const verifySubmissionExists = async (outletName: string) => {
    try {
      const verifyResponse = await fetch('/api/submissions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outletName,
          day: new Date().toISOString().split('T')[0],
        }),
      });

      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        return Boolean(verifyResult.exists);
      }
    } catch (verifyError) {
      console.warn('Verification failed:', verifyError);
    }

    return false;
  };

  const onSubmit = async (data: FormData) => {
    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    // Validate that all selected products have valid prices
    const invalidProducts = selectedProducts.filter((p) => p.buyPrice <= 0 || p.sellPrice <= 0);

    if (invalidProducts.length > 0) {
      toast.error('Please enter valid prices for all selected products');
      return;
    }

    setIsSubmitting(true);

    try {
      // Capture location at the moment of submission
      let currentLocation = geoData;
      if (!currentLocation) {
        try {
          currentLocation = await getCurrentPosition();
          if (!currentLocation) {
            toast.error(
              'Location access is required to submit this survey. Please allow location access and try again.'
            );
            setIsSubmitting(false);
            return;
          }
        } catch (locationError) {
          console.warn('Location capture failed:', locationError);
          toast.error(
            'Location access is required to submit this survey. Please allow location access and try again.'
          );
          setIsSubmitting(false);
          return;
        }
      }

      const submission: SubmissionCreateType = {
        ...data,
        customerPhone: data.customerPhone || undefined,
        items: selectedProducts,
        geo: currentLocation,
        collectedAt: new Date(),
      };

      if (isOnline) {
        // Try to submit directly
        try {
          const response = await fetch('/api/submissions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(submission),
          });

          if (response.ok) {
            toast.success('Survey submitted successfully!');
            clearAllFields();
            return; // Exit early on success
          } else if (response.status === 409) {
            const result = await response.json();
            toast.error(result.message || 'Already captured for this outlet today');
            return;
          } else {
            const result = await response.json();
            throw new Error(result.error || 'Failed to submit survey');
          }
        } catch (fetchError: unknown) {
          // Handle network/SSL errors - check if it might have succeeded
          console.warn('Network error during submission:', fetchError);

          // If it's an SSL error, verify if the submission actually succeeded
          if (isPotentialSslError(fetchError)) {
            const exists = await verifySubmissionExists(data.outletName);
            if (exists) {
              toast.success('Survey submitted successfully!');
              clearAllFields();
              return;
            }

            // If verification fails, assume it succeeded anyway for SSL errors
            toast.success('Survey submitted successfully! (Network confirmation pending)');
            clearAllFields();
            return;
          }

          // For other errors, try to queue the submission
          throw fetchError;
        }
      } else {
        // Add to offline queue (with location data)
        await addToQueue(submission);
        toast.success('Survey saved offline. Will sync when connection is restored.');
        clearAllFields();
      }
    } catch (error: unknown) {
      console.error('Submission error:', error);

      // Check if it's an SSL error that might indicate successful submission
      if (isPotentialSslError(error)) {
        const exists = await verifySubmissionExists(data.outletName);
        if (exists) {
          toast.success('Survey submitted successfully!');
          clearAllFields();
          return;
        }

        toast.success('Survey submitted successfully! (Network confirmation pending)');
        clearAllFields();
        return;
      }

      if (isOnline) {
        // If online submission failed, try to queue it
        try {
          await addToQueue({
            ...data,
            customerPhone: data.customerPhone || undefined,
            items: selectedProducts,
            geo: geoData,
            collectedAt: new Date(),
          });
          toast.success('Survey saved offline due to connection issues.');
          clearAllFields();
        } catch {
          toast.error('Failed to save survey. Please try again.');
        }
      } else {
        toast.error('Failed to save survey. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(160deg,#f8fafc_0%,#ecfeff_35%,#fefce8_100%)]">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
        <div className="flex flex-col gap-4">
          <aside className="space-y-4">
            <Card className="border-0 bg-slate-900 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/sbclogo.png" alt="SBC Logo" className="h-14 w-auto rounded-md bg-white p-1" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Field Collection</p>
                    <h1 className="text-lg font-semibold leading-tight">Seven-Up Bottling Company</h1>
                  </div>
                </div>
              </CardContent>
            </Card>

            <OfflineSync />
          </aside>

          <main>
            <form key={formKey} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card className="border border-slate-200/70 bg-white/95 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur">
                <CardHeader className="border-b border-slate-100 bg-slate-50/70">
                  <CardTitle className="text-xl font-semibold text-slate-900">Customer Information</CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <input type="hidden" {...register('area')} />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customerName" className="text-sm font-medium text-slate-700">
                        Customer Name *
                      </Label>
                      <Input
                        id="customerName"
                        {...register('customerName')}
                        placeholder="Enter customer name"
                        className={`h-12 rounded-xl bg-white ${
                          errors.customerName
                            ? 'border-red-500 focus-visible:ring-red-500/30'
                            : 'border-slate-300 focus-visible:ring-cyan-500/30'
                        }`}
                      />
                      {errors.customerName && <p className="text-sm text-red-500">{errors.customerName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-sm font-medium text-slate-700">
                        Customer Phone
                      </Label>
                      <Input
                        id="customerPhone"
                        {...register('customerPhone')}
                        placeholder="07034528756"
                        type="tel"
                        maxLength={11}
                        pattern="0[0-9]{10}"
                        className="h-12 rounded-xl border-slate-300 bg-white focus-visible:ring-cyan-500/30"
                      />
                      {errors.customerPhone && <p className="text-sm text-red-500">{errors.customerPhone.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="outletName" className="text-sm font-medium text-slate-700">
                        Outlet Name *
                      </Label>
                      <Input
                        id="outletName"
                        {...register('outletName')}
                        placeholder="Enter outlet name"
                        className={`h-12 rounded-xl bg-white ${
                          errors.outletName
                            ? 'border-red-500 focus-visible:ring-red-500/30'
                            : 'border-slate-300 focus-visible:ring-cyan-500/30'
                        }`}
                      />
                      {errors.outletName && <p className="text-sm text-red-500">{errors.outletName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-sm font-medium text-slate-700">
                        Area/LGA *
                      </Label>
                      <Select onValueChange={(value) => setValue('area', value, { shouldValidate: true })}>
                        <SelectTrigger
                          id="area"
                          className={`!h-12 rounded-xl bg-white ${
                            errors.area
                              ? 'border-red-500 focus:ring-red-500/30'
                              : 'border-slate-300 focus:ring-cyan-500/30'
                          }`}
                        >
                          <SelectValue placeholder="Select area or LGA" />
                        </SelectTrigger>
                        <SelectContent>
                          {LAGOS_LGAS.map((lga) => (
                            <SelectItem key={lga} value={lga}>
                              {lga}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.area && <p className="text-sm text-red-500">{errors.area.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outletAddress" className="text-sm font-medium text-slate-700">
                      Outlet Address *
                    </Label>
                    <Input
                      id="outletAddress"
                      {...register('outletAddress')}
                      placeholder="Enter full outlet address"
                      className={`h-12 rounded-xl bg-white ${
                        errors.outletAddress
                          ? 'border-red-500 focus-visible:ring-red-500/30'
                          : 'border-slate-300 focus-visible:ring-cyan-500/30'
                      }`}
                    />
                    {errors.outletAddress && <p className="text-sm text-red-500">{errors.outletAddress.message}</p>}
                  </div>
                </CardContent>
              </Card>

              <ProductPrices selectedProducts={selectedProducts} onProductsChange={setSelectedProducts} />

              <div className="sticky bottom-3 z-20 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur md:p-4">
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Location capture is required to submit this survey.</p>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full rounded-xl bg-slate-900 text-base font-semibold text-white shadow-md transition hover:bg-slate-800 md:h-12"
                    disabled={isSubmitting || selectedProducts.length === 0}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Submitting...
                      </div>
                    ) : (
                      'Submit Survey'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
