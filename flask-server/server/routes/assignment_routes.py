# /your_project_name/routes/assignment_routes.py
from flask import Blueprint, request
from server.services.pdf_service import pdf_service
from server.services.ai_service import ai_service_instance
from server.utils.response_utils import success_response, error_response

assignment_bp = Blueprint('assignment_bp', __name__)

@assignment_bp.route('/grade', methods=['POST'])
def grade_assignment_route():
    data = request.get_json()
    if not data or 'pdf_url' not in data or 'criteria' not in data:
        return error_response("Missing 'pdf_url' or 'criteria' in the request.", 400)
    
    pdf_url = data['pdf_url']
    criteria = data['criteria']
    max_scores_input = data.get('maxScores', [])

    if not isinstance(criteria, list) or not all(isinstance(c, str) for c in criteria):
        return error_response("'criteria' must be a list of strings.", 400)

    if not isinstance(max_scores_input, list) or not all(isinstance(s, (int,float)) for s in max_scores_input):
        max_scores = [10] * len(criteria)
        print(f"Warning: 'maxScores' invalid or missing. Defaulting to {max_scores}")
    elif len(max_scores_input) != len(criteria):
        max_scores = [10] * len(criteria)
        print(f"Warning: Mismatch in 'maxScores' length. Defaulting to {max_scores}")
    else:
        max_scores = max_scores_input

    assignment_text, err = pdf_service.extract_text_from_url(pdf_url)
    if err:
        return error_response(f"Failed to get assignment text: {err}", 500)
    if not assignment_text:
        return error_response("Could not extract text from the PDF or PDF is empty.", 400)

    grading_data = {
        "assignment_text": assignment_text,
        "topic": data.get("topic", ""),
        "description": data.get("description", ""),
        "criteria": criteria,
        "max_scores": max_scores
    }

    grading_result, err = ai_service_instance.grade_assignment(grading_data)

    if err:
        return error_response(f"Grading failed: {err}", 500)
    
    return success_response(grading_result)
