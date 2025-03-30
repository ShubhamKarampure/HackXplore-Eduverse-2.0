'use client'

// components/ProjectSkeleton.jsx
import React from 'react';

const ProjectSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 h-full border border-gray-200 dark:border-gray-700">
      {/* Image placeholder */}
      <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-md mb-4 animate-pulse"></div>
      
      {/* Title placeholder */}
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse"></div>
      
      {/* Description placeholder */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 animate-pulse"></div>
      </div>
      
      {/* Tags placeholder */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="h-6 w-14 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
      
      {/* Footer placeholder */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="h-4 w-20 ml-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
      </div>
    </div>
  );
};

export default ProjectSkeleton;