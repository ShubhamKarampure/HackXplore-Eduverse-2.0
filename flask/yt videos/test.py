import requests
from dotenv import load_dotenv
import os
import yt_dlp
import glob

load_dotenv()
API_KEY = os.getenv('YOUTUBE_API_KEY')

def search_and_upload_youtube_video(search_query, module_id, max_results=1, output_dir='temp_videos/'):
    """
    Searches YouTube for a video, downloads it, and uploads it to the API.

    Args:
        search_query (str): The search query for YouTube.
        module_id (str): The module ID to upload the video to.
        max_results (int): The maximum number of results to return from the search.
        output_dir (str): Temporary directory to save the downloaded video.

    Returns:
        dict: API response after uploading
    """
    # Create temp directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={search_query}&type=video&maxResults={max_results}&key={API_KEY}"
    response = requests.get(url).json()
    
    if "items" not in response or not response["items"]:
        return {"success": False, "message": "No videos found for the query"}
    
    # Get first video
    item = response["items"][0]
    title = item["snippet"]["title"]
    video_id = item["id"]["videoId"]
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    print(f"Found video: {title}\n{video_url}")
    
    # Download the video
    ydl_opts = {
        'format': 'bestvideo[height<=240]+bestaudio/best[height<=240]',  # Limit to 240p
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),  # Save in specified directory
        'merge_output_format': 'mp4',  # Ensure output is MP4
        'quiet': True,  # Reduce console output
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            video_filename = ydl.prepare_filename(info)
        
        print(f"Downloaded video to: {video_filename}")
        
        # Check if the file exists (could be .mp4 or other extension)
        if not os.path.exists(video_filename) and video_filename.endswith('.webm'):
            # Try common alternative extensions
            mp4_filename = video_filename.replace('.webm', '.mp4')
            if os.path.exists(mp4_filename):
                video_filename = mp4_filename
        
        # If still can't find the exact file, look for files with similar name
        if not os.path.exists(video_filename):
            base_name = os.path.splitext(os.path.basename(video_filename))[0]
            matching_files = glob.glob(os.path.join(output_dir, f"{base_name}.*"))
            if matching_files:
                video_filename = matching_files[0]
        
        print(f"Uploading file: {video_filename}")
        
        # Upload the video to the API
        upload_url = f"http://127.0.0.1:4000/api/v1/user/modules/{module_id}"
        
        with open(video_filename, 'rb') as video_file:
            files = {'video': (os.path.basename(video_filename), video_file, 'video/mp4')}
            upload_response = requests.post(upload_url, files=files)
        
        # Clean up: remove the temporary video file
        try:
            os.remove(video_filename)
            print(f"Temporary file removed: {video_filename}")
        except Exception as e:
            print(f"Warning: Could not remove temporary file: {e}")
        
        return upload_response.json()
    
    except Exception as e:
        return {"success": False, "message": f"Error: {str(e)}"}
    
    finally:
        # Ensure temp files are cleaned up
        try:
            for file in glob.glob(os.path.join(output_dir, '*')):
                os.remove(file)
            print(f"All temporary files cleaned up in {output_dir}")
        except Exception as e:
            print(f"Warning: Could not clean up some temporary files: {e}")

def download_youtube_video(search_query, max_results=1, output_dir='videos/'):
    """
    Original function that searches YouTube for a video and downloads it in a specified resolution.

    Args:
        search_query (str): The search query for YouTube.
        max_results (int): The maximum number of results to return from the search.
        output_dir (str): The directory to save the downloaded video.

    Returns:
        None
    """
    url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={search_query}&type=video&maxResults={max_results}&key={API_KEY}"
    response = requests.get(url).json()

    for item in response["items"]:
        title = item["snippet"]["title"]
        video_id = item["id"]["videoId"]
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        print(f"{title}\n{video_url}\n")

        ydl_opts = {
            'format': 'bestvideo[height<=240]+bestaudio/best[height<=240]',  # Limit to 240p
            'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),  # Save in specified directory
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([video_url])

if __name__ == '__main__':
    SEARCH_QUERY = "Node tutorial"
    MODULE_ID = "67e7b04c792f6aa80daff4f1"  # Replace with your actual module ID
    
    # Use the new function that searches, downloads, and uploads
    result = search_and_upload_youtube_video(SEARCH_QUERY, MODULE_ID)
    print(f"Upload result: {result}")
    
    # Or use the original function if you just want to download
    # download_youtube_video(SEARCH_QUERY)
