"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProductPrice {
  productName: string;
  buyPrice: number;
  sellPrice: number;
}

interface SubmissionItem {
  id: string;
  customerName: string;
  customerPhone?: string;
  outletName: string;
  outletAddress: string;
  area: string;
  geo?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  items: ProductPrice[];
  collectedAt: string;
  day: string;
  clientMeta?: {
    userAgent: string;
    platform: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface PriceAnalyticsProps {
  data: SubmissionItem[];
}

interface ProductStats {
  productName: string;
  count: number;
  minBuyPrice: number;
  maxBuyPrice: number;
  avgBuyPrice: number;
  minSellPrice: number;
  maxSellPrice: number;
  avgSellPrice: number;
  avgMargin: number;
  marginRange: number;
}

export function PriceAnalytics({ data }: PriceAnalyticsProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const calculateProductStats = (): ProductStats[] => {
    const productMap = new Map<string, ProductPrice[]>();

    // Group all products by name
    data.forEach((submission) => {
      submission.items.forEach((item) => {
        if (!productMap.has(item.productName)) {
          productMap.set(item.productName, []);
        }
        productMap.get(item.productName)!.push(item);
      });
    });

    // Calculate stats for each product
    const stats: ProductStats[] = [];
    productMap.forEach((products, productName) => {
      const buyPrices = products.map((p) => p.buyPrice);
      const sellPrices = products.map((p) => p.sellPrice);
      const margins = products.map((p) => p.sellPrice - p.buyPrice);

      const minBuyPrice = Math.min(...buyPrices);
      const maxBuyPrice = Math.max(...buyPrices);
      const avgBuyPrice = buyPrices.reduce((a, b) => a + b, 0) / buyPrices.length;

      const minSellPrice = Math.min(...sellPrices);
      const maxSellPrice = Math.max(...sellPrices);
      const avgSellPrice = sellPrices.reduce((a, b) => a + b, 0) / sellPrices.length;

      const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
      const marginRange = Math.max(...margins) - Math.min(...margins);

      stats.push({
        productName,
        count: products.length,
        minBuyPrice,
        maxBuyPrice,
        avgBuyPrice,
        minSellPrice,
        maxSellPrice,
        avgSellPrice,
        avgMargin,
        marginRange,
      });
    });

    return stats.sort((a, b) => b.count - a.count);
  };

  const productStats = calculateProductStats();

  const getMarginColor = (margin: number) => {
    if (margin > 0) return "text-green-600 bg-green-100";
    if (margin < 0) return "text-red-600 bg-red-100";
    return "text-gray-600 bg-gray-100";
  };

  const getPriceVolatility = (min: number, max: number, avg: number) => {
    const range = max - min;
    const volatility = (range / avg) * 100;
    if (volatility > 50) return { label: "High", color: "text-red-600 bg-red-100" };
    if (volatility > 25) return { label: "Medium", color: "text-yellow-600 bg-yellow-100" };
    return { label: "Low", color: "text-green-600 bg-green-100" };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Product Price Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productStats.map((product) => {
              const buyVolatility = getPriceVolatility(
                product.minBuyPrice,
                product.maxBuyPrice,
                product.avgBuyPrice
              );
              const sellVolatility = getPriceVolatility(
                product.minSellPrice,
                product.maxSellPrice,
                product.avgSellPrice
              );

              return (
                <div
                  key={product.productName}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {product.productName}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {product.count} entries
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Buy Price Analysis */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                        Buy Price
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Min</div>
                          <div className="font-medium">{formatPrice(product.minBuyPrice)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg</div>
                          <div className="font-medium">{formatPrice(Math.round(product.avgBuyPrice))}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Max</div>
                          <div className="font-medium">{formatPrice(product.maxBuyPrice)}</div>
                        </div>
                      </div>
                      <Badge className={`text-xs ${buyVolatility.color}`}>
                        {buyVolatility.label} Volatility
                      </Badge>
                    </div>

                    {/* Sell Price Analysis */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        Sell Price
                      </h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Min</div>
                          <div className="font-medium">{formatPrice(product.minSellPrice)}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg</div>
                          <div className="font-medium">{formatPrice(Math.round(product.avgSellPrice))}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Max</div>
                          <div className="font-medium">{formatPrice(product.maxSellPrice)}</div>
                        </div>
                      </div>
                      <Badge className={`text-xs ${sellVolatility.color}`}>
                        {sellVolatility.label} Volatility
                      </Badge>
                    </div>
                  </div>

                  {/* Margin Analysis */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Profit Margin</h4>
                      <Badge className={`text-xs ${getMarginColor(product.avgMargin)}`}>
                        {formatPrice(Math.round(product.avgMargin))} avg
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Range: {formatPrice(Math.round(product.avgMargin - product.marginRange / 2))} - {formatPrice(Math.round(product.avgMargin + product.marginRange / 2))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
