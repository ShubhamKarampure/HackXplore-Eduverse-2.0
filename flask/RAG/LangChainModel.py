from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import PyPDF2
import os

load_dotenv()

class Topic(BaseModel):
    """Model for extracted topics from syllabus."""
    title: str = Field(description="The title of the topic")
    description: str = Field(description="Brief description of the topic")
    subtopics: Optional[List[str]] = Field(default_factory=list, description="List of subtopics if any")

class Topics(BaseModel):
    """Container for multiple topics."""
    topics: List[Topic] = Field(description="List of topics from the syllabus")

class StudyMaterialRAG:
    def __init__(
        self,
        groq_api_key: str = os.getenv("GROQ_API_KEY"),
        qdrant_api_key: str = os.getenv("QDRANT_API_KEY"),
        qdrant_url: str = os.getenv("QDRANT_URL"),
        model_name: str = "llama3-8b-8192",
        gemini_api_key: str = os.getenv("GEMINI_API_KEY"),
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2",
        syllabus_collection: str = "syllabus",
        reference_collection: str = "references"
    ):
        self.llm = ChatGoogleGenerativeAI(
            model='gemini-2.0-flash-exp',
            temperature=0,
            max_tokens=None,
            timeout=None,
            max_retries=2,
            api_key=gemini_api_key,
        )

        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        
        self.syllabus_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, 
            chunk_overlap=100,
            length_function=len
        )
        
        self.reference_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,  
            chunk_overlap=200,
            length_function=len
        )
        
        self.syllabus_store = QdrantVectorStore.from_existing_collection(
            collection_name=syllabus_collection,
            url=qdrant_url,
            api_key=qdrant_api_key,
            embedding=self.embeddings,
            timeout=60
        )
        
        self.reference_store = QdrantVectorStore.from_existing_collection(
            collection_name=reference_collection,
            url=qdrant_url,
            api_key=qdrant_api_key,
            embedding=self.embeddings
        )
        
        self.topic_extraction_prompt = PromptTemplate(
            template="""Extract the main topics from this syllabus content. For each topic, provide a title, 
            brief description, and any subtopics mentioned.
            
            Syllabus: {syllabus_content}
            
            Format the output as a JSON list of topics with their descriptions and subtopics.
            {format_instructions}
            """,
            input_variables=["syllabus_content"],
            partial_variables={"format_instructions": PydanticOutputParser(pydantic_object=Topics).get_format_instructions()}
        )

        self.study_material_prompt = PromptTemplate(
            template="""Create study material in Marp-compatible markdown format for the following topic.
            Use the reference information provided to create comprehensive, educational content.
            
            Topic: {topic}
            Topic Description: {description}
            Reference Materials: {reference_content}
            
            The output should be in Marp-compatible markdown with sections, bullet points, and emphasis on key concepts.
            Add '---' at the start of each slide.
            Also make only 10 pages slide at max.
            PLEASE DO NOT WRITE HERE IS THE SLIDE CONTENT.
            Also DO NOT write any extra content like this is the slide content.
            DO NOT ADD IMAGES OF ANY KIND.
            Include proper attribution to source materials and teacher ({teacher_id}).
            DO NOT ADD META DATA FOR MARP AT THE START I HAVE GIVEN IT i.e do not add
            ---
            marp=true
            theme=default
            ---
            """,
            input_variables=["topic", "description", "reference_content", "teacher_id"]
        )

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from a PDF file.

        Args:
            pdf_path: Path to the PDF file.

        Returns:
            Extracted text as a string.
        """
        text = ""
        try:
            with open(pdf_path, "rb") as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                for page in reader.pages:
                    text += page.extract_text()
        except Exception as e:
            print(f"Error reading PDF file {pdf_path}: {e}")
        return text

    def add_syllabus(self, syllabus_text: str, metadata: Dict[str, Any] = None):
        """
        Preprocess and add syllabus document to the syllabus collection and extract topics.

        Args:
            syllabus_text: Text content of the syllabus
            metadata: Metadata for the syllabus (course name, teacher ID, etc.)
        """
        preprocess_prompt = PromptTemplate(
            template="""Improve the following syllabus content by making it more structured, clear, and concise.
            Ensure the content is well-organized and easy to understand.
            Only add things which look MODULES. DO NOT ADD COURSE OUTCOME,LAB RELATED THINGS. Also just gives Modules and units please.

            Original Syllabus:
            {syllabus_content}

            Improved Syllabus:""",
            input_variables=["syllabus_content"]
        )
        chain = preprocess_prompt | self.llm
        result = chain.invoke({"syllabus_content": syllabus_text})

        try:
            improved_syllabus = result.content
            print("Syllabus text improved successfully.")
        except Exception as e:
            print(f"Error improving syllabus text: {e}")
            improved_syllabus = syllabus_text 

        texts = self.syllabus_splitter.split_text(improved_syllabus)

        if not metadata:
            metadata = {}

        if 'teacher_id' not in metadata:
            print("Warning: No teacher_id specified in metadata")

        if 'document_type' not in metadata:
            metadata['document_type'] = 'syllabus'

        metadatas = [metadata.copy() for _ in texts]

        combined_syllabus = "\n\n".join(texts)
        parser = PydanticOutputParser(pydantic_object=Topics)
        chain = self.topic_extraction_prompt | self.llm

        result = chain.invoke({"syllabus_content": combined_syllabus})

        try:
            topics_container = parser.parse(result.content)
            topics = topics_container.topics

            topic_texts = [
                f"Title: {topic.title}\nDescription: {topic.description}\nSubtopics: {', '.join(topic.subtopics or [])}"
                for topic in topics
            ]
            topic_metadatas = [
                {
                    "topic_title": topic.title,
                    "teacher_id": metadata.get("teacher_id", "Unknown"),
                    "document_type": "extracted_topic"
                }
                for topic in topics
            ]

            self.syllabus_store.add_texts(topic_texts, metadatas=topic_metadatas)
            print(f"Extracted topics added to the store: {[topic.title for topic in topics]}")

        except Exception as e:
            print(f"Error extracting topics: {e}")
            print(f"Raw output: {result.content}")

    def add_reference_material(self, reference_text: str, metadata: Dict[str, Any] = None):
        """
        Add reference material to the reference collection.

        Args:
            reference_text: Text content of the reference material
            metadata: Metadata for the reference (source, author, teacher ID, etc.)
        """
        texts = self.reference_splitter.split_text(reference_text)

        if not metadata:
            metadata = {}

        if 'teacher_id' not in metadata:
            print("Warning: No teacher_id specified in metadata")

        if 'document_type' not in metadata:
            metadata['document_type'] = 'reference'

        metadatas = [metadata.copy() for _ in texts]

        self.reference_store.add_texts(texts, metadatas=metadatas)
        print("Reference material added successfully.")

    def extract_topics(self, course_query: str) -> List[Topic]:
        """
        Extract topics from syllabus based on course query.

        Args:
            course_query: Query to find relevant syllabus content

        Returns:
            List of Topic objects
        """
        results = self.syllabus_store.similarity_search(
            course_query,
            k=3  
        )

        if not results:
            print("No relevant syllabus content found.")
            return []

        syllabus_content = "\n\n".join([doc.page_content for doc in results])

        parser = PydanticOutputParser(pydantic_object=Topics)
        chain = self.topic_extraction_prompt | self.llm

        result = chain.invoke({"syllabus_content": syllabus_content})

        try:
            topics_container = parser.parse(result.content)
            return topics_container.topics
        except Exception as e:
            print(f"Error parsing topics: {e}")
            print(f"Raw output: {result.content}")
            return []

    def generate_study_material(self, topic: Topic, teacher_id: str = "Unknown") -> str:
        """
        Generate study material for a specific topic.

        Args:
            topic: Topic object with title, description, and subtopics
            teacher_id: ID of the teacher creating the material

        Returns:
            Marp-compatible markdown for the study material
        """
        subtopics = topic.subtopics if topic.subtopics else []

        query = f"{topic.title} {' '.join(subtopics)}"
        results = self.reference_store.similarity_search(
            query,
            k=5  
        )

        if not results:
            print(f"No reference materials found for topic: {topic.title}")
            return f"# {topic.title}\n\nNo reference materials available for this topic."

        reference_content = "\n\n".join([doc.page_content for doc in results])

        chain = self.study_material_prompt | self.llm

        result = chain.invoke({
            "topic": topic.title,
            "description": topic.description,
            "reference_content": reference_content,
            "teacher_id": teacher_id
        })

        return result.content

    def create_full_course_materials(self, course_query: str, teacher_id: str) -> Dict[str, str]:
        """
        Create study materials for a single topic based on syllabus and references.

        Args:
            course_query: Query to find the relevant syllabus topic
            teacher_id: ID of the teacher creating the course

        Returns:
            Dictionary mapping the topic title to its study material content
        """
        topics = self.extract_topics(course_query)

        if not topics:
            print("No topics could be extracted from the syllabus.")
            return {"error": "No topics could be extracted from the syllabus."}
        
        topic = topics[0]  

        material = self.generate_study_material(topic, teacher_id)
        return {topic.title: material}

# # Example usage
# if __name__ == "__main__":
#     study_system = StudyMaterialRAG()

#     # Add a syllabus from a PDF file
#     syllabus_pdf_path = "syllabus.pdf"  # Replace with the actual path to your syllabus PDF
#     syllabus_text = study_system.extract_text_from_pdf(syllabus_pdf_path)
#     study_system.add_syllabus(syllabus_text, {"course_id": "CS101", "teacher_id": "T123"})

#     # Add reference materials from a PDF file
#     reference_pdf_path = "reference.pdf"  # Replace with the actual path to your reference PDF
#     reference_text = study_system.extract_text_from_pdf(reference_pdf_path)
#     study_system.add_reference_material(reference_text, {"source": "Programming Fundamentals", "teacher_id": "T123"})

#     # Generate materials for a single topic
#     materials = study_system.create_full_course_materials("Virtualisation", "T123")
    
#     # Save the output to a .md file
#     output_file = "study_materials.md"
#     with open(output_file, "w", encoding="utf-8") as f:
#         f.write('''---
# marp: true
# theme: gaia
# paginate: true
# backgroundColor: "#1E1E2E"
# color: white
# \n''')
#         for topic, content in materials.items():
#             f.write('---\n')
#             f.write(f"### {topic}\n\n")
#             f.write(content)
#             f.write("\n\n")

#     print(f"Study materials saved to {output_file}")
#     pptx_path = os.path.join('./', "slides.pptx")
#     os.system(f"marp {output_file} --pptx -o {pptx_path}")

