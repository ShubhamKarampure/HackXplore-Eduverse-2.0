import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Youtube } from "lucide-react";

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YT_API;

const YoutubeVideo = ({ moduleData }) => {
    const [youtubeVideos, setYoutubeVideos] = useState([]);
    const query = moduleData?.title || "";

    // Commenting out to limit rate
    // useEffect(() => {
    //     if (!query) return;
    //     const fetchYTvideo = async () => {
    //         const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
    //             query
    //         )}&key=${YOUTUBE_API_KEY}&type=video&maxResults=6`;
    //         try {
    //             const response = await fetch(url);
    //             if (!response.ok) {
    //                 const errorData = await response.json();
    //                 throw new Error(
    //                     errorData.error?.message || "Failed to fetch videos from YouTube."
    //                 );
    //             }
    //             const data = await response.json();
    //             setYoutubeVideos(data.items || []);
    //         } catch (err) {
    //             console.log("Youtube Api error : ", err);
    //         }
    //     };
    //     fetchYTvideo();
    // }, [query]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Youtube className="w-6 h-6 mr-3 text-red-500" />
                    Relevant Youtube Videos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-nowrap gap-4 overflow-x-auto pb-6">
                    {youtubeVideos.length === 0 && (
                        <span className="text-gray-500">No videos found.</span>
                    )}
                    {youtubeVideos.map((video) => (
                        <a
                            key={video.id.videoId}
                            href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-[250px] max-w-xs block"
                        >
                            <img
                                src={video.snippet.thumbnails.medium.url}
                                alt={video.snippet.title}
                                className="rounded-lg w-full"
                            />
                            <div className="mt-2 font-semibold text-sm line-clamp-2">
                                {video.snippet.title}
                            </div>
                            <div className="text-xs text-gray-500">
                                {video.snippet.channelTitle}
                            </div>
                        </a>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default YoutubeVideo;
