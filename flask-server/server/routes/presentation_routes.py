from flask import Blueprint, request, send_file
from server.services.ai_service import ai_service_instance
from server.services.pdf_service import pdf_service
from server.services.file_generator_service import file_generator_service_instance
from server.utils.response_utils import success_response, error_response

import os 

presentation_bp = Blueprint('presentation_bp', __name__)

@presentation_bp.route('/generate', methods=['POST'])
def generate_ppt_route():
    data = request.get_json()
    if not data or 'topic' not in data or 'teacher_id' not in data:
        return error_response("Topic and teacher_id are required.", 400)
    
    topic_query = data['topic']
    teacher_id = data['teacher_id']
    output_format = data.get('output_format', 'pptx').lower() # Default to PPTX, normalize

    # 1. Generate markdown content using RAG service
    materials_map, err = ai_service_instance.generate_PPT(topic_query, teacher_id)
    if err:
        return error_response(f"Failed to generate material content: {err}", 500)
    if not materials_map:
         return error_response("No material content could be generated.", 500)

    # Assuming materials_map has one main topic if RAG returns {topic_title: content}
    # If it's already structured as {subtopic: content}, adjust accordingly.
    # For now, let's assume the key of materials_map is the effective topic for filename
    main_topic_title = next(iter(materials_map)) # Get the first key as the main topic title

    # 2. Generate file (MD, PPTX, PDF, HTML) using FileGeneratorService
    generated_files, err = file_generator_service_instance.generate_presentation_files(
        main_topic_title, # Use the actual topic title from RAG output
        materials_map      # Pass the whole map
    )
    if err:
        return error_response(f"Failed to generate output file(s): {err}", 500)

    # 3. Return the requested file type or JSON
    if output_format in ['pptx', 'ppt'] and 'pptx' in generated_files:
        return send_file(
            generated_files['pptx'],
            as_attachment=True,
            download_name=os.path.basename(generated_files['pptx']),
            mimetype="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        )
    elif output_format == 'pdf' and 'pdf' in generated_files:
        return send_file(
            generated_files['pdf'],
            as_attachment=True,
            download_name=os.path.basename(generated_files['pdf']),
            mimetype="application/pdf"
        )
    elif output_format == 'html' and 'html' in generated_files:
        return send_file(
            generated_files['html'],
            as_attachment=True,
            download_name=os.path.basename(generated_files['html']),
            mimetype="text/html"
        )
    elif output_format == 'md' and 'md' in generated_files: # Option to get raw markdown
         return send_file(
            generated_files['md'],
            as_attachment=True,
            download_name=os.path.basename(generated_files['md']),
            mimetype="text/markdown"
        )
    elif output_format == 'json': # Return the raw generated content as JSON
        return success_response({"materials": materials_map}, "Materials generated as JSON.")
    else:
        return error_response(f"Requested format '{output_format}' could not be generated or is not supported. Available: {list(generated_files.keys())}", 400)