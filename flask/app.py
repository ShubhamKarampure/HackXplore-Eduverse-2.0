import os
from flask import Flask, request, jsonify
from groq import Groq
import requests
from PyPDF2 import PdfReader
from io import BytesIO
import re
import json
from dotenv import load_dotenv  # Import dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# Retrieve API key from environment variables
groq_api_key = os.getenv("GROQ_API_KEY")

# Ensure API key is set
if not groq_api_key:
    raise ValueError("GROQ_API_KEY is not set in the .env file")

# Initialize Groq client with API key
client = Groq(api_key=groq_api_key)

@app.route('/modules', methods=['POST'])
def roadmap():
    data = request.get_json()

    # Check if required fields are present
    if not data or 'description' not in data:
        return jsonify({"error": "Missing 'description' in the request."}), 400

    text = data['description']
    
    # Create a simplified prompt with fewer modules
    prompt = f"""
You are a tutor of a course. Generate a segregate the course into proper module based on this description {text}

Return the result as valid JSON with an array named "modules" containing 8 module objects. Each module should strictly follow this format:
{{
  "modules": [
    {{
      "title": "Module Title" (In title no need to mention module.),
      "description": "Module description.",
      "order": 1,
    }}
  ]
}}

Important: Return only valid JSON with exactly 8 modules. 
"""

    # Create a completion request with adjusted parameters
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,  # Lower temperature for more deterministic output
        max_tokens=4000,  # Increase token limit
        top_p=0.9,
        stream=False,
        response_format={"type": "json_object"},
        stop=None,
    )
    message_content = completion.choices[0].message.content
        
    # If the content is in JSON format, parse it
    try:
        json_response = json.loads(message_content)
        return jsonify(json_response)
    except json.JSONDecodeError:
        # Return both the error and the attempted response for debugging
        return jsonify({
            "error": "Response is not valid JSON.",
            "attempted_response": message_content
        }), 500

# GRADE API 
@app.route('/grade', methods=['POST'])
def grade():
    data = request.get_json()

    # Check if required fields are present
    if not data or 'pdf_url' not in data or 'criteria' not in data:
        return jsonify({"error": "Missing 'pdf_url' or 'criteria' in the request."}), 400
    pdf_url = data['pdf_url']
    print(pdf_url)
    criteria = data['criteria']

    # Download the PDF from the given URL

    try:
        # Download the PDF content
        response = requests.get(pdf_url)
        response.raise_for_status()  # Ensure the request was successful
        
        # Load the PDF content into memory using BytesIO
        file = BytesIO(response.content)
        
        # Use PyPDF2 to read and extract text from the PDF
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""  # Extract text from each page
        text
    except requests.exceptions.RequestException as e:
        return f"Failed to download PDF: {str(e)}"
    except Exception as e:
        return f"Failed to extract text from PDF: {str(e)}"

    # Create a prompt with the criteria
    criteria_list = ", ".join(criteria)
    prompt = f"""
    You are a grading assistant. Grade the assignment based on the following criteria: {criteria_list}.
    Provide a grade between 1 and 10 for the overall quality of the PDF content, followed by one line descriptions for each criterion.

    Output the result in the following JSON format
    {{
        "grade": (1-10),
        "{criteria[0]}": "Description for criterion {criteria[0]}",
        "{criteria[1]}": "Description for criterion {criteria[1]}",
        "{criteria[2]}": "Description for criterion {criteria[2]}"
    }}

    PDF text:
    {text}
    """

    # Create a completion request to grade the assignment
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=False,
        response_format={"type": "json_object"},
        stop=None,
    )
    message_content = completion.choices[0].message.content    
    # If the content is in JSON format, parse it
    try:
        json_response = json.loads(message_content)  # Parse the string into a JSON object
        return jsonify(json_response)  # Return the JSON response
    except json.JSONDecodeError:
        return jsonify({"error": "Response is not valid JSON."}), 500

def extract_text_from_pdf(file):
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""  # Handle potential None values
    return text

@app.route('/quiz', methods=['POST'])
def quiz():
    data = request.get_json()

    # Check if required fields are present
    if not data or 'description' not in data:
        return jsonify({"error": "Missing 'description' in the request."}), 400
    
    print(data)

    text = data['description']
    # Create a prompt with the criteria
    prompt = f"""
    Generate five multiple-choice questions based on the provided topics mentioned in following desciption {text}. For each question, provide exactly four options labeled "a", "b", "c", and "d". The answer should be one of the four options: "a", "b", "c", or "d". 

    Output the result in valid JSON format with double quotes around all keys and values. The JSON format should be an array of question objects, as follows:

    quiz:[
    {{
        "question": "Question text",
        "options": {{
            "a": "Option A text", 
            "b": "Option B text", 
            "c": "Option C text", 
            "d": "Option D text"
        }},
        "answer": "Correct answer (a, b, c, or d)"
    }},
    {{
        "question": "Question text 2",
        "options": {{
            "a": "Option A text 2", 
            "b": "Option B text 2", 
            "c": "Option C text 2", 
            "d": "Option D text 2"
        }},
        "answer": "Correct answer 2 (a, b, c, or d)"
    }},
    ...
    ]
    """

    # Create a completion request to grade the assignment
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=1,
        max_tokens=1024,
        top_p=1,
        stream=False,
        response_format={"type": "json_object"},
        stop=None,
    )
    message_content = completion.choices[0].message.content
        
        # If the content is in JSON format, parse it
    try:
        json_response = json.loads(message_content)  # Parse the string into a JSON object
        return jsonify(json_response)  # Return the JSON response
    except json.JSONDecodeError:
        return jsonify({"error": "Response is not valid JSON."}), 500

@app.route('/quiz/feedback', methods=['POST'])
def quiz_feedback():
    data = request.get_json()

    # Check if required fields are present
    if not data or 'questions' not in data:
        return jsonify({"error": "Missing required fields in the request."}), 400

    questions = data['questions']  # Expecting a list of question objects
    feedback_list = []  # To store feedback for each question

    for item in questions:
        question = item.get('question')
        options = item.get('options')
        correct_answer = item.get('answer')
        user_answer = item.get('user_answer')

        # Validate each question item
        if not question or not options or correct_answer is None or user_answer is None:
            return jsonify({"error": "Missing fields in one or more question items."}), 400

        # Create a prompt for generating AI feedback with JSON template
        prompt = f"""
        You are an AI grading assistant. Provide feedback based on the following question, options, correct answer, and user's answer.

        Question: {question}
        Options: {options}
        Correct Answer: {correct_answer}
        User's Answer: {user_answer}

        Generate the feedback in valid JSON format, structured as follows:

        {{
            "feedback": "Your feedback message here."
        }}

        only give feedback no need and make it polite.
        Provide constructive feedback on the user's answer, indicating whether it was correct or not and offering tips for improvement.
        """

        # Create a completion request to generate feedback
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=1,
            max_tokens=150,
            top_p=1,
            stream=False,
            response_format={"type": "json_object"},
            stop=None
        )
        message_content = completion.choices[0].message.content

        # If the content is in JSON format, parse it
        try:
            feedback_response = json.loads(message_content.strip())  # Parse the string into a JSON object
            feedback_list.append(feedback_response)  # Add feedback to the list
        except json.JSONDecodeError:
            return jsonify({"error": "Response is not valid JSON."}), 500

    return jsonify({"feedback": feedback_list})  # Return the list of feedback responses
    
@app.route('/assign-student-tags', methods=['POST'])
def assign_tags():
    data = request.get_json()

    # Check if required fields are present
    if not data or 'about' not in data:
        return jsonify({"error": "Missing 'about' in the request."}), 400

    about_text = data['about']

    # Create a prompt to assign tags based on the student's "about" text
    prompt = f"""
    You are a tag assignment assistant. Analyze the following student description and assign the top 5 most relevant tags from the provided list.Use knn or decision tree algorithm if necessary. The tags should be relevant to the student's interests, skills, and goals. The tags returned should be diversified and cover a range of topics. If the student description is too vague look for keywords like creative, technology etc. and assign tags accordingly.

    Student Description:
    {about_text}

    Available Tags:
    Programming, Data Science, Machine Learning, Artificial Intelligence, Web Development, Mobile Development, Cloud Computing, Cybersecurity, Software Engineering, Database Management, DevOps, UI/UX Design, Game Development, Blockchain, Internet of Things (IoT), Big Data, Business Analytics, Project Management, Digital Marketing, Finance, Entrepreneurship, Leadership, Communication Skills, Creative Writing, Graphic Design, Photography, Music Production, Language Learning, Mathematics, Physics, Biology, Chemistry, History, Psychology, Philosophy.

    Output the result in valid JSON format with double quotes around all keys and values. The JSON format should be an array of assigned tags, as follows:

    {{
        "interests": ["Tag1", "Tag2", "Tag3"]
    }}

    Only include tags that are highly relevant to the student's description.
    """

    # Create a completion request to assign tags
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.5,  # Adjust temperature for creativity vs. precision
        max_tokens=150,
        top_p=1,
        stream=False,
        response_format={"type": "json_object"},
        stop=None,
    )
    message_content = completion.choices[0].message.content

    # If the content is in JSON format, parse it
    try:
        json_response = json.loads(message_content)  # Parse the string into a JSON object
        return jsonify(json_response)  # Return the JSON response
    except json.JSONDecodeError:
        return jsonify({"error": "Response is not valid JSON."}), 500

    
