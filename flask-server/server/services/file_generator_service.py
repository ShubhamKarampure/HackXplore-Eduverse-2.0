# /your_project_name/app/services/file_generator_service.py
import os
import subprocess # For calling marp, mmdc
from server.config import app_config
from server.utils.text_utils import clean_markdown_for_marp

class FileGeneratorService:
    def __init__(self):
        self.upload_folder = app_config.UPLOAD_FOLDER
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)

    def _run_command(self, command: list[str]):
        try:
            print(f"Executing command: {' '.join(command)}")
            result = subprocess.run(command, capture_output=True, text=True, check=True, encoding='utf-8')
            print(f"Command stdout: {result.stdout}")
            if result.stderr:
                print(f"Command stderr: {result.stderr}")
            return True, None
        except subprocess.CalledProcessError as e:
            error_message = f"Command '{' '.join(e.cmd)}' failed with exit code {e.returncode}.\nStdout: {e.stdout}\nStderr: {e.stderr}"
            print(error_message)
            return False, error_message
        except FileNotFoundError:
            error_message = f"Command '{command[0]}' not found. Ensure Marp CLI / mmdc is installed and in PATH."
            print(error_message)
            return False, error_message
        except Exception as e:
            error_message = f"An unexpected error occurred while running command: {str(e)}"
            print(error_message)
            return False, error_message


    def generate_presentation_files(self, topic: str, materials_content_map: dict) -> tuple[dict | None, str | None]:
        """
        Generates .md and then converts to .pptx, .pdf, .html based on Marp.

        Args:
            topic (str): The main topic name for filenames.
            materials_content_map (dict): A dictionary where keys are subtopic/slide titles
                                          and values are their markdown content.

        Returns:
            A dictionary with paths to generated files or an error message.
        """
        base_filename = topic.replace(' ', '_').lower()
        md_filename = f"{base_filename}_materials.md"
        md_filepath = os.path.join(self.upload_folder, md_filename)

        # Generate markdown file
        try:
            with open(md_filepath, "w", encoding="utf-8") as f:
                f.write('---\nmarp: true\ntheme: default\npaginate: true\n---\n\n') # Basic Marp header
                for subtopic, content in materials_content_map.items():
                    f.write(f"\n")
                    f.write(f"### {subtopic}\n\n")
                    cleaned_content = clean_markdown_for_marp(content)
                    f.write(cleaned_content)
                    f.write("\n\n---\n") # Separator for next slide
            print(f"Markdown file generated at: {md_filepath}")
        except Exception as e:
            return None, f"Failed to write markdown file: {str(e)}"

        # Pre-process with mmdc if mermaid diagrams are present (optional, adapt if needed)
        # Check if any content has mermaid diagrams
        # has_mermaid = any('```mermaid' in c for c in materials_content_map.values())
        # if has_mermaid:
        #     print("Mermaid diagram detected, running mmdc pre-processing...")
        #     # Note: mmdc typically converts .md to .html with rendered mermaid.
        #     # Marp can also handle mermaid directly if configured with a plugin or newer versions.
        #     # This step might need adjustment based on your exact Marp setup for mermaid.
        #     # If Marp handles mermaid, this mmdc step might be for SVG conversion if needed elsewhere.
        #     # For Marp --html, it often renders mermaid if enabled.
        #     # The original code runs `mmdc -i {file_path} -o {file_path}` which seems to modify in place or output to same name.
        #     # This is unusual. mmdc usually outputs to a different format or filename.
        #     # Assuming marp handles mermaid directly for now, or this step needs clarification.
        #     # success, err = self._run_command(["mmdc", "-i", md_filepath, "-o", md_filepath]) # Be cautious with in-place modification
        #     # if not success:
        #     #     return None, f"mmdc processing failed: {err}"

        generated_files = {"md": md_filepath}

        # Generate PPTX
        pptx_filename = f"{base_filename}_slides.pptx"
        pptx_filepath = os.path.join(self.upload_folder, pptx_filename)
        success, err = self._run_command([
            "marp", "--allow-local-files", md_filepath, "--html", "--pptx", "-o", pptx_filepath
        ]) # Added --html as Marp often needs it for features like Mermaid in PPTX
        if success:
            generated_files["pptx"] = pptx_filepath
            print(f"PPTX file generated at: {pptx_filepath}")
        else:
            # Optionally continue generating other formats or return error immediately
            print(f"PPTX generation failed: {err}")
            # return None, f"PPTX generation failed: {err}" # Uncomment to stop on first failure


        # Generate PDF
        pdf_filename = f"{base_filename}_materials.pdf"
        pdf_filepath = os.path.join(self.upload_folder, pdf_filename)
        success, err = self._run_command([
            "marp", "--allow-local-files", md_filepath, "--html", "--pdf", "-o", pdf_filepath
        ]) # Added --html
        if success:
            generated_files["pdf"] = pdf_filepath
            print(f"PDF file generated at: {pdf_filepath}")
        else:
            print(f"PDF generation failed: {err}")

        # Generate HTML
        html_filename = f"{base_filename}_materials.html"
        html_filepath = os.path.join(self.upload_folder, html_filename)
        success, err = self._run_command([
            "marp", "--allow-local-files", md_filepath, "--html", "-o", html_filepath # Marp outputs HTML directly
        ])
        if success:
            generated_files["html"] = html_filepath
            print(f"HTML file generated at: {html_filepath}")
        else:
            print(f"HTML generation failed: {err}")

        if not generated_files or len(generated_files) <=1 : # only md
            return None, "No output files were successfully generated by Marp."

        return generated_files, None

file_generator_service_instance = FileGeneratorService()