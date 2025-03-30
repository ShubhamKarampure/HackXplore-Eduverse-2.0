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
            template="""Create comprehensive, information-dense slides in Marp-compatible markdown for:

Topic: {topic}
Description: {description}

Based on these detailed reference materials:
{reference_content}

Content Requirements:
- Create approx 20 slides
- Include extensive factual content, definitions, and explanations
- Cover the topic thoroughly with academic depth
- Include relevant theories, methodologies, historical context, and current applications
- Define all technical terminology completely
- Incorporate statistics, research findings, and scholarly perspectives
- Include key examples that demonstrate practical applications
- Provide comprehensive explanations of complex concepts

Formatting Guidelines:
- Begin each slide with '---'
- PLEASE DO NOT ADD ```markdown
- Make sure the slide do no overflow 
- Use hierarchical headings to organize dense information (## for main titles, ### for subtitles)
- Employ multi-level bullet points for detailed breakdowns
- Format each slide to maximize information while maintaining readability
- Use **bold** and *italics* to highlight critical terms and concepts
- ADD reference at the end . Make sure the references are valid and do no use your own brain (which you ofcourse do not have)
- ADD Atleast 1 MERMAID DIAGRAMS. Also make sure the diagram is small to fit and does not overflow

DO NOT:
- Add Marp metadata (I'll handle that separately)
- Include image references
- Write annotations like "Here is the slide content"
- Sacrifice depth for brevity
- Omit important details or nuances
- ADD ``` markdown code block
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
    
    def generate_quiz_with_config(self, description: str, total_questions: int, duration:str, beginner: int, intermediate: int, advance:int ) -> str:
        """
        Generate a quiz based on a description and quiz configuration.
        First, query the reference store to get related context, then pass it into the prompt.

        Args:
            description: Description of the quiz topic.
            total_questions: Number of total questions to generate.
            duration: Duration of the quiz in minutes.
            beginner: Number of beginner questions.
            intermediate: Number of intermediate questions.
            advance: Number of advanced questions.

        Returns:
            A JSON string representing the quiz.
        """
        # First, get reference context
        results = self.reference_store.similarity_search(description, k=2)
        if results:
            reference_context = "\n\n".join([doc.page_content for doc in results])
        else:
            reference_context = "No additional reference materials available."

        # Double braces for literal JSON blocks
        quiz_prompt = PromptTemplate(
            template="""Generate a quiz in JSON format based on the following configuration.
            I AM USING PYTHON KEEP THAT IN MIND WHILE GIVING OUTPUT.

Quiz Description: {description}
Reference Materials: {reference_context}
Total Questions: {total_questions}
Question Levels Distribution: beginner {beginner}, intermediate {intermediate}, advanced {advance}
Duration: {duration} minutes

For each question, provide exactly four options labeled "a", "b", "c", and "d". The answer should be one of the four options: "a", "b", "c", or "d". 

Output the result in valid JSON format with double quotes around all keys and values. The JSON format should be an array of question objects, as follows.
Make sure the model’s prompt instructs it to return only valid JSON (no extra formatting):

quiz:[
{{
    "question": "Question text",
    "options": {{
        "a": "Option A text", 
        "b": "Option B text", 
        "c": "Option C text", 
        "d": "Option D text"
    }},
    "answer": "Correct answer (a, b, c, or d)"
}},
{{
    "question": "Question text 2",
    "options": {{
        "a": "Option A text 2", 
        "b": "Option B text 2", 
        "c": "Option C text 2", 
        "d": "Option D text 2"
    }},
    "answer": "Correct answer 2 (a, b, c, or d)"
}},
...
]

Please generate exactly {total_questions} questions distributed as follows:
Beginner: {beginner} questions,
Intermediate: {intermediate} questions,
Advanced: {advance} questions.
Do not include any additional commentary outside of the JSON.
""",
            input_variables=[
                "description",
                "reference_context",
                "total_questions",
                "duration",
                "beginner",
                "intermediate",
                "advance"
            ],
        )


        chain = quiz_prompt | self.llm
        result = chain.invoke({
            "description": description,
            "reference_context": reference_context,
            "total_questions": total_questions,
            "duration": duration,
            "beginner": beginner,
            "intermediate": intermediate,
            "advance": advance
        })

        return result.content

    def generate_course_modules(self, description: str, num_modules: int = 8) -> str:
        """
        Generate a structured course module plan based on a description.
        
        Args:
            description: Description of the course/topic.
            num_modules: Number of modules to generate (default: 8).
            
        Returns:
            A JSON string representing the course modules structure.
        """
        # Query reference store for relevant content
        results = self.syllabus_store.similarity_search(description, k=3)
        if results:
            reference_context = "\n\n".join([doc.page_content for doc in results])
        else:
            reference_context = "No additional reference materials available."
        
        modules_prompt = PromptTemplate(
            template="""You are a tutor planning a course. Based on the following course description and reference materials, 
generate a well-structured course divided into proper modules.

Course Description: {description}
Reference Materials: {reference_context}

Return the result as valid JSON with an array named "modules" containing exactly {num_modules} module objects. Each module should strictly follow this format:
{{
  "modules": [
    {{
      "title": "Module Title",
      "description": "Module description.",
      "order": 1
    }}
  ]
}}

The modules should build upon each other in a logical learning sequence. Focus on providing comprehensive coverage 
while ensuring a smooth learning curve.

Important: Return only valid JSON with exactly {num_modules} modules. Do not include any commentary outside the JSON structure.
""",
            input_variables=[
                "description",
                "reference_context",
                "num_modules"
            ],
        )

        chain = modules_prompt | self.llm
        result = chain.invoke({
            "description": description,
            "reference_context": reference_context,
            "num_modules": num_modules
        })
        
        return result.content

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