@app.route('/courses/recommendations', methods=['POST'])
def get_course_recommendations():
    try:
        data = request.get_json()
        
        # Check if required data is provided
        if not data or 'userInterests' not in data or 'courses' not in data:
            return jsonify({"success": False, "error": "User interests and courses are required"}), 400
        
        user_interests = data['userInterests']
        courses = data['courses']
        
        if len(courses) == 0:
            return jsonify({"success": True, "courses": []}), 200
        
        # Prepare data for the prompt
        courses_data = []
        for course in courses:
            courses_data.append({
                "id": course["_id"],
                "title": course.get("title", ""),  # Adding title for better context
                "tags": course["tags"],
            })
        
        # Simplified prompt with clearer instructions
        prompt = f"""
        You are a course recommendation system. Match user interests with course tags to find relevant courses.
        
        User Interests: {json.dumps(user_interests)}
        
        Available Courses: {json.dumps(courses_data)}
        
        Return a JSON object with this exact format:
        {{
            "recommendedItems": [
                "course_id_1", 
                "course_id_2"
            ]
        }}
        
        Include only course IDs in the recommendedItems array, sorted by relevance.
        """

        # Create a completion request with fallback mechanism
        try:
            completion = client.chat.completions.create(
                model="deepseek-r1-distill-llama-70b",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,  # Lower temperature for more deterministic output
                max_tokens=500,
                top_p=1,
                stream=False,
                response_format={"type": "json_object"},
                stop=None
            )
            message_content = completion.choices[0].message.content

            # Parse the response
            groq_data = json.loads(message_content)
        
        except Exception as api_error:
            # Fallback to manual recommendation if AI fails
            print(f"AI recommendation failed: {str(api_error)}. Using fallback method.")
            
            # Simple fallback that matches interests to tags
            recommended_courses = []
            for course in courses:
                # Calculate relevance score based on tag matches
                score = 0
                for interest in user_interests:
                    if interest.lower() in [tag.lower() for tag in course["tags"]]:
                        score += 1
                
                if score > 0:  # Only include courses with at least one matching tag
                    recommended_courses.append((course["_id"], score))
            
            # Sort by relevance score (descending)
            recommended_courses.sort(key=lambda x: x[1], reverse=True)
            
            # Create our own recommendation response
            groq_data = {
                "recommendedItems": [course_id for course_id, _ in recommended_courses]
            }
        
        # Check if we have recommendations (either from AI or fallback)
        if not groq_data or 'recommendedItems' not in groq_data:
            return jsonify({
                "success": False, 
                "error": "Failed to generate recommendations"
            }), 500
        
        # Get sorted object IDs from response
        sorted_object_ids = groq_data["recommendedItems"]
        
        # Create a map for quick lookup of courses
        course_map = {}
        for course in courses:
            course_map[course["_id"]] = course
        
        # Sort courses based on recommendation order
        sorted_courses = [course_map[obj_id] for obj_id in sorted_object_ids if obj_id in course_map]
        
        # Add remaining courses that weren't in the recommendations
        recommended_ids = set(sorted_object_ids)
        remaining_courses = [course for course in courses if course["_id"] not in recommended_ids]
        
        # Combine sorted courses with remaining courses
        all_sorted_courses = sorted_courses + remaining_courses
        
        return jsonify({"success": True, "courses": all_sorted_courses}), 200
    
    except Exception as e:
        print(f"Error in course recommendation: {str(e)}")
        return jsonify({
            "success": False, 
            "error": "Internal server error", 
            "details": str(e)
        }), 500
    
