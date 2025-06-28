import React, { useState } from "react";
import { Video, UploadCloud } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import Input from "../../form/input/InputField";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";
import { useAlert } from "@/context/AlertContext";

const VideoSection = ({ videoData, onVideoUpload, isEditMode, moduleData }) => {
  const [videoTitle, setVideoTitle] = useState(videoData?.title || "");
  const [videoFile, setVideoFile] = useState(null);
  const { showAlert, alertTypes } = useAlert();

  const renderVideo = () => {
    const videoUrl = moduleData?.contents?.video?.url;
    const videoTitle = moduleData?.contents?.video?.title;

    if (!videoUrl) return null;

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Video className="w-6 h-6 mr-3 text-blue-500" />
          {videoTitle}
        </h2>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
          <video controls className="w-full" src={videoUrl}>
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = URL.createObjectURL(file);
      onVideoUpload({
        url: mockUrl,
        title: videoTitle,
        file: file,
      });
      setVideoFile(file);
    }
  };

  return (
    <>
      {!isEditMode ? (
        renderVideo()
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <Video className="w-6 h-6 mr-3 text-blue-500" />
                <CardTitle className="m-0 p-0">Video Content</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Video Title</Label>
                <Input
                  type="text"
                  placeholder="Enter video title"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col items-center justify-center w-full">
                <Label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-10 h-10 text-gray-500 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      MP4, MOV, AVI (MAX. 1GB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileUpload}
                  />
                </Label>
              </div>

              {videoData?.url && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Current Video: {videoData.title || "Uploaded Video"}
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onVideoUpload(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default VideoSection;
