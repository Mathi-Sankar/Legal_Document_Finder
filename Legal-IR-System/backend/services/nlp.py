import re
from pypdf import PdfReader

# Mocking the pipeline for extraction since Transformers pipeline could be slow on cpu
# In a real environment, we would use HuggingFace pipeline('text-generation')
# or zero-shot-classification for extraction.

def process_pdf_document(file_path: str) -> str:
    """Extracts raw text from PDF."""
    try:
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""

def extract_metadata(text: str) -> dict:
    """
    Given a raw legal text, extracts key metadata such as:
    - Date
    - Type of Crime / Category
    - Case Name
    """
    metadata = {
        "date": "2024",
        "crime_type": "Civil",
        "case_name": "Unknown vs Unknown"
    }
    
    # 1. Date extraction regex (e.g. 12 May 2012 or 2012-05-12)
    # very naive check
    date_match = re.search(r'(19|20)\d{2}', text)
    if date_match:
        metadata["date"] = date_match.group(0)
        
    # 2. Case Name extraction (e.g. State vs X, or X v. Y)
    vs_match = re.search(r'([A-Za-z\s]+)\s+(v\.|vs|versus)\s+([A-Za-z\s]+)', text, re.IGNORECASE)
    if vs_match:
        p1 = " ".join(vs_match.group(1).split()[-3:]) # get last 3 words
        p2 = " ".join(vs_match.group(3).split()[:3])  # get first 3 words
        metadata["case_name"] = f"{p1} v. {p2}".strip()

    # 3. Simple Keyword based classification for Crime Type
    lower_text = text.lower()
    if 'murder' in lower_text or 'homicide' in lower_text:
        metadata["crime_type"] = "Homicide"
    elif 'theft' in lower_text or 'robbery' in lower_text or 'fraud' in lower_text:
        metadata["crime_type"] = "Theft/Fraud"
    elif 'divorce' in lower_text or 'custody' in lower_text:
        metadata["crime_type"] = "Family Law"
    elif 'tax' in lower_text or 'revenue' in lower_text:
        metadata["crime_type"] = "Tax/Corporate"

    return metadata

def query_rag(query: str, context: str) -> str:
    """
    Summarize and answer based on the local context.
    A full solution would load a hugging face model `google-bert/bert-large-uncased-whole-word-masking-finetuned-squad`
    to answer the context question exactly. Let's build a mock integration.
    """
    if not context:
        return "I could not find any context related to this query."
        
    # Return a simulated RAG response combining context hints.
    return f"Based on the provided legal documents, the context indicates that: \n\n{context[:300]}...\n\n(AI inference would be placed here)."
