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

interface GeneralInsightsProps {
  data: SubmissionItem[];
}

export function GeneralInsights({ data }: GeneralInsightsProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const calculateInsights = () => {
    if (data.length === 0) {
      return {
        totalSubmissions: 0,
        totalProducts: 0,
        uniqueAreas: 0,
        uniqueOutlets: 0,
        locationCoverage: 0,
        avgProductsPerSubmission: 0,
        mostPopularProduct: null,
        leastPopularProduct: null,
        highestMarginProduct: null,
        lowestMarginProduct: null,
        mostActiveArea: null,
        leastActiveArea: null,
        avgBuyPrice: 0,
        avgSellPrice: 0,
        avgMargin: 0,
        totalMargin: 0,
        profitableEntries: 0,
        lossEntries: 0,
        breakEvenEntries: 0,
      };
    }

    // Basic counts
    const totalSubmissions = data.length;
    const totalProducts = data.reduce((sum, item) => sum + item.items.length, 0);
    const uniqueAreas = new Set(data.map(item => item.area)).size;
    const uniqueOutlets = new Set(data.map(item => item.outletName)).size;
    const locationCoverage = (data.filter(item => item.geo).length / totalSubmissions) * 100;
    const avgProductsPerSubmission = totalProducts / totalSubmissions;

    // Product analysis
    const productMap = new Map<string, { count: number; margins: number[]; buyPrices: number[]; sellPrices: number[] }>();
    
    data.forEach(submission => {
      submission.items.forEach(item => {
        if (!productMap.has(item.productName)) {
          productMap.set(item.productName, { count: 0, margins: [], buyPrices: [], sellPrices: [] });
        }
        const product = productMap.get(item.productName)!;
        product.count++;
        product.margins.push(item.sellPrice - item.buyPrice);
        product.buyPrices.push(item.buyPrice);
        product.sellPrices.push(item.sellPrice);
      });
    });

    // Most/least popular products
    const sortedByPopularity = Array.from(productMap.entries()).sort((a, b) => b[1].count - a[1].count);
    const mostPopularProduct = sortedByPopularity[0] ? {
      name: sortedByPopularity[0][0],
      count: sortedByPopularity[0][1].count,
      avgBuyPrice: sortedByPopularity[0][1].buyPrices.reduce((a, b) => a + b, 0) / sortedByPopularity[0][1].buyPrices.length,
      avgSellPrice: sortedByPopularity[0][1].sellPrices.reduce((a, b) => a + b, 0) / sortedByPopularity[0][1].sellPrices.length,
    } : null;
    
    const leastPopularProduct = sortedByPopularity[sortedByPopularity.length - 1] ? {
      name: sortedByPopularity[sortedByPopularity.length - 1][0],
      count: sortedByPopularity[sortedByPopularity.length - 1][1].count,
      avgBuyPrice: sortedByPopularity[sortedByPopularity.length - 1][1].buyPrices.reduce((a, b) => a + b, 0) / sortedByPopularity[sortedByPopularity.length - 1][1].buyPrices.length,
      avgSellPrice: sortedByPopularity[sortedByPopularity.length - 1][1].sellPrices.reduce((a, b) => a + b, 0) / sortedByPopularity[sortedByPopularity.length - 1][1].sellPrices.length,
    } : null;

    // Margin analysis
    const sortedByMargin = Array.from(productMap.entries()).sort((a, b) => {
      const avgMarginA = a[1].margins.reduce((sum, margin) => sum + margin, 0) / a[1].margins.length;
      const avgMarginB = b[1].margins.reduce((sum, margin) => sum + margin, 0) / b[1].margins.length;
      return avgMarginB - avgMarginA;
    });

    const highestMarginProduct = sortedByMargin[0] ? {
      name: sortedByMargin[0][0],
      avgMargin: sortedByMargin[0][1].margins.reduce((sum, margin) => sum + margin, 0) / sortedByMargin[0][1].margins.length,
    } : null;

    const lowestMarginProduct = sortedByMargin[sortedByMargin.length - 1] ? {
      name: sortedByMargin[sortedByMargin.length - 1][0],
      avgMargin: sortedByMargin[sortedByMargin.length - 1][1].margins.reduce((sum, margin) => sum + margin, 0) / sortedByMargin[sortedByMargin.length - 1][1].margins.length,
    } : null;

    // Area analysis
    const areaMap = new Map<string, number>();
    data.forEach(item => {
      areaMap.set(item.area, (areaMap.get(item.area) || 0) + 1);
    });

    const sortedAreas = Array.from(areaMap.entries()).sort((a, b) => b[1] - a[1]);
    const mostActiveArea = sortedAreas[0] ? { name: sortedAreas[0][0], count: sortedAreas[0][1] } : null;
    const leastActiveArea = sortedAreas[sortedAreas.length - 1] ? { name: sortedAreas[sortedAreas.length - 1][0], count: sortedAreas[sortedAreas.length - 1][1] } : null;

    // Overall price and margin analysis
    const allBuyPrices = data.flatMap(item => item.items.map(product => product.buyPrice));
    const allSellPrices = data.flatMap(item => item.items.map(product => product.sellPrice));
    const allMargins = data.flatMap(item => item.items.map(product => product.sellPrice - product.buyPrice));

    const avgBuyPrice = allBuyPrices.reduce((sum, price) => sum + price, 0) / allBuyPrices.length;
    const avgSellPrice = allSellPrices.reduce((sum, price) => sum + price, 0) / allSellPrices.length;
    const avgMargin = allMargins.reduce((sum, margin) => sum + margin, 0) / allMargins.length;
    const totalMargin = allMargins.reduce((sum, margin) => sum + margin, 0);

    const profitableEntries = allMargins.filter(margin => margin > 0).length;
    const lossEntries = allMargins.filter(margin => margin < 0).length;
    const breakEvenEntries = allMargins.filter(margin => margin === 0).length;

    return {
      totalSubmissions,
      totalProducts,
      uniqueAreas,
      uniqueOutlets,
      locationCoverage,
      avgProductsPerSubmission,
      mostPopularProduct,
      leastPopularProduct,
      highestMarginProduct,
      lowestMarginProduct,
      mostActiveArea,
      leastActiveArea,
      avgBuyPrice,
      avgSellPrice,
      avgMargin,
      totalMargin,
      profitableEntries,
      lossEntries,
      breakEvenEntries,
    };
  };

  const insights = calculateInsights();

  const getInsightColor = (value: number, type: 'positive' | 'negative' | 'neutral' = 'neutral') => {
    if (type === 'positive') {
      return value > 0 ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
    }
    if (type === 'negative') {
      return value < 0 ? "text-red-600 bg-red-100" : "text-green-600 bg-green-100";
    }
    return "text-blue-600 bg-blue-100";
  };

  if (data.length === 0) {
    return (
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
            General Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-2">No data available</p>
            <p className="text-sm text-gray-500">Apply filters or check your data source to see insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
          General Insights Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{insights.totalSubmissions}</div>
              <div className="text-sm text-gray-600">Total Submissions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{insights.totalProducts}</div>
              <div className="text-sm text-gray-600">Products Surveyed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{insights.uniqueAreas}</div>
              <div className="text-sm text-gray-600">Areas Covered</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{insights.uniqueOutlets}</div>
              <div className="text-sm text-gray-600">Unique Outlets</div>
            </div>
          </div>

          {/* Market Overview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Market Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Average Buy Price</div>
                <div className="font-semibold text-lg">{formatPrice(Math.round(insights.avgBuyPrice))}</div>
              </div>
              <div>
                <div className="text-gray-600">Average Sell Price</div>
                <div className="font-semibold text-lg">{formatPrice(Math.round(insights.avgSellPrice))}</div>
              </div>
              <div>
                <div className="text-gray-600">Average Margin</div>
                <div className={`font-semibold text-lg ${getInsightColor(insights.avgMargin, 'positive')}`}>
                  {formatPrice(Math.round(insights.avgMargin))}
                </div>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">Top Performers</h3>
              <div className="space-y-2 text-sm">
                {insights.mostPopularProduct && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Most Popular:</span>
                    <span className="font-medium">{insights.mostPopularProduct.name} ({insights.mostPopularProduct.count} entries)</span>
                  </div>
                )}
                {insights.highestMarginProduct && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Highest Margin:</span>
                    <span className="font-medium">{insights.highestMarginProduct.name} ({formatPrice(Math.round(insights.highestMarginProduct.avgMargin))})</span>
                  </div>
                )}
                {insights.mostActiveArea && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Most Active Area:</span>
                    <span className="font-medium">{insights.mostActiveArea.name} ({insights.mostActiveArea.count} submissions)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-3">Areas for Improvement</h3>
              <div className="space-y-2 text-sm">
                {insights.leastPopularProduct && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Least Popular:</span>
                    <span className="font-medium">{insights.leastPopularProduct.name} ({insights.leastPopularProduct.count} entries)</span>
                  </div>
                )}
                {insights.lowestMarginProduct && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lowest Margin:</span>
                    <span className="font-medium">{insights.lowestMarginProduct.name} ({formatPrice(Math.round(insights.lowestMarginProduct.avgMargin))})</span>
                  </div>
                )}
                {insights.leastActiveArea && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Least Active Area:</span>
                    <span className="font-medium">{insights.leastActiveArea.name} ({insights.leastActiveArea.count} submissions)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Quality & Profitability */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-3">Data Quality</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Location Coverage:</span>
                  <Badge className={insights.locationCoverage >= 80 ? "bg-green-100 text-green-800" : insights.locationCoverage >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                    {Math.round(insights.locationCoverage)}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Products/Submission:</span>
                  <span className="font-medium">{insights.avgProductsPerSubmission.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-3">Profitability Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profitable Entries:</span>
                  <span className="font-medium text-green-600">{insights.profitableEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loss Entries:</span>
                  <span className="font-medium text-red-600">{insights.lossEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Break-even:</span>
                  <span className="font-medium text-gray-600">{insights.breakEvenEntries}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insights Text */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Key Insights</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p>
                • Your survey covers <strong>{insights.uniqueAreas} areas</strong> with <strong>{insights.uniqueOutlets} unique outlets</strong>, 
                showing {insights.locationCoverage >= 80 ? "excellent" : insights.locationCoverage >= 50 ? "good" : "room for improvement in"} location data coverage.
              </p>
              <p>
                • The market shows an average margin of <strong>{formatPrice(Math.round(insights.avgMargin))}</strong> per product, 
                with <strong>{insights.profitableEntries} profitable entries</strong> out of {insights.totalProducts} total product entries.
              </p>
              {insights.mostPopularProduct && (
                <p>
                  • <strong>{insights.mostPopularProduct.name}</strong> is your most surveyed product with {insights.mostPopularProduct.count} entries, 
                  while <strong>{insights.mostActiveArea?.name}</strong> shows the highest survey activity.
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
