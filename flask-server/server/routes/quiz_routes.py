# /your_project_name/routes/quiz_routes.py
from flask import Blueprint, request
from server.services.ai_service import ai_service_instance
from server.utils.response_utils import success_response, error_response

quiz_bp = Blueprint('quiz_bp', __name__)

@quiz_bp.route('/generate', methods=['POST'])
def generate_quiz_route():
    data = request.get_json()
    if not data or 'quizConfig' not in data:
        return error_response("Missing 'quizConfig' in the request body.", 400)

    quiz_config = data['quizConfig']
    
    # Basic validation of quiz_config structure (can be more detailed)
    required_keys = ['course_id','description', 'totalQuestions', 'duration', 'questionLevels']
    if not all(key in quiz_config for key in required_keys):
        return error_response(f"quizConfig missing one or more required keys: {required_keys}", 400)
    if not isinstance(quiz_config['questionLevels'], dict):
         return error_response("'questionLevels' must be a dictionary.", 400)


    parsed_quiz, err = ai_service_instance.generate_quiz(quiz_config)
    
    if err:
        return error_response(f"Failed to generate quiz: {err}", 500)
        
    return success_response(parsed_quiz, "Quiz generated successfully.")