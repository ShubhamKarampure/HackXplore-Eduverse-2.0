# rag/study_material_rag.py

import PyPDF2
import os
from server.utils.text_utils import clean_for_json_key

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.output_parsers import PydanticOutputParser

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Tuple

from qdrant_client import QdrantClient, models

# --- Pydantic Models ---

class Module(BaseModel):
    """Defines the data structure for a single course module."""
    title: str = Field(description="The title of the course module")
    description: str = Field(description="A brief description of the module's content and the topics it covers")
    order: int = Field(description="The sequential order of the module, starting from 1")

class CourseModules(BaseModel):
    """A container model to hold a list of Module objects."""
    modules: List[Module] = Field(description="The complete list of modules for the course")

class GradingOutput(BaseModel):
    """Defines the structured output for a graded assignment."""
    scores: Dict[str, float] = Field(description="A dictionary where keys are the clean criterion names and values are the assigned scores.")
    feedback: str = Field(description="Detailed, constructive feedback for the student about the overall submission.")
    final_grade: float = Field(description="The sum total of all scores for the criteria.")

# --- Main AI Engine Class ---

class EduverseAIEgine:
    """
    A Retrieval-Augmented Generation (RAG) based AI engine class for managing all AI related automation task in Eduverse.
    """
    def __init__(
        self,
        gemini_llm_instance: ChatGoogleGenerativeAI,
        embedding_instance: HuggingFaceEmbeddings,
        qdrant_url: str,
        qdrant_api_key: Optional[str],
        vector_size: int,
        distance_metric: models.Distance,
        syllabus_collection_name: str,
        reference_collection_name: str
    ):
        self.llm = gemini_llm_instance
        self.embeddings = embedding_instance
        self.qdrant_url = qdrant_url
        self.qdrant_api_key = qdrant_api_key
        self.vector_size = vector_size
        self.distance_metric = distance_metric
        self.syllabus_collection_name = syllabus_collection_name
        self.reference_collection_name = reference_collection_name
        self.qdrant_client = QdrantClient(url=self.qdrant_url, api_key=self.qdrant_api_key)
        
        self.syllabus_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=100)
        self.reference_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        
        self._ensure_collection_exists(self.syllabus_collection_name)
        self.syllabus_store = QdrantVectorStore.from_existing_collection(
            collection_name=self.syllabus_collection_name,
            url=qdrant_url, api_key=qdrant_api_key, embedding=self.embeddings, timeout=60
        )
        
        self._ensure_collection_exists(self.reference_collection_name)
        self.reference_store = QdrantVectorStore.from_existing_collection(
            collection_name=self.reference_collection_name,
            url=qdrant_url, api_key=qdrant_api_key, embedding=self.embeddings
        )
        
        self.study_material_prompt = PromptTemplate(
            template="""Create comprehensive, information-dense slides in Marp-compatible markdown for:
            Topic: {topic}
            Description: {description}
            Based on these detailed reference materials: {reference_content}
            Content Requirements: Create approx 20 slides, include extensive factual content, definitions, explanations, theories, and examples.
            Formatting Guidelines: Start each slide with '---', use markdown headings, bold, italics, and include at least one Mermaid diagram starting with ```mermaid and ending with ```.
            DO NOT: Add ```markdown blocks or Marp metadata. Provide valid references at the end.
            """,
            input_variables=["topic", "description", "reference_content"]
        )
        
    def _ensure_collection_exists(self, collection_name: str):
        try:
            self.qdrant_client.get_collection(collection_name=collection_name)
        except Exception:
            self.qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config=models.VectorParams(size=self.vector_size, distance=self.distance_metric)
            )
            
        fields_to_index = ["metadata.course_id", "metadata.document_type"]
        for field_name in fields_to_index:
            try:
                self.qdrant_client.create_payload_index(
                    collection_name=collection_name,
                    field_name=field_name,
                    field_schema=models.PayloadSchemaType.KEYWORD
                )
            except Exception:
                # Index might already exist, suppress error for idempotency
                pass
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        text = ""
        try:
            with open(pdf_path, "rb") as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                for page in reader.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            print(f"Error reading PDF file {pdf_path}: {e}")
        return text

    def add_syllabus(self, syllabus_text: str, metadata: Dict[str, Any]):
        if 'course_id' not in metadata:
            raise ValueError("Metadata must contain 'course_id'")

        preprocess_prompt = PromptTemplate.from_template(
            "Improve the following syllabus content by making it more structured, clear, and concise. "
            "Focus only on Modules and Units. Do not include course outcomes or lab work. "
            "Original Syllabus:\n{syllabus_content}\n\nImproved Syllabus:"
        )
        chain = preprocess_prompt | self.llm
        improved_syllabus = chain.invoke({"syllabus_content": syllabus_text}).content

        texts = self.syllabus_splitter.split_text(improved_syllabus)
        metadata['document_type'] = 'syllabus' 
        metadatas = [metadata.copy() for _ in texts]

        self.syllabus_store.add_texts(texts, metadatas=metadatas)

    def add_reference_material(self, reference_text: str, metadata: Dict[str, Any]):
        if 'course_id' not in metadata:
            raise ValueError("Metadata must contain 'course_id'")

        texts = self.reference_splitter.split_text(reference_text)
        metadata['document_type'] = 'reference'  
        metadatas = [metadata.copy() for _ in texts]

        self.reference_store.add_texts(texts, metadatas=metadatas)

    def generate_course_modules(self, course_id: str, num_modules: int = 8) -> str:
        search_filter = models.Filter(must=[
            models.FieldCondition(key="metadata.course_id", match=models.MatchValue(value=course_id)),
            models.FieldCondition(key="metadata.document_type", match=models.MatchValue(value="syllabus")),
        ])
        results = self.syllabus_store.similarity_search(query="course syllabus structure", k=100, filter=search_filter)
        if not results: return f'{{"error": "No syllabus found for course_id: {course_id}"}}'

        syllabus_content = "\n\n".join([doc.page_content for doc in results])
        parser = PydanticOutputParser(pydantic_object=CourseModules)
        modules_prompt = PromptTemplate(
            template="""You are an expert curriculum designer. Analyze the provided syllabus and structure it into {num_modules} coherent modules.
            For each module, provide a clear title and a concise description of its key topics.
            Syllabus: {syllabus_content}
            Your output must be only the JSON object described by the format instructions.
            {format_instructions}""",
            input_variables=["syllabus_content", "num_modules"],
            partial_variables={"format_instructions": parser.get_format_instructions()}
        )
        chain = modules_prompt | self.llm
        result = chain.invoke({"syllabus_content": syllabus_content, "num_modules": num_modules})
        try:
            parsed = parser.parse(result.content)
            return parsed.model_dump_json(indent=2)
        except Exception as e:
            return result.content

    def generate_ppt(self, topic: str, teacher_id: str, course_id: str) -> str:
        results = self.reference_store.similarity_search(
            query=self.topic, k=20,
            filter={"teacher_id": teacher_id, "course_id": course_id}
        )
        if not results:
            return f"# {topic.title}\n\nNo reference materials available for this topic in course '{course_id}'."
        
        reference_content = "\n\n".join([doc.page_content for doc in results])
        chain = self.study_material_prompt | self.llm
        result = chain.invoke({
            "topic": topic.title, "description": topic.description, "reference_content": reference_content
        })
        return result.content

    def generate_quiz_with_config(self, course_id: str, description: str, total_questions: int, duration: str, beginner: int, intermediate: int, advance: int) -> str:
        search_filter = models.Filter(must=[
            models.FieldCondition(key="metadata.course_id", match=models.MatchValue(value=course_id)),
            models.FieldCondition(key="metadata.document_type", match=models.MatchValue(value="reference")),
        ])
        results = self.reference_store.similarity_search(description, k=100, filter=search_filter)
        if not results: return f'{{"error": "No reference found for course_id: {course_id}"}}'

        reference_context = "\n\n".join([doc.page_content for doc in results])
        quiz_prompt = PromptTemplate.from_template(
            "Generate a quiz in valid JSON format based on this config:\n"
            "Topic: {description}\nReference Context: {reference_context}\n"
            "Total Questions: {total_questions} ({beginner} beginner, {intermediate} intermediate, {advance} advanced)\n"
            "Duration: {duration} minutes\n"
            "Format: Return a JSON object with a single key 'quiz' containing a list of question objects. "
            "Each question must have 'question' (str), 'options' (dict a,b,c,d), 'answer' (str 'a','b','c', or 'd'), and 'level' (str)."
            "Return ONLY the valid JSON, nothing else."
        )
        chain = quiz_prompt | self.llm
        result = chain.invoke({
            "description": description, "reference_context": reference_context, "total_questions": total_questions,
            "duration": duration, "beginner": beginner, "intermediate": intermediate, "advance": advance
        })
        return result.content

    def check_assignment_relevance(self, text: str, topic: str, description: str) -> bool:
        relevance_prompt = PromptTemplate.from_template(
            "Is the following submission relevant to the topic?\n"
            "Topic: {topic}\nDescription: {description}\nSubmission: {text}\n"
            "Answer with ONLY 'true' or 'false'."
        )
        chain = relevance_prompt | self.llm
        result = chain.invoke({"text": text, "topic": topic, "description": description})
        return 'true' in result.content.strip().lower()

    def grade_assignment(
        self,
        assignment_text: str,
        topic: str,
        description: str,
        criteria: List[str],
        max_scores: List[int],
        course_id: Optional[str] = None  # Add course_id if available
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Grades a submission, first checking for relevance.
        Now uses relevant reference context for more accurate grading.
        """
        # Step 1: Relevance Check
        if not self.check_assignment_relevance(assignment_text, topic, description):
            return None, "Assignment rejected: The submission is not relevant to the specified topic."

        # Step 2: Grading
        if not all([assignment_text, criteria]) or len(criteria) != len(max_scores):
            return None, "Invalid input: Assignment text, criteria, or score mapping is incorrect."
        
        # Step 3 : Retrieve relevant reference context ---
        reference_context = ""
        if course_id:
            search_filter = {
                "course_id": course_id,
                "document_type": "reference"
            }
            results = self.reference_store.similarity_search(
                query=topic, k=10, filter=search_filter
            )
            if results:
                reference_context = "\n\n".join([doc.page_content for doc in results])

        clean_keys = [clean_for_json_key(c) for c in criteria]
        parser = PydanticOutputParser(pydantic_object=GradingOutput)
        
        criteria_prompt_list = [f'- "{clean_keys[i]}": {criteria[i]} (out of {max_scores[i]})' for i in range(len(criteria))]
        
        grading_prompt = PromptTemplate(
            template="""Grade the assignment based on the criteria and the provided reference context. Provide scores and overall feedback.

            Assignment Text:
            ---
            {assignment_text}
            ---

            Reference Context:
            ---
            {reference_context}
            ---

            Grading Criteria (JSON Key: Description (Max Score)):
            {criteria_list}

            {format_instructions}
                    """,
                    input_variables=["assignment_text", "criteria_list", "reference_context"],
                    partial_variables={"format_instructions": parser.get_format_instructions()}
            )

        chain = grading_prompt | self.llm | parser
        
        try:
            parsed_result = chain.invoke({
                "assignment_text": assignment_text,
                "criteria_list": "\n".join(criteria_prompt_list),
                "reference_context": reference_context
            })

            final_report = {"feedback": parsed_result.feedback}
            calculated_total = 0.0

            for i, original_criterion in enumerate(criteria):
                clean_key = clean_keys[i]
                max_score = float(max_scores[i])
                score = float(parsed_result.scores.get(clean_key, 0.0))
                score = max(0.0, min(score, max_score))
                
                final_report[original_criterion] = score
                calculated_total += score
            
            final_report["grade"] = calculated_total
            return final_report, None

        except Exception as e:
            return None, f"An error occurred during the grading process: {str(e)}"
