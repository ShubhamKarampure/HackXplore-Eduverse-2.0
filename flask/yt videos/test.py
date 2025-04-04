import requests
from dotenv import load_dotenv
import os
import yt_dlp
import glob

load_dotenv()
API_KEY = os.getenv('YOUTUBE_API_KEY')

def send_youtube_url_to_api(search_query, module_id, max_results=1):
    """
    Searches YouTube for a video and sends the URL to the API without downloading.

    Args:
        search_query (str): The search query for YouTube.
        module_id (str): The module ID to update with the YouTube URL.
        max_results (int): The maximum number of results to return from the search.

    Returns:
        dict: API response after sending YouTube URL
    """
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
    
    # Send the YouTube URL to the API
    api_url = f"http://127.0.0.1:4000/api/v1/user/modules/{module_id}"
    
    try:
        # Prepare the data payload with the YouTube URL
        payload = {
            'youtube_video_url': video_url,
            'title': title  # Include the video title if your API expects it
        }
        
        # Add any required headers
        headers = {
            'Content-Type': 'application/json',
            # Add authorization if needed
            # 'Authorization': 'Bearer your_token_here',
        }
        
        print(f"Sending YouTube URL to API: {video_url}")
        response = requests.put(api_url, json=payload, headers=headers)
        
        # Check response status
        print(f"API Response Status: {response.status_code}")
        print(f"API Response Text: {response.text[:200]}...")  # Print first 200 chars
        
        # Try to parse JSON response, handle errors gracefully
        try:
            result = response.json()
            return result
        except ValueError:
            return {
                "success": False, 
                "message": f"API returned non-JSON response (status {response.status_code})",
                "raw_response": response.text[:500]  # Include part of raw response for debugging
            }
    except Exception as e:
        return {"success": False, "message": f"API request error: {str(e)}"}

if __name__ == '__main__':
    SEARCH_QUERY = "Node tutorial in 5 mins"    
    MODULE_ID = "67e7b04c792f6aa80daff4f1"  # Replace with your actual module ID
    
    
    # Or use the original function if you just want to download
    # download_youtube_video(SEARCH_QUERY)
    
    # Use the new function that searches and sends the YouTube URL
    result = send_youtube_url_to_api(SEARCH_QUERY, MODULE_ID)
    print(f"Result: {result}")
