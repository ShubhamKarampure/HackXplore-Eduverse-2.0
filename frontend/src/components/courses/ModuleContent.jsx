"use client";

import { getContentTypeIcon } from "@/lib/iconHelper";

const ModuleContent = ({ selectedModule, selectedContent, setSelectedContent }) => {
  if (!selectedModule)
    return (
      <div className="flex-grow flex items-center justify-center text-gray-500">
        Select a module to view its contents
      </div>
    );

  return (
    <div className="flex-grow p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedModule.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {selectedModule.description}
        </p>
      </div>

      {/* Module Contents */}
      <div className="space-y-4">
        {selectedModule.contents?.map((content, index) => (
          <button
            key={index}
            onClick={() => setSelectedContent(content)}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-300 ${
              selectedContent === content
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <div className="flex items-center">
              {getContentTypeIcon(content.type)}
              <span className="ml-3 font-medium">{content.title}</span>
            </div>
            {content.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {content.description}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Content Details */}
      {selectedContent && (
        <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {selectedContent.title}
          </h3>
          {selectedContent.type === "video" && selectedContent.resource?.url && (
            <video controls className="w-full rounded-lg" src={selectedContent.resource.url}>
              Your browser does not support the video tag.
            </video>
          )}
          {selectedContent.description && (
            <p className="mt-4 text-gray-700 dark:text-gray-300">{selectedContent.description}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ModuleContent;
