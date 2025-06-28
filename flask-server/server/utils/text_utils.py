# /your_project_name/app/utils/text_utils.py
import re
import json

def clean_markdown_json_string(content: str) -> str:
    """Clean content by removing markdown code block markers for JSON and stripping."""
    # Remove markdown code block markers (```json, ```)
    content = re.sub(r'```json\s*', '', content, flags=re.IGNORECASE)
    content = re.sub(r'```\s*', '', content)
    # Remove any leading/trailing backticks or quotes that might remain
    content = content.strip()
    content = re.sub(r'^[`\']+|[`\']+$', '', content)
    return content

def parse_json_string(json_string: str) -> any:
    """Attempts to parse a JSON string, with cleaning."""
    cleaned_string = clean_markdown_json_string(json_string)
    try:
        return json.loads(cleaned_string)
    except json.JSONDecodeError as e:
        print(f"Initial JSON decode failed: {e}. Raw string: {cleaned_string}")
        # Attempt further cleaning for common LLM output issues if necessary,
        # for example, trying to fix trailing commas or unquoted keys if robust parsing is needed.
        # For now, we'll re-raise or return an error indicator.
        raise ValueError(f"Could not parse JSON string after cleaning: {cleaned_string}") from e

def clean_for_json_key(text: str) -> str:
    """Cleans a string to be a valid JSON key (simple version)."""
    # Remove special characters, replace spaces with underscores
    return re.sub(r'[^\w\s]', '', text).strip().replace(' ', '_')

def clean_markdown_for_marp(content: str) -> str:
    """
    Cleans markdown content for Marp, preserving Mermaid blocks
    and removing other ``` code blocks.
    """
    if '```mermaid' in content:
        lines = content.split('\n')
        in_mermaid_block = False
        clean_lines = []
        
        for line in lines:
            if '```mermaid' in line:
                in_mermaid_block = True
                clean_lines.append(line)
            elif '```' in line and in_mermaid_block:
                in_mermaid_block = False
                clean_lines.append(line)
            elif in_mermaid_block:
                clean_lines.append(line)
            else:
                # Clean non-mermaid lines from other code blocks
                clean_line = line.replace("```markdown", "").replace("```", "")
                clean_lines.append(clean_line)
                
        return '\n'.join(clean_lines)
    else:
        # If no mermaid blocks, remove all code block markers
        return content.replace("```markdown", "").replace("```", "").strip()