from transformers import AutoModelForSequenceClassification, AutoTokenizer, GPT2LMHeadModel, GPT2Tokenizer
import torch
import numpy as np

import warnings
warnings.filterwarnings("ignore")

# Load AI detection model
ai_model_name = "roberta-base-openai-detector"
ai_tokenizer = AutoTokenizer.from_pretrained(ai_model_name)
ai_model = AutoModelForSequenceClassification.from_pretrained(ai_model_name)

# Load GPT-2 for perplexity
perplexity_model = GPT2LMHeadModel.from_pretrained("gpt2")
perplexity_tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
perplexity_model.eval()


def calculate_perplexity(text):
    """
    Calculate perplexity score using GPT-2.
    """
    encodings = perplexity_tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    
    with torch.no_grad():
        outputs = perplexity_model(**encodings, labels=encodings["input_ids"])
    
    loss = outputs.loss
    perplexity = torch.exp(loss).item()
    
    return perplexity


def calculate_burstiness(text):
    """
    Calculate burstiness by measuring sentence length variability.
    """
    sentences = text.split('.')
    sentence_lengths = [len(s.split()) for s in sentences if s.strip()]
    
    if len(sentence_lengths) < 2:
        return 0  # Avoid division by zero
    
    mean_length = np.mean(sentence_lengths)
    std_dev = np.std(sentence_lengths)
    
    burstiness = std_dev / mean_length if mean_length != 0 else 0
    return burstiness


def detect_ai_content(text, threshold=0.7):
    """
    Combined detection using AI model, perplexity, and burstiness.
    
    Args:
        text (str): The text to analyze
        threshold (float): Threshold for classification (0.0-1.0)
        
    Returns:
        dict: Complete analysis with individual scores and final percentage
    """

    # Trim very long texts to avoid OOM errors
    if len(text) > 10000:
        text = text[:10000]
    
    # --- AI Model Detection ---
    inputs = ai_tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
    with torch.no_grad():
        outputs = ai_model(**inputs)
    
    # Get AI score
    probs = torch.softmax(outputs.logits, dim=1)
    ai_score = probs[0][1].item()

    # --- Perplexity and Burstiness ---
    perplexity = calculate_perplexity(text)
    burstiness = calculate_burstiness(text)

    # Normalize scores
    perplexity_score = max(0, min(1, 1 - (perplexity / 100)))  # Higher perplexity → more human-like
    burstiness_score = min(burstiness, 1)                      # Higher burstiness → more human-like

    # Weighted average of all scores (0-1 scale)
    ai_percentage = (
        (ai_score * 0.1) +       
        (perplexity_score * 0.4) +     
        (burstiness_score * 0.5)       
    )
    
    # Determine confidence level
    confidence = "high" if abs(ai_percentage - 0.5) > 0.3 else "medium" if abs(ai_percentage - 0.5) > 0.15 else "low"
    
    return {
        "ai_percentage": round(ai_percentage * 100, 2),
        "confidence": confidence,
        "is_ai_generated": ai_percentage > threshold,
        "details": {
            "ai_model_score": round(ai_score * 100, 2),
            "perplexity": round(perplexity, 2),
            "perplexity_score": round(perplexity_score * 100, 2),
            "burstiness": round(burstiness, 2),
            "burstiness_score": round(burstiness_score * 100, 2)
        }
    }
