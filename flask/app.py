import os
from flask import Flask, request, jsonify, send_file
from groq import Groq
import requests
from PyPDF2 import PdfReader
from io import BytesIO
import re
import json
from dotenv import load_dotenv  
from RAG.LangChainModel import StudyMaterialRAG
from yt_videos.test import send_youtube_url_to_api 
# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

groq_api_key = os.getenv("GROQ_API_KEY")

# Initialize the StudyMaterialRAG system
study_system = StudyMaterialRAG()

# Ensure API key is set
if not groq_api_key:
    raise ValueError("GROQ_API_KEY is not set in the .env file")

# Initialize Groq client with API key
client = Groq(api_key=groq_api_key)

@app.route('/module/youtube_video_add',methods=['POST'])
def add_yt_video():
    search_query = request.json.get('search_query')
    module_id = request.json.get('module_id')

    if( not search_query or not module_id):
        return jsonify({"error": "search_query and module_id are required"}), 400

    return send_youtube_url_to_api(search_query, module_id)
        

@app.route('/syllabus/add', methods=['POST'])
def add_syllabus():
    try:
        # Check if the request has the file part
        if 'file' not in request.files:
            print("No file part in the request")
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files['file']
        
        # If user does not select file, browser also submits an empty part without filename
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        # Get metadata from form
        course_id = request.form.get('course_id', '')
        teacher_id = request.form.get('teacher_id', '')
        
        if not course_id or not teacher_id:
            print("Course ID and Teacher ID are required")
            return jsonify({"error": "Course ID and Teacher ID are required"}), 400
            
        # Save file temporarily
        temp_path = os.path.join(os.getcwd(), "temp_syllabus.pdf")
        file.save(temp_path)
        
        # Extract text and add to system
        syllabus_text = study_system.extract_text_from_pdf(temp_path)
        study_system.add_syllabus(syllabus_text, {"course_id": course_id, "teacher_id": teacher_id})
        
        # Clean up temporary file
        os.remove(temp_path)
        
        return jsonify({
            "success": True, 
            "message": "Syllabus added successfully",
            "course_id": course_id,
            "teacher_id": teacher_id
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reference/add', methods=['POST'])
def add_reference():
    try:
        # Check if the request has the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
            
        file = request.files['file']
        
        # If user does not select file, browser also submits an empty part without filename
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        # Get metadata from form
        cource = request.form.get('cource', 'Unknown Source')
        teacher_id = request.form.get('teacher_id', '')
        
        if not teacher_id:
            return jsonify({"error": "Teacher ID is required"}), 400
            
        # Save file temporarily
        temp_path = os.path.join(os.getcwd(), "temp_reference.pdf")
        file.save(temp_path)
        
        # Extract text and add to system
        reference_text = study_system.extract_text_from_pdf(temp_path)
        study_system.add_reference_material(reference_text, {"cource": cource, "teacher_id": teacher_id})
        
        # Clean up temporary file
        os.remove(temp_path)
        
        return jsonify({
            "success": True, 
            "message": "Reference material added successfully",
            "cource": cource,
            "teacher_id": teacher_id
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import re

def clean_markdown_content(content):
    """Clean content using regex for more precise replacements"""
    # Replace code blocks with HTML alternatives
    # content=re.sub(r"```markdown","",content)
    return content

@app.route('/materials/generate', methods=['POST'])
def generate_materials():
    try:
        data = request.get_json()
        
        # Check if required data is provided
        if not data or 'topic' not in data or 'teacher_id' not in data:
            print("Error: Missing required fields 'topic' or 'teacher_id' in the request.")
            return jsonify({"error": "Topic and teacher_id are required"}), 400
        
        topic = data['topic']
        teacher_id = data['teacher_id']
        output_format = data.get('output_format', 'pptx')  # Default to PPTX
   
        materials = study_system.create_full_course_materials(topic, teacher_id)

        # Define upload directory name
        upload_folder = "uploads"

        # Create 'uploads' directory if it doesn't exist
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)

        # Generate markdown file in uploads directory
        output_file = f"{topic.replace(' ', '_').lower()}_materials.md"
        file_path = os.path.join(os.getcwd(), upload_folder, output_file)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write('''---
        marp: true
        theme: default
        paginate: true
        \n''')
            for subtopic, content in materials.items():
                f.write('---\n')
                f.write(f"### {subtopic}\n\n")
                clean_content = clean_markdown_content(content)
                f.write(clean_content)
                f.write("\n\n")
        os.system(f" mmdc -i {file_path} -o {file_path} ")
        # Generate the PDF, PPTX, or HTML files in 'uploads' directory
        if output_format in ['pptx', 'ppt']:
            pptx_file = f"{topic.replace(' ', '_').lower()}_slides.pptx"
            pptx_path = os.path.join(os.getcwd(), upload_folder, pptx_file)
            os.system(f"marp --allow-local-files {file_path} --pptx -o {pptx_path}")
            print(f"PPTX file generated at: {pptx_path}")
            response = send_file(
                pptx_path,
                as_attachment=True,
                download_name=pptx_file,
                mimetype="application/vnd.openxmlformats-officedocument.presentationml.presentation"
            )
            return response

        elif output_format == 'pdf':
            pdf_file = f"{topic.replace(' ', '_').lower()}_materials.pdf"
            pdf_path = os.path.join(os.getcwd(), upload_folder, pdf_file)
            os.system(f"marp --allow-local-files {file_path} --pdf -o {pdf_path}")
            print(f"PDF file generated at: {pdf_path}")
            response = send_file(
                pdf_path,
                as_attachment=True,
                download_name=pdf_file,
                mimetype="application/pdf"
            )
            return response

        elif output_format == 'html':
            html_file = f"{topic.replace(' ', '_').lower()}.html"
            html_path = os.path.join(os.getcwd(), upload_folder, html_file)
            os.system(f"marp --allow-local-files {file_path} --pdf -o {html_path}")
            print(f"HTML file generated at: {html_path}")
            response = send_file(
                html_path,
                as_attachment=True,
                download_name=html_file,
                mimetype="text/html"
            )
            return response

        else:
            # Return JSON if requested
            print("Returning materials as JSON.")
            return jsonify({"success": True, "materials": materials})

    except Exception as e:
        print(f"Error occurred in generate_materials: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/send',methods=['GET'])
def send():
    response = send_file(
        os.path.join(os.getcwd(),'virtualisation_slides.ppt'),
        as_attachment=True
    )
    response.headers["Content-Disposition"] = "attachment; filename=virtualisation_slides.ppt"
    response.headers["Content-Type"] = "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    return response

@app.route('/modules',methods=['POST'])
def roadmap2():
    data = request.get_json()

    # Check if required fields are present
    if not data or 'description' not in data:
        return jsonify({"error": "Missing 'description' in the request."}), 400

    text = data['description']
    print(text)
    res=study_system.generate_course_modules(text)

    res = res.replace("```json", "").replace("```", "").strip()
    try:
        res = json.loads(res)
    except json.JSONDecodeError:
        # Try additional cleaning if the first attempt fails
        cleaned = re.sub(r"^['`]+|['`]+$", "", res)
        res = json.loads(cleaned)
     
    return jsonify(res)


# @app.route('/modules', methods=['POST'])
# def roadmap():
#     data = request.get_json()

#     # Check if required fields are present
#     if not data or 'description' not in data:
#         return jsonify({"error": "Missing 'description' in the request."}), 400

#     text = data['description']
    
#     # Create a simplified prompt with fewer modules
#     prompt = f"""
# You are a tutor of a course. Generate a segregate the course into proper module based on this description {text}

# Return the result as valid JSON with an array named "modules" containing 8 module objects. Each module should strictly follow this format:
# {{
#   "modules": [
#     {{
#       "title": "Module Title" (In title no need to mention module.),
#       "description": "Module description.",
#       "order": 1,
#     }}
#   ]
# }}

# Important: Return only valid JSON with exactly 8 modules. 
# """

#     # Create a completion request with adjusted parameters
#     completion = client.chat.completions.create(
#         model="llama-3.1-8b-instant",
#         messages=[
#             {
#                 "role": "user",
#                 "content": prompt
#             }
#         ],
#         temperature=0.2,  # Lower temperature for more deterministic output
#         max_tokens=4000,  # Increase token limit
#         top_p=0.9,
#         stream=False,
#         response_format={"type": "json_object"},
#         stop=None,
#     )
#     message_content = completion.choices[0].message.content
        
#     # If the content is in JSON format, parse it
#     try:
#         json_response = json.loads(message_content)
#         return jsonify(json_response)
#     except json.JSONDecodeError:
#         # Return both the error and the attempted response for debugging
#         return jsonify({
#             "error": "Response is not valid JSON.",
#             "attempted_response": message_content
#         }), 500
@app.route('/grade', methods=['POST'])
def grade():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'pdf_url' not in data or 'criteria' not in data:
        return jsonify({"error": "Missing 'pdf_url' or 'criteria' in the request."}), 400
    
    pdf_url = data['pdf_url']
    criteria = data['criteria']
    max_scores = data.get('maxScores', [10] * len(criteria))  # Default to 10 if not provided
    
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
        
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to download PDF: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Failed to extract text from PDF: {str(e)}"}), 500
    
    # Clean criteria names to make them valid JSON keys
    clean_criteria = []
    for criterion in criteria:
        # Remove special characters, replace spaces with underscores
        clean_criterion = re.sub(r'[^\w\s]', '', criterion).strip().replace(' ', '_')
        clean_criteria.append(clean_criterion)
    
    # Create a prompt with the criteria and max scores
    criteria_with_scores = []
    for i, criterion in enumerate(criteria):
        criteria_with_scores.append(f"{criterion} (max score: {max_scores[i]})")
    
    criteria_list = ", ".join(criteria_with_scores)
    
    # Build the expected JSON structure for the prompt
    json_format = '{\n    "grade": (sum of all scores),\n'
    for i, clean_criterion in enumerate(clean_criteria):
        json_format += f'    "{clean_criterion}": (score for criterion {i+1}),\n'
    json_format += '    "feedback": "Detailed feedback about the submission overall"\n}'
    
    prompt = f"""
    You are a grading assistant. Grade the assignment based on the following criteria: {criteria_list}.
    For each criterion, assign a score between 0 and its max score.
    
    Additionally, provide overall feedback about the submission.
    
    Output the result in the following JSON format:
    {json_format}
    
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
        
        # Map back to original criteria names if needed
        result = {"grade": json_response["grade"], "feedback": json_response["feedback"]}
        for i, criterion in enumerate(criteria):
            clean_criterion = clean_criteria[i]
            result[criterion] = json_response[clean_criterion]
        
        return jsonify(result)  # Return the JSON response
    except json.JSONDecodeError:
        return jsonify({
            "error": "Response is not valid JSON.",
            "raw_response": message_content
        }), 500

@app.route('/quiz', methods=['POST'])
def quiz2():
    data=request.get_json()
    data=data['quizConfig']
    question_level=data.get('questionLevels')

    res=study_system.generate_quiz_with_config(data['description'],data['totalQuestions'],data['duration'],question_level.get('beginner'),question_level.get('intermediate'),question_level.get('advanced'))

    res = res.replace("```json", "").replace("```", "").strip()
    try:
        res = json.loads(res)
    except json.JSONDecodeError:
        # Try additional cleaning if the first attempt fails
        cleaned = re.sub(r"^['`]+|['`]+$", "", res)
        res = json.loads(cleaned)
     
    return jsonify(res)


# @app.route('/quiz', methods=['POST'])
# def quiz():
#     data = request.get_json()
#     data = data['quizConfig']

#     # Check if required fields are present
#     if not data or 'description' not in data:
#         return jsonify({"error": "Missing 'description' in the request."}), 400
    
#     print(data)

#     text = data['description']
#     # Create a prompt with the criteria
#     prompt = f"""
#     Generate five multiple-choice questions based on the provided topics mentioned in following desciption {text}. For each question, provide exactly four options labeled "a", "b", "c", and "d". The answer should be one of the four options: "a", "b", "c", or "d". 

#     Output the result in valid JSON format with double quotes around all keys and values. The JSON format should be an array of question objects, as follows:

#     quiz:[
#     {{
#         "question": "Question text",
#         "options": {{
#             "a": "Option A text", 
#             "b": "Option B text", 
#             "c": "Option C text", 
#             "d": "Option D text"
#         }},
#         "answer": "Correct answer (a, b, c, or d)"
#     }},
#     {{
#         "question": "Question text 2",
#         "options": {{
#             "a": "Option A text 2", 
#             "b": "Option B text 2", 
#             "c": "Option C text 2", 
#             "d": "Option D text 2"
#         }},
#         "answer": "Correct answer 2 (a, b, c, or d)"
#     }},
#     ...
#     ]
#     """

#     # Create a completion request to grade the assignment
#     completion = client.chat.completions.create(
#         model="llama-3.1-8b-instant",
#         messages=[
#             {
#                 "role": "user",
#                 "content": prompt
#             }
#         ],
#         temperature=1,
#         max_tokens=1024,
#         top_p=1,
#         stream=False,
#         response_format={"type": "json_object"},
#         stop=None,
#     )
#     message_content = completion.choices[0].message.content
#     print(message_content)
#         # If the content is in JSON format, parse it
#     try:
#         json_response = json.loads(message_content)  # Parse the string into a JSON object
#         return jsonify(json_response)  # Return the JSON response
#     except json.JSONDecodeError:
#         return jsonify({"error": "Response is not valid JSON."}), 500

@app.route('/quiz/feedback', methods=['POST'])
def quiz_feedback():
    data = request.get_json()

    # Check if required fields are present
    if not data or 'question' not in data:
        return jsonify({"error": "Missing required fields in the request."}), 400

    question = data['questions']  # Expecting a list of question objects
    options = data['options']
    correct_answer = data['answer']
    user_answer = data['user_answer']

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
    Provide with explaination & constructive feedback on the user's answer,  offering tips for improvement in one or two line.
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
        feedback = json.loads(message_content.strip())  # Parse the string into a JSON object
    except json.JSONDecodeError:
        return jsonify({"error": "Response is not valid JSON."}), 500
    return jsonify({"feedback": feedback})  # Return the list of feedback responses
    
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
