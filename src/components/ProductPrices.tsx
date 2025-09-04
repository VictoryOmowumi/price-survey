'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PRODUCTS } from '@/schemas/product';
import { ProductLineType } from '@/schemas/submission';

interface ProductPricesProps {
  selectedProducts: ProductLineType[];
  onProductsChange: (products: ProductLineType[]) => void;
}

export function ProductPrices({ selectedProducts, onProductsChange }: ProductPricesProps) {
  const [selectedProductNames, setSelectedProductNames] = useState<string[]>(
    selectedProducts.map(p => p.productName)
  );

  // Sync internal state when selectedProducts changes (e.g., after form reset)
  useEffect(() => {
    setSelectedProductNames(selectedProducts.map(p => p.productName));
  }, [selectedProducts]);

  const handleProductToggle = (productName: string, checked: boolean) => {
    if (checked) {
      // Add product
      const newProduct: ProductLineType = {
        productName: productName as ProductLineType['productName'],
        buyPrice: 0,
        sellPrice: 0,
      };
      const newProducts = [...selectedProducts, newProduct];
      onProductsChange(newProducts);
      setSelectedProductNames([...selectedProductNames, productName]);
    } else {
      // Remove product
      const newProducts = selectedProducts.filter(p => p.productName !== productName);
      onProductsChange(newProducts);
      setSelectedProductNames(selectedProductNames.filter(name => name !== productName));
    }
  };

  const handlePriceChange = (productName: string, field: 'buyPrice' | 'sellPrice', value: number) => {
    const newProducts = selectedProducts.map(product => {
      if (product.productName === productName) {
        return { ...product, [field]: value };
      }
      return product;
    });
    onProductsChange(newProducts);
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm !pt-0">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg py-3">
        <CardTitle className="text-xl font-semibold">Products & Prices</CardTitle>
        <p className="text-sm text-green-100">
          Select products and enter buying/selling prices in NGN
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        {PRODUCTS.map((productName) => {
          const isSelected = selectedProductNames.includes(productName);
          const product = selectedProducts.find(p => p.productName === productName);
          
          return (
            <div key={productName} className={`space-y-3 p-4 border-2 rounded-lg transition-all duration-200 ${
              isSelected 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={productName}
                  checked={isSelected}
                  onCheckedChange={(checked) => handleProductToggle(productName, checked as boolean)}
                  className="h-5 w-5"
                />
                <Label htmlFor={productName} className="text-sm font-semibold text-gray-800 cursor-pointer">
                  {productName}
                </Label>
              </div>
              
              {isSelected && product && (
                <div className="grid grid-cols-2 gap-4 ml-8 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <Label htmlFor={`${productName}-buy`} className="text-xs font-medium text-gray-600">
                      Buying Price (NGN)
                    </Label>
                    <Input
                      id={`${productName}-buy`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={product.buyPrice || ''}
                      onChange={(e) => handlePriceChange(productName, 'buyPrice', parseFloat(e.target.value) || 0)}
                      className="h-10 text-sm border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`${productName}-sell`} className="text-xs font-medium text-gray-600">
                      Selling Price (NGN)
                    </Label>
                    <Input
                      id={`${productName}-sell`}
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={product.sellPrice || ''}
                      onChange={(e) => handlePriceChange(productName, 'sellPrice', parseFloat(e.target.value) || 0)}
                      className="h-10 text-sm border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        {selectedProducts.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Select at least one product to continue
          </p>
        )}
      </CardContent>
    </Card>
  );
}
