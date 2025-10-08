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

interface GeographicAnalyticsProps {
  data: SubmissionItem[];
}

interface AreaStats {
  area: string;
  submissionCount: number;
  outletCount: number;
  totalProducts: number;
  avgProductsPerSubmission: number;
  locationCoverage: number;
  topProducts: Array<{
    productName: string;
    count: number;
    avgBuyPrice: number;
    avgSellPrice: number;
  }>;
}

export function GeographicAnalytics({ data }: GeographicAnalyticsProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const calculateAreaStats = (): AreaStats[] => {
    const areaMap = new Map<string, {
      submissions: SubmissionItem[];
      outlets: Set<string>;
      products: ProductPrice[];
    }>();

    // Group data by area
    data.forEach((submission) => {
      if (!areaMap.has(submission.area)) {
        areaMap.set(submission.area, {
          submissions: [],
          outlets: new Set(),
          products: [],
        });
      }

      const areaData = areaMap.get(submission.area)!;
      areaData.submissions.push(submission);
      areaData.outlets.add(submission.outletName);
      areaData.products.push(...submission.items);
    });

    // Calculate stats for each area
    const stats: AreaStats[] = [];
    areaMap.forEach((areaData, area) => {
      const submissionCount = areaData.submissions.length;
      const outletCount = areaData.outlets.size;
      const totalProducts = areaData.products.length;
      const avgProductsPerSubmission = totalProducts / submissionCount;
      const locationCoverage = (areaData.submissions.filter(s => s.geo).length / submissionCount) * 100;

      // Calculate top products for this area
      const productMap = new Map<string, ProductPrice[]>();
      areaData.products.forEach((product) => {
        if (!productMap.has(product.productName)) {
          productMap.set(product.productName, []);
        }
        productMap.get(product.productName)!.push(product);
      });

      const topProducts = Array.from(productMap.entries())
        .map(([productName, products]) => ({
          productName,
          count: products.length,
          avgBuyPrice: products.reduce((sum, p) => sum + p.buyPrice, 0) / products.length,
          avgSellPrice: products.reduce((sum, p) => sum + p.sellPrice, 0) / products.length,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      stats.push({
        area,
        submissionCount,
        outletCount,
        totalProducts,
        avgProductsPerSubmission,
        locationCoverage,
        topProducts,
      });
    });

    return stats.sort((a, b) => b.submissionCount - a.submissionCount);
  };

  const areaStats = calculateAreaStats();

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return "text-green-600 bg-green-100";
    if (coverage >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getActivityLevel = (count: number) => {
    if (count >= 20) return { label: "High", color: "text-green-600 bg-green-100" };
    if (count >= 10) return { label: "Medium", color: "text-yellow-600 bg-yellow-100" };
    return { label: "Low", color: "text-red-600 bg-red-100" };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Geographic Distribution Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {areaStats.map((area) => {
              const activityLevel = getActivityLevel(area.submissionCount);

              return (
                <div
                  key={area.area}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{area.area}</h3>
                    <div className="flex gap-2">
                      <Badge className={`text-xs ${activityLevel.color}`}>
                        {activityLevel.label} Activity
                      </Badge>
                      <Badge className={`text-xs ${getCoverageColor(area.locationCoverage)}`}>
                        {Math.round(area.locationCoverage)}% Location Coverage
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{area.submissionCount}</div>
                      <div className="text-xs text-gray-500">Submissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{area.outletCount}</div>
                      <div className="text-xs text-gray-500">Outlets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{area.totalProducts}</div>
                      <div className="text-xs text-gray-500">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {area.avgProductsPerSubmission.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">Avg/Submission</div>
                    </div>
                  </div>

                  {/* Top Products in this Area */}
                  <div className="pt-3 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Top Products</h4>
                    <div className="flex flex-wrap gap-2">
                      {area.topProducts.map((product) => (
                        <div
                          key={product.productName}
                          className="bg-gray-50 rounded-lg px-3 py-2 text-xs"
                        >
                          <div className="font-medium text-gray-900">{product.productName}</div>
                          <div className="text-gray-500">
                            {product.count} entries • Avg: {formatPrice(Math.round(product.avgBuyPrice))} / {formatPrice(Math.round(product.avgSellPrice))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{areaStats.length}</div>
              <div className="text-sm text-gray-500">Areas Covered</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(areaStats.reduce((sum, area) => sum + area.locationCoverage, 0) / areaStats.length)}%
              </div>
              <div className="text-sm text-gray-500">Avg Location Coverage</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(data.map(d => d.outletName)).size}
              </div>
              <div className="text-sm text-gray-500">Total Outlets</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
