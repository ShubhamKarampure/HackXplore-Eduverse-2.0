import React, { useState } from 'react';
import { 
  FileDown, 
  UploadCloud 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import Input from '../../form/input/InputField';
import Button from '../../ui/button/Button';
import Label from '../../form/Label';

const ResourSection = ({ 
  resourceData, 
  onResourceUpload,
  isEditMode,
  selectedModule
}) => {
  const [resourceTitle, setResourceTitle] = useState(resourceData?.title || '');
  const [resourceFile, setResourceFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      
      onResourceUpload({
        url: mockUrl,
        title: resourceTitle || file.name,
        file: file  // Include the actual file for upload
      });

      setResourceFile(file);
    }
  };

  const renderResourceContent = () => {
    if (!isEditMode) {
      // View mode
      return selectedModule?.contents?.resource ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="font-medium">{selectedModule.contents.resource.title}</span>
            <Button 
              variant="outline"
              onClick={() => window.open(selectedModule.contents.resource.url, '_blank')}
            >
              Download
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">No resources available for this module.</p>
      );
    } else {
      // Upload mode
      return (
        <div className="space-y-4">
          <div>
            <Label>Resource Title</Label>
            <Input 
              type="text" 
              placeholder="Enter resource title" 
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col items-center justify-center w-full">
            <Label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 text-gray-500 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOCX, ZIP (MAX. 100MB)</p>
              </div>
              <input 
                type="file" 
                className="hidden"
                onChange={handleFileUpload}
              />
            </Label>
          </div>

          {resourceData?.url && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Current Resource: {resourceData.title || 'Uploaded Resource'}
              </p>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => onResourceUpload(null)}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileDown className="w-6 h-6 mr-3 text-green-500" />
          Course Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderResourceContent()}
      </CardContent>
    </Card>
  );
};

export default ResourSection;