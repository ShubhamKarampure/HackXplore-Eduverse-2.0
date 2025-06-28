from server.ai_engine.eduverse_ai_engine import EduverseAIEgine 
from server.config import app_config
from server.utils.text_utils import parse_json_string
from typing import Dict, Any

class AIService:
    """
    A service layer that acts as a bridge between the main application (e.g., API endpoints)
    and the core EduverseAIEgine system.
    
    This class handles:
    - Initialization of the RAG system with configuration from a central source.
    - Exposing simplified methods for the application to use.
    - Implementing robust error handling for all RAG operations.
    - Parsing and validating data before and after it's processed by the RAG system.
    """
    def __init__(self):
        """
        Initializes the AIService by creating an instance of the EduverseAIEgine class.
        All necessary configurations (LLMs, embeddings, vector store details) are pulled
        from the centralized `app_config`.
        """
        self.ai_system = EduverseAIEgine(
            gemini_llm_instance=app_config.GEMINI_LLM,
            embedding_instance=app_config.EMBEDDINGS,
            qdrant_url=app_config.QDRANT_URL,
            qdrant_api_key=app_config.QDRANT_API_KEY, 
            vector_size=app_config.QDRANT_VECTOR_SIZE,
            distance_metric=app_config.QDRANT_DISTANCE_METRIC,
            syllabus_collection_name=app_config.QDRANT_SYLLABUS_COLLECTION,
            reference_collection_name=app_config.QDRANT_REFERENCE_COLLECTION
        )

    def add_syllabus_from_text(self, syllabus_text: str, metadata: Dict[str, Any]) -> tuple[bool, str]:
        """
        Provides a clean interface for adding syllabus text to the RAG system.

        Args:
            syllabus_text (str): The raw text of the syllabus.
            metadata (Dict[str, Any]): Associated metadata (course_id).

        Returns:
            tuple[bool, str]: A tuple containing a success flag and a status message.
        """
        try:
            self.ai_system.add_syllabus(syllabus_text, metadata)
            return True, "Syllabus added successfully."
        except Exception as e:
            print(f"Error in AIService adding syllabus: {e}")
            return False, f"Failed to add syllabus: {str(e)}"

    def add_reference_from_text(self, reference_text: str, metadata: Dict[str, Any]) -> tuple[bool, str]:
        """
        Provides a clean interface for adding reference material to the RAG system.

        Args:
            reference_text (str): The raw text of the reference material.
            metadata (Dict[str, Any]): Associated metadata.

        Returns:
            tuple[bool, str]: A tuple containing a success flag and a status message.
        """
        try:
            self.ai_system.add_reference_material(reference_text, metadata)
            return True, "Reference material added successfully."
        except Exception as e:
            print(f"Error in AIService adding reference: {e}")
            return False, f"Failed to add reference material: {str(e)}"

    def generate_course_modules(self, course_id: str, num_modules: int = 8) -> tuple[Any | None, str | None]:
        """
        Generates a structured list of course modules directly from a pre-uploaded syllabus
        associated with a specific teacher and course.

        Args:
            course_id (str): The unique identifier for the course.
            num_modules (int): The desired number of modules. Defaults to 8.

        Returns:
            tuple[Any | None, str | None]: A tuple containing the parsed JSON (list of modules)
                                        on success, or an error message on failure.
        """
        try:
            raw_json_modules = self.ai_system.generate_course_modules(
                course_id=course_id,
                num_modules=num_modules
            )
            parsed_modules = parse_json_string(raw_json_modules)
            if isinstance(parsed_modules, dict) and 'error' in parsed_modules:
                return None, parsed_modules['error']
            return parsed_modules, None
        except ValueError as ve: 
            print(f"JSON parsing error for modules: {ve}")
            return None, f"Could not parse generated modules as JSON: {ve}"
        except Exception as e:
            print(f"Error generating course modules: {e}")
            return None, f"An unexpected error occurred: {str(e)}"
        
    def generate_quiz(self, quiz_config: Dict[str, Any]) -> tuple[Any | None, str | None]:
        """
        Generates a quiz based on a configuration dictionary.

        Args:
            quiz_config (Dict[str, Any]): A dictionary containing quiz parameters like
                                          description, total questions, and difficulty distribution.

        Returns:
            tuple[Any | None, str | None]: A tuple containing the parsed JSON quiz object
                                           on success, or an error message on failure.
        """
        try:
            course_id = quiz_config.get('course_id', '')
            description = quiz_config.get('description', '')
            total_questions = quiz_config.get('totalQuestions', 10)
            duration = quiz_config.get('duration', '30') 
            question_level = quiz_config.get('questionLevels', {})
            beginner = question_level.get('beginner', 0)
            intermediate = question_level.get('intermediate', 0)
            advanced = question_level.get('advanced', 0)

            raw_json_quiz = self.ai_system.generate_quiz_with_config(
                course_id,description, total_questions, duration, beginner, intermediate, advanced
            )

            parsed_quiz = parse_json_string(raw_json_quiz)
            return parsed_quiz, None
        except ValueError as ve:
            print(f"JSON parsing error for quiz: {ve}")
            return None, f"Could not parse generated quiz as JSON: {ve}"
        except Exception as e:
            print(f"Error generating quiz: {e}")
            return None, f"Failed to generate quiz: {str(e)}"
    
    def grade_assignment(self, grading_data: Dict[str, Any]) -> tuple[Dict[str, Any] | None, str | None]:
        """
        Grades a student's assignment using the configured rubric.

        This method first checks for relevance before proceeding to grade.

        Args:
            grading_data (Dict[str, Any]): A dictionary containing all necessary data for grading,
                                          including 'assignment_text', 'topic', 'description',
                                          'criteria', and 'max_scores'.

        Returns:
            tuple[Dict[str, Any] | None, str | None]: A tuple containing the grade report dictionary
                                                     on success, or an error message on failure.
        """
        try:
            # Safely unpack data from the input dictionary
            assignment_text = grading_data.get('assignment_text')
            topic = grading_data.get('topic')
            description = grading_data.get('description')
            criteria = grading_data.get('criteria')
            max_scores = grading_data.get('max_scores')

            # Validate that all required data is present
            if not all([assignment_text, topic, description, criteria, max_scores]):
                return None, "Missing required data for grading. Required fields are: assignment_text, topic, description, criteria, max_scores."

            # Delegate the call to the core AI engine
            grade_report, error = self.ai_system.grade_assignment(
                assignment_text=assignment_text,
                topic=topic,
                description=description,
                criteria=criteria,
                max_scores=max_scores
            )
            
            # The engine already returns a (result, error) tuple, so we can pass it through.
            if error:
                return None, error

            return grade_report, None
        except Exception as e:
            # Catch any unexpected exceptions during the service call.
            print(f"Unexpected error in AIService grading assignment: {e}")
            return None, f"An unexpected error occurred during the grading process: {str(e)}"
    def generate_PPT(self, topic_query: str, teacher_id: str) -> tuple[Dict[str, str] | None, str | None]:
        """
        Generates PPT for a given topic query.

        Args:
            topic_query (str): The query to find the relevant topic (e.g., "Introduction to Python").
            teacher_id (str): The ID of the teacher requesting the materials.

        Returns:
            tuple[Dict[str, str] | None, str | None]: A tuple containing the generated materials dictionary
                                                     on success, or an error message on failure.
        """
        try:
            materials = self.ai_system.generate_PPT_from_topic(topic_query, teacher_id)
            if "error" in materials: 
                return None, materials["error"]
            return materials, None
        except Exception as e:
            print(f"Error generating course materials: {e}")
            return None, f"Failed to generate materials: {str(e)}"


# Create a single, reusable instance of the AIService.
ai_service_instance = AIService()