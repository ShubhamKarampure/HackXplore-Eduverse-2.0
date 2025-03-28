import React, { useState } from "react";
import { Video, UploadCloud,Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import Input from "../../form/input/InputField";
import Button from "../../ui/button/Button";
import Label from "../../form/Label";

const VideoSection = ({ videoData, onVideoUpload, isEditMode, selectedModule }) => {
  const [videoTitle, setVideoTitle] = useState(videoData?.title || "");
  const [videoFile, setVideoFile] = useState(null);

  const renderVideo = () => {
    const videoUrl = selectedModule?.contents?.video?.url;
    const videoTitle = selectedModule?.contents?.video?.title;
    const videoDuration = selectedModule?.contents?.video?.duration ?? 0;

    if (!videoUrl) return null;

    const isYouTubeUrl =
      videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Video className="w-6 h-6 mr-3 text-blue-500" />
          {videoTitle}
        </h2>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
          {isYouTubeUrl ? (
            <iframe
              width="100%"
              height="480"
              src={
                videoUrl
                  .replace("watch?v=", "embed/")
                  .replace("youtu.be/", "youtube.com/embed/")
                  .split("&")[0]
              }
              title={videoTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video controls className="w-full" src={videoUrl}>
              Your browser does not support the video tag.
            </video>
          )}
          <div className="p-4 flex items-center text-gray-600 dark:text-gray-400">
            <Clock className="w-5 h-5 mr-2" />
            <span>Duration: {Math.floor(videoDuration / 60)} minutes</span>
          </div>
        </div>
      </div>
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);

      // Simulate file upload and get URL
      const mockUrl = URL.createObjectURL(file);

      onVideoUpload({
        url: mockUrl,
        title: videoTitle || file.name,
        duration: 0, // You'd typically get this from the file metadata
      });
    }
  };

  return (
    <>
      {/* Video Section */}
      {!isEditMode ? (
        renderVideo()
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="w-6 h-6 mr-3 text-blue-500" />
              Video Content
            </CardTitle>
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
                  <Button variant="destructive" size="sm">
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
