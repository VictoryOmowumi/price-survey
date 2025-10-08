"use client";

import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ loading, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sbclogo.png" alt="SBC Logo" className="h-10 w-auto" />
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={onRefresh}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2 border-gray-300 hover:bg-gray-50"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
