from flask import Blueprint, request, send_file
from server.services.ai_service import ai_service_instance
from server.services.pdf_service import pdf_service
from server.services.file_generator_service import file_generator_service_instance
from server.utils.response_utils import success_response, error_response

import os 

rag_material_bp = Blueprint('rag_material_bp', __name__)

@rag_material_bp.route('/syllabus/add', methods=['POST'])
def add_syllabus_route():
    if 'file' not in request.files:
        return error_response("No file part in the request.", 400)
    
    file = request.files['file']
    if file.filename == '':
        return error_response("No file selected.", 400)
        
    course_id = request.form.get('course_id')
    
    if not course_id:
        return error_response("Course ID is required.", 400)
        
    syllabus_text, err = pdf_service.extract_text_from_file_storage(file)
    if err:
        return error_response(f"Failed to extract syllabus text: {err}", 500)

    success_flag, message = ai_service_instance.add_syllabus_from_text(
        syllabus_text, 
        {"course_id": course_id}
    )
    
    if success_flag:
        return success_response(
            {"course_id": course_id}, 
            message, 
            201
        )
    else:
        return error_response(message, 500)

@rag_material_bp.route('/reference/add', methods=['POST'])
def add_reference_route():
    if 'file' not in request.files:
        return error_response("No file part in the request.", 400)
            
    file = request.files['file']
    if file.filename == '':
        return error_response("No file selected.", 400)
            
    course_id = request.form.get('course_id')

    if not course_id:
        return error_response("Course ID is required.", 400)
        
    reference_text, err = pdf_service.extract_text_from_file_storage(file)
    if err:
        return error_response(f"Failed to extract reference text: {err}", 500)
        
    success_flag, message = ai_service_instance.add_reference_from_text(
        reference_text, 
        {"course_id": course_id}
    )

    if success_flag:
        return success_response(
            {"course_id": course_id},
            message,
            201
        )
    else:
        return error_response(message, 500)
