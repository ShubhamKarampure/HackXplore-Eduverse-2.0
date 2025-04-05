import React, { useState } from "react";
import { Video, UploadCloud, Clock } from "lucide-react";
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
    const youtubeVideoUrl = selectedModule?.contents?.video?.youtube_video_url;
   
    if (!videoUrl) return null;

    const isYouTubeUrl = youtubeVideoUrl!== null && youtubeVideoUrl !== undefined && youtubeVideoUrl !== "" && youtubeVideoUrl !== "null" && youtubeVideoUrl !== "undefined";

    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Video className="w-6 h-6 mr-3 text-blue-500" />
          {videoTitle}
        </h2>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-md">
          {isYouTubeUrl ? (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={
                  youtubeVideoUrl
                    .replace("watch?v=", "embed/")
                    .replace("youtu.be/", "youtube.com/embed/")
                    .split("&")[0]
                }
                title={videoTitle}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video controls className="w-full" src={videoUrl}>
              Your browser does not support the video tag.
            </video>
          )}
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
        file: file  // Include the actual file for upload
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