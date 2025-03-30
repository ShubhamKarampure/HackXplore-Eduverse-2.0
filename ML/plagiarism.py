import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def read_file(file_path):
    """Read the content of a text file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()


def detect_plagiarism(master_file, peer_folder):
    """
    Detect plagiarism between the master document and peer documents.
    
    Args:
    - master_file (str): Path to the master document.
    - peer_folder (str): Path to the folder containing peer documents.

    Returns:
    - dict: Plagiarism percentage for each peer document.
    - float: Average plagiarism percentage.
    """
    # Read master document
    master_text = read_file(master_file)

    # Read all peer documents
    peer_files = [f for f in os.listdir(peer_folder) if f.endswith('.txt')]
    peer_texts = [read_file(os.path.join(peer_folder, f)) for f in peer_files]

    # Combine master and peer documents for TF-IDF
    all_texts = [master_text] + peer_texts

    # Vectorize using TF-IDF
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(all_texts)

    # Calculate cosine similarities
    master_vector = tfidf_matrix[0]  # Master document vector
    results = {}
    total_percentage = 0

    for idx, peer_file in enumerate(peer_files):
        peer_vector = tfidf_matrix[idx + 1]  # Peer document vector
        similarity = cosine_similarity(master_vector, peer_vector)[0][0]
        plagiarism_percentage = round(similarity * 100, 2)
        
        results[peer_file] = plagiarism_percentage
        total_percentage += plagiarism_percentage

    # Calculate average plagiarism percentage
    average_percentage = round(total_percentage / len(peer_files), 2) if peer_files else 0

    return results, average_percentage


if __name__ == "__main__":
    # Example usage
    master = "sample_texts/master_doc.txt"
    peer_folder = "sample_texts/peers"

    plagiarism_results, average_plagiarism = detect_plagiarism(master, peer_folder)

    print(f"\nAverage Plagiarism Percentage: {average_plagiarism}%")
