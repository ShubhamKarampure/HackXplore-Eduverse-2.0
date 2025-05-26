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
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq  # Import LangChain's Groq integration
from langchain.schema import HumanMessage
from flask_cors import CORS

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

groq_api_key = os.getenv("GROQ_API_KEY")
gemini_api_key = os.getenv("GEMINI_API_KEY")
# Initialize the StudyMaterialRAG system
study_system = StudyMaterialRAG()

# Ensure API key is set
if not groq_api_key:
    raise ValueError("GROQ_API_KEY is not set in the .env file")

# Initialize the Groq client for direct API calls
client = Groq(api_key=groq_api_key)

# Create an LLM using LangChain with Groq
llm = ChatGroq(
    temperature=0,
    groq_api_key=groq_api_key,
    model_name="llama-3.1-8b-instant",
)
        

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
    # Remove markdown code block markers (```json and ```)
    content = re.sub(r'```json\s*', '', content)
    content = re.sub(r'```\s*', '', content)
    # Remove any leading/trailing backticks or quotes that might remain
    content = re.sub(r'^[`\']+|[`\']+$', '', content.strip())
    return content

def get_youtube_video(query):
    """Search YouTube for a video related to the query"""
    api_key = os.getenv("YOUTUBE_API_KEY")
    base_url = "https://www.googleapis.com/youtube/v3/search"
    
    params = {
        "part": "snippet",
        "q": query,
        "key": api_key,
        "maxResults": 1,
        "type": "video"
    }
    
    try:
        response = requests.get(base_url, params=params).json()
        
        if "items" not in response or not response["items"]:
            return {"success": False, "message": "No videos found for the query"}
        
        # Get first video
        item = response["items"][0]
        title = item["snippet"]["title"]
        video_id = item["id"]["videoId"]
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        return {
            "success": True,
            "title": title,
            "url": video_url
        }
    except Exception as e:
        print(f"Error searching YouTube: {str(e)}")
        return {"success": False, "message": str(e)}

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
                
                # Check if the content contains mermaid diagrams
                if '```mermaid' in content:
                    # Process the content to preserve mermaid blocks but remove other code blocks
                    lines = content.split('\n')
                    in_mermaid_block = False
                    clean_lines = []
                    
                    for line in lines:
                        if '```mermaid' in line:
                            in_mermaid_block = True
                            clean_lines.append(line)
                        elif '```' in line and in_mermaid_block:
                            in_mermaid_block = False
                            clean_lines.append(line)
                        elif in_mermaid_block:
                            clean_lines.append(line)
                        else:
                            # Clean non-mermaid lines
                            clean_line = line.replace("```markdown", "").replace("```", "")
                            clean_lines.append(clean_line)
                            
                    clean_content = '\n'.join(clean_lines)
                else:
                    # If no mermaid blocks, remove all code block markers
                    clean_content = content.replace("```markdown", "").replace("```", "").strip()
                    
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


@app.route('/relevant_assignment_check', methods=['POST'])
def relevant_assignment_check():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'pdf_url' not in data:
        return jsonify({"error": "Missing 'pdf_url'."}), 400
    
    pdf_url = data['pdf_url']
    topic=data.get('topic', '')
    description=data.get('description', '')
    
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
    relvancy=study_system.check_assignment_relevance(text,topic,description)
    return jsonify({"is_relevant": relvancy})


@app.route('/grade', methods=['POST'])
def grade():
    data = request.get_json()
    
    # Check if required fields are present
    if not data or 'pdf_url' not in data or 'criteria' not in data:
        return jsonify({"error": "Missing 'pdf_url' or 'criteria' in the request."}), 400
    
    pdf_url = data['pdf_url']
    criteria = data['criteria']
    max_scores = data.get('maxScores', [10] * len(criteria))  # Default to 10 if not provided
    topic=data.get('topic', '')
    description=data.get('description', '')
    
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


if __name__ == '__main__':
    app.run(debug=True)
