# /your_project_name/routes/module_routes.py
from flask import Blueprint, request
from server.services.ai_service import ai_service_instance
from server.utils.response_utils import success_response, error_response

module_bp = Blueprint('module_bp', __name__)

@module_bp.route('/generate', methods=['POST']) 
def generate_modules_structure_route():
    """
    API endpoint to generate optimized course modules for a specific course taught by a teacher.
    Expects a JSON payload with 'course_id'.
    'num_modules' is an optional integer parameter.
    """
    data = request.get_json()

    if not data or 'course_id' not in data:
        return error_response("Missing required field: 'course_id'.", 400)

    course_id = data['course_id']
    num_modules = data.get('num_modules', 8)

    parsed_modules, err = ai_service_instance.generate_course_modules(
        course_id=course_id,
        num_modules=num_modules
    )
    
    if err:
        return error_response(f"Failed to generate modules: {err}", 500)
    
    return success_response(parsed_modules, "Course modules generated successfully.")
