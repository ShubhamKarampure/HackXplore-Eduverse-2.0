from detector import detect_ai_content
import os

def main():
    # Path to the input file
    input_file = "sample_texts/sample1.txt"
    
    # Load the content
    with open(input_file, "r", encoding="utf-8") as file:
        text = file.read()
    
    # Detect AI content
    ai_percentage = detect_ai_content(text)
    
    # Display results
    print(f"AI-Generated Content Percentage: {ai_percentage:.2f}%")

if __name__ == "__main__":
    main()