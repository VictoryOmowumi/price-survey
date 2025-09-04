import { z } from "zod";

export const ProductLine = z.object({
  productName: z.enum([
    "SBC 40cl",
    "NBC 40cl", 
    "RC Cola 40cl",
    "Pop Cola 40cl",
    "Bigi 40cl",
  ]),
  buyPrice: z.number().positive("Buy price must be greater than 0"),
  sellPrice: z.number().positive("Sell price must be greater than 0"),
});

const phoneRegex = /^0[0-9]{10}$/; // Nigerian phone number format: 07034528756

export const SubmissionCreate = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters"),
  customerPhone: z.string().regex(phoneRegex, "Invalid phone number").optional().or(z.literal("")),
  outletName: z.string().min(2, "Outlet name must be at least 2 characters"),
  area: z.string().min(2, "Area must be at least 2 characters"),
  items: z.array(ProductLine).min(1, "At least one product must be selected"),
  geo: z
    .object({
      lat: z.number(),
      lng: z.number(),
      accuracy: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  collectedAt: z.coerce.date().optional(),
});

export type SubmissionCreateType = z.infer<typeof SubmissionCreate>;
export type ProductLineType = z.infer<typeof ProductLine>;
