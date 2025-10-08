"use client";

import { Card, CardContent } from "@/components/ui/card";

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
  items: Array<{
    productName: string;
    buyPrice: number;
    sellPrice: number;
  }>;
  collectedAt: string;
  day: string;
  clientMeta?: {
    userAgent: string;
    platform: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface StatsCardsProps {
  data: SubmissionItem[];
}

export function StatsCards({ data }: StatsCardsProps) {
  const totalSubmissions = data.length;
  const withLocation = data.filter((item) => item.geo).length;
  const uniqueAreas = new Set(data.map((item) => item.area)).size;
  const totalProducts = data.reduce((total, item) => total + item.items.length, 0);
  const locationPercentage = totalSubmissions > 0 ? Math.round((withLocation / totalSubmissions) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col-reverse gap-3 md:gap-0 md:flex-row md:items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {totalSubmissions}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                Total Submissions
              </div>
              <div className="text-xs text-gray-500">
                All survey responses
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col-reverse gap-3 md:gap-0 md:flex-row md:items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {withLocation}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                With Location
              </div>
              <div className="text-xs text-gray-500">
                {locationPercentage}% of total
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
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
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col-reverse gap-3 md:gap-0 md:flex-row md:items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {uniqueAreas}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                Unique Areas
              </div>
              <div className="text-xs text-gray-500">LGAs covered</div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-col-reverse gap-3 md:gap-0 md:flex-row md:items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {totalProducts}
              </div>
              <div className="text-sm font-semibold text-gray-700 mb-1">
                Total Products
              </div>
              <div className="text-xs text-gray-500">Items surveyed</div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