@app.route('/generate-module-suggestions', methods=['POST'])
def generate_module_suggestions():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'modules' not in data or 'performance' not in data:
        return jsonify({"error": "Missing required fields in the request."}), 400
    
    modules = data['modules']
    performance = data['performance']
    print("performance ",performance)
    student_id = data.get('student_id', 'unknown')
    course_id = data.get('course_id', 'unknown')
    
    # Create a prompt for generating personalized suggestions
    prompt = f"""
    You are an educational AI assistant. Based on the following information, generate three personalized learning suggestions for each module to help the student improve.

    Student Performance: {performance * 100:.2f}% overall
    Course ID: {course_id}
    Student ID: {student_id}
    
    Modules:
    {", ".join(modules)}
    
    For each module, provide 3 specific, actionable suggestions that will help the student better understand the content and improve their performance. Each suggestion should be concise (maximum 1-2 sentences) and practical.
    
    Format your response as a valid JSON object with the following structure:
    {{
        "suggestions": {{
            "ModuleName1": [
                "Suggestion 1",
                "Suggestion 2",
                "Suggestion 3"
            ],
            "ModuleName2": [
                "Suggestion 1",
                "Suggestion 2",
                "Suggestion 3"
            ],
            ...
        }}
    }}
    
    Be specific in your suggestions, and tailor them to a student with the given performance level.
    """
    
    # Create a completion request to generate module suggestions
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",  # You can use other Groq models as needed
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,  # Slightly higher temperature for creative suggestions
        max_tokens=1000,  # Allow longer responses for multiple modules
        top_p=1,
        stream=False,
        response_format={"type": "json_object"},
        stop=None,
    )
    message_content = completion.choices[0].message.content
    
    # If the content is in JSON format, parse it
    try:
        json_response = json.loads(message_content)
        return jsonify(json_response)
    except json.JSONDecodeError:
        return jsonify({"error": "Response from AI model is not valid JSON."}), 500

@app.route('/find-similar-courses', methods=['POST'])
def find_similar_courses():
    try:
        data = request.get_json()
        
        # Check if required data is provided
        if not data or 'courseTitle' not in data or 'courseDescription' not in data:
            return jsonify({"success": False, "error": "Course title and description are required"}), 400
        
        course_title = data['courseTitle']
        course_description = data['courseDescription']
        
        # Prepare prompt for the LLM to search for similar courses
        prompt = f"""
        You are a course recommendation assistant. Find similar courses to the one described below from platforms like Khan Academy, Coursera, and YouTube.

        Course Title: {course_title}
        Course Description: {course_description}

        Return a JSON object with exactly 5 similar courses from different platforms. For each course, provide:
        1. The title of the course
        2. The platform it's on (Khan Academy, Coursera, YouTube, Udemy, edX, etc.)
        3. A direct URL to the course (use realistic URLs based on the platform)
        4. A brief explanation of why this course is relevant (2-3 sentences max)

        Return the data in this exact format:
        {{
            "similarCourses": [
                {{
                    "title": "Course Title",
                    "platform": "Platform Name",
                    "url": "https://example.com/course-link",
                    "relevance": "Brief explanation of why this course is relevant"
                }},
                ...
            ]
        }}

        Ensure all URLs are plausible and properly formatted for each platform. For example:
        - Coursera URLs typically look like: https://www.coursera.org/learn/course-name
        - Khan Academy URLs typically look like: https://www.khanacademy.org/subject/topic/course
        - YouTube URLs typically look like: https://www.youtube.com/playlist?list=PLAYLIST_ID
        """

        # Create a completion request
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1000,
            top_p=1,
            stream=False,
            response_format={"type": "json_object"},
            stop=None
        )
        message_content = completion.choices[0].message.content

        # Parse the response
        json_response = json.loads(message_content)
        
        return jsonify({
            "success": True, 
            "similarCourses": json_response.get("similarCourses", [])
        }), 200
    
    except Exception as e:
        print(f"Error finding similar courses: {str(e)}")
        return jsonify({
            "success": False, 
            "error": "Internal server error", 
            "details": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
