"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const LAGOS_LGAS = [
  "Agege",
  "Ajeromi-Ifelodun",
  "Alimosho",
  "Amuwo-Odofin",
  "Apapa",
  "Badagry",
  "Epe",
  "Eti-Osa",
  "Ibeju-Lekki",
  "Ifako-Ijaiye",
  "Ikeja",
  "Ikorodu",
  "Kosofe",
  "Lagos Island",
  "Lagos Mainland",
  "Mushin",
  "Ojo",
  "Oshodi-Isolo",
  "Shomolu",
  "Surulere",
];

interface FilterState {
  from: string;
  to: string;
  area: string;
  outletName: string;
  hasGeo: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  onExportCSV: () => void;
  exporting: boolean;
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  onExportCSV,
  exporting,
}: FilterPanelProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <Card className="border border-blue-200 bg-blue-50 !shadow-none !pt-0 pb-3">
      <CardHeader
        className="cursor-pointer transition-colors"
        onClick={() => setFiltersExpanded(!filtersExpanded)}
      >
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-3">
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Filters
            </CardTitle>
            {hasActiveFilters && (
              <Badge className="bg-blue-100 text-blue-800 border-0 px-2 py-1 text-xs">
                Active
              </Badge>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              filtersExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </CardHeader>
      {filtersExpanded && (
        <CardContent className="">
          <div className="space-y-6">
            {/* Date Range Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Date Range
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="from"
                    className="text-sm font-medium text-gray-700"
                  >
                    From Date
                  </Label>
                  <Input
                    id="from"
                    type="date"
                    value={filters.from}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, from: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="to"
                    className="text-sm font-medium text-gray-700"
                  >
                    To Date
                  </Label>
                  <Input
                    id="to"
                    type="date"
                    value={filters.to}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, to: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Location & Outlet Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-600"
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
                Location & Outlet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="area"
                    className="text-sm font-medium text-gray-700"
                  >
                    Area/LGA
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, area: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {LAGOS_LGAS.map((lga) => (
                        <SelectItem key={lga} value={lga}>
                          {lga}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="outletName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Outlet Name
                  </Label>
                  <Input
                    id="outletName"
                    placeholder="Search outlet name"
                    value={filters.outletName}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, outletName: e.target.value })
                    }
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="hasGeo"
                    className="text-sm font-medium text-gray-700"
                  >
                    Location Data
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, hasGeo: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All submissions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">With Location</SelectItem>
                      <SelectItem value="false">Without Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={onApplyFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Apply Filters
              </Button>
              <Button
                onClick={onClearFilters}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Clear Filters
              </Button>
              <Button
                onClick={onExportCSV}
                disabled={exporting}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {exporting ? "Exporting..." : "Export CSV"}
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
