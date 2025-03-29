import BarChartOne from "@/components/charts/bar/BarChartOne";
import ComponentCard from "@/components/courses/dashboard/stats/common/ComponentCard";
import PageBreadcrumb from "@/components/courses/dashboard/stats/common/PageBreadCrumb";
import React from "react";

export default function page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Bar Chart" />
      <div className="space-y-6">
        <ComponentCard title="Bar Chart 1">
          <BarChartOne />
        </ComponentCard>
      </div>
    </div>
  );
}
