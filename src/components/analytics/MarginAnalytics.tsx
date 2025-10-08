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

interface MarginAnalyticsProps {
  data: SubmissionItem[];
}

interface MarginStats {
  productName: string;
  count: number;
  avgMargin: number;
  minMargin: number;
  maxMargin: number;
  marginPercentage: number;
  profitableEntries: number;
  lossEntries: number;
  breakEvenEntries: number;
}

export function MarginAnalytics({ data }: MarginAnalyticsProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const calculateMarginStats = (): MarginStats[] => {
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

    // Calculate margin stats for each product
    const stats: MarginStats[] = [];
    productMap.forEach((products, productName) => {
      const margins = products.map((p) => p.sellPrice - p.buyPrice);
      const marginPercentages = products.map((p) => ((p.sellPrice - p.buyPrice) / p.buyPrice) * 100);

      const avgMargin = margins.reduce((a, b) => a + b, 0) / margins.length;
      const minMargin = Math.min(...margins);
      const maxMargin = Math.max(...margins);
      const avgMarginPercentage = marginPercentages.reduce((a, b) => a + b, 0) / marginPercentages.length;

      const profitableEntries = margins.filter(m => m > 0).length;
      const lossEntries = margins.filter(m => m < 0).length;
      const breakEvenEntries = margins.filter(m => m === 0).length;

      stats.push({
        productName,
        count: products.length,
        avgMargin,
        minMargin,
        maxMargin,
        marginPercentage: avgMarginPercentage,
        profitableEntries,
        lossEntries,
        breakEvenEntries,
      });
    });

    return stats.sort((a, b) => b.avgMargin - a.avgMargin);
  };

  const marginStats = calculateMarginStats();

  const getMarginColor = (margin: number) => {
    if (margin > 0) return "text-green-600 bg-green-100";
    if (margin < 0) return "text-red-600 bg-red-100";
    return "text-gray-600 bg-gray-100";
  };

  const getMarginPercentageColor = (percentage: number) => {
    if (percentage > 20) return "text-green-600 bg-green-100";
    if (percentage > 10) return "text-yellow-600 bg-yellow-100";
    if (percentage > 0) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getProfitabilityColor = (profitable: number, total: number) => {
    const percentage = (profitable / total) * 100;
    if (percentage >= 80) return "text-green-600 bg-green-100";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  // Calculate overall margin statistics
  const allMargins = data.flatMap(submission => 
    submission.items.map(item => item.sellPrice - item.buyPrice)
  );
  const overallAvgMargin = allMargins.reduce((a, b) => a + b, 0) / allMargins.length;
  const overallProfitable = allMargins.filter(m => m > 0).length;
  const overallLoss = allMargins.filter(m => m < 0).length;
  const overallBreakEven = allMargins.filter(m => m === 0).length;

  return (
    <div className="space-y-6">
      {/* Overall Margin Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getMarginColor(overallAvgMargin)}`}>
                {formatPrice(Math.round(overallAvgMargin))}
              </div>
              <div className="text-sm text-gray-500">Average Margin</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overallProfitable}</div>
              <div className="text-sm text-gray-500">Profitable Entries</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overallLoss}</div>
              <div className="text-sm text-gray-500">Loss Entries</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{overallBreakEven}</div>
              <div className="text-sm text-gray-500">Break-even Entries</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            Product Margin Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marginStats.map((product) => {
              const profitabilityPercentage = (product.profitableEntries / product.count) * 100;

              return (
                <div
                  key={product.productName}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{product.productName}</h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {product.count} entries
                      </Badge>
                      <Badge className={`text-xs ${getMarginColor(product.avgMargin)}`}>
                        {formatPrice(Math.round(product.avgMargin))} avg margin
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Margin Range */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Margin Range</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Min</div>
                          <div className={`font-medium ${getMarginColor(product.minMargin)}`}>
                            {formatPrice(product.minMargin)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Avg</div>
                          <div className={`font-medium ${getMarginColor(product.avgMargin)}`}>
                            {formatPrice(Math.round(product.avgMargin))}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Max</div>
                          <div className={`font-medium ${getMarginColor(product.maxMargin)}`}>
                            {formatPrice(product.maxMargin)}
                          </div>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getMarginPercentageColor(product.marginPercentage)}`}>
                        {product.marginPercentage.toFixed(1)}% avg margin
                      </Badge>
                    </div>

                    {/* Profitability Breakdown */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Profitability</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Profitable:</span>
                          <span className="text-green-600 font-medium">
                            {product.profitableEntries} ({profitabilityPercentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Loss:</span>
                          <span className="text-red-600 font-medium">
                            {product.lossEntries} ({((product.lossEntries / product.count) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Break-even:</span>
                          <span className="text-gray-600 font-medium">
                            {product.breakEvenEntries} ({((product.breakEvenEntries / product.count) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getProfitabilityColor(product.profitableEntries, product.count)}`}>
                        {profitabilityPercentage.toFixed(1)}% Profitable
                      </Badge>
                    </div>
                  </div>

                  {/* Margin Distribution Bar */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Margin Distribution</span>
                      <span>{formatPrice(product.minMargin)} to {formatPrice(product.maxMargin)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          product.avgMargin > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.abs(product.avgMargin) / Math.max(Math.abs(product.minMargin), Math.abs(product.maxMargin)) * 100)}%`
                        }}
                      ></div>
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
