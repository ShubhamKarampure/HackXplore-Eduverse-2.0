import PageBreadcrumb from "@/components/courses/dashboard/stats/common/PageBreadCrumb";
import VideosExample from "@/components/ui/video/VideosExample";
import React from "react";

export default function VideoPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Videos" />

      <VideosExample />
    </div>
  );
}
