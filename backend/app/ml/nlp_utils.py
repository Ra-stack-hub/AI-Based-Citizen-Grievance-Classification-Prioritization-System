import re
import spacy
from typing import List

# Load English tokenizer, tagger, parser and NER
# Note: Requires `python -m spacy download en_core_web_sm` to be run once
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import logging
    logging.warning("Downloading spacy model en_core_web_sm. This should only happen once.")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

def clean_text(text: str) -> str:
    """
    Cleans text by removing special characters, extra spaces, and lowercasing.
    """
    text = text.lower()
    text = re.sub(r"[^a-zA-Z0-9\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_keywords(text: str) -> List[str]:
    """
    Uses spaCy to extract nouns, proper nouns, and adjectives as keywords.
    """
    doc = nlp(text)
    keywords = set()
    for token in doc:
        if not token.is_stop and not token.is_punct and token.pos_ in ["NOUN", "PROPN", "ADJ"]:
            keywords.add(token.lemma_)
    return list(keywords)
