"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FilterPanel } from "@/components/dashboard/FilterPanel";
import { DataTable } from "@/components/dashboard/DataTable";
import { PriceAnalytics } from "@/components/analytics/PriceAnalytics";
import { GeographicAnalytics } from "@/components/analytics/GeographicAnalytics";
import { MarginAnalytics } from "@/components/analytics/MarginAnalytics";
import { GeneralInsights } from "@/components/analytics/GeneralInsights";

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

interface ApiResponse {
  ok: boolean;
  items: SubmissionItem[];
  total: number;
  returned: number;
  hasMore: boolean;
}

interface FilterState {
  from: string;
  to: string;
  area: string;
  outletName: string;
  hasGeo: string;
}

type ViewMode = "data" | "analytics";

export default function Dashboard() {
  const [data, setData] = useState<SubmissionItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>("data");
  const [filters, setFilters] = useState<FilterState>({
    from: "",
    to: "",
    area: "",
    outletName: "",
    hasGeo: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.area) params.append("area", filters.area);
      if (filters.outletName) params.append("outletName", filters.outletName);
      if (filters.hasGeo) params.append("hasGeo", filters.hasGeo);

      const response = await fetch(`/api/submissions?${params.toString()}`);
      const result: ApiResponse = await response.json();

      if (result.ok) {
        setData(result.items);
        setTotalCount(result.total);
      } else {
        toast.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const exportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);
      if (filters.area) params.append("area", filters.area);
      if (filters.outletName) params.append("outletName", filters.outletName);
      if (filters.hasGeo) params.append("hasGeo", filters.hasGeo);

      const response = await fetch(`/api/submissions.csv?${params.toString()}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `price-survey-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("CSV exported successfully!");
      } else {
        toast.error("Failed to export CSV");
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Error exporting CSV");
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      from: "",
      to: "",
      area: "",
      outletName: "",
      hasGeo: "",
    });
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <DashboardHeader loading={loading} onRefresh={fetchData} />

        {/* View Mode Toggle */}
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setViewMode("data")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "data"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Data View
            </button>
            <button
              onClick={() => setViewMode("analytics")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "analytics"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Analytics View
            </button>
          </div>
        </div>
        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onApplyFilters={fetchData}
          onClearFilters={clearFilters}
          onExportCSV={exportCSV}
          exporting={exporting}
        />

        {/* Stats Cards */}
        {/* <StatsCards data={data} /> */}
        <GeneralInsights data={data} />

        {/* Main Content */}
        {viewMode === "data" ? (
          <DataTable
            data={data}
            loading={loading}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={goToPage}
            onPreviousPage={goToPreviousPage}
            onNextPage={goToNextPage}
          />
        ) : (
          <div className="space-y-8">
            <PriceAnalytics data={data} />
            <GeographicAnalytics data={data} />
            <MarginAnalytics data={data} />
          </div>
        )}
      </div>
    </div>
  );
}
