import io
import logging
import requests
from PIL import Image, ExifTags

logger = logging.getLogger(__name__)

_ai_detector_pipeline = None

def get_ai_detector():
    global _ai_detector_pipeline
    if _ai_detector_pipeline is None:
        try:
            from transformers import pipeline
            logger.info("Loading AI image detector model...")
            # We use a ViT model for AI image detection. 
            # Note: The first run might take a while to download the model.
            _ai_detector_pipeline = pipeline("image-classification", model="umm-maybe/AI-image-detector")
            logger.info("AI image detector model loaded.")
        except Exception as e:
            logger.error(f"Failed to load AI image detector: {e}")
            _ai_detector_pipeline = "failed"
    return _ai_detector_pipeline

def analyze_image_authenticity(image_url: str) -> dict:
    """
    Detects if an image is real, AI-generated, or likely a downloaded stock photo (Google).
    """
    result = {
        "is_fake_image": False,
        "image_authenticity_score": 1.0,
        "details": "Real photo"
    }
    
    import base64

    if not image_url:
        return result

    try:
        if image_url.startswith("data:image"):
            # Parse base64
            header, encoded = image_url.split(",", 1)
            image_data = base64.b64decode(encoded)
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
        elif image_url.startswith("http"):
            response = requests.get(image_url, timeout=10)
            response.raise_for_status()
            image = Image.open(io.BytesIO(response.content)).convert("RGB")
        else:
            return result
        
        # 1. Check EXIF data (Heuristic for "Google photo" / downloaded photo)
        exif = image.getexif()
        has_camera_exif = False
        
        if exif:
            for k, v in exif.items():
                tag = ExifTags.TAGS.get(k, k)
                if tag in ['Make', 'Model', 'DateTimeOriginal', 'LensModel']:
                    has_camera_exif = True
                    break
                    
        # 2. AI Generation Detection (using HuggingFace model)
        detector = get_ai_detector()
        is_ai_generated = False
        ai_score = 0.0
        
        if detector and detector != "failed":
            preds = detector(image)
            for p in preds:
                label = p['label'].lower()
                if 'artificial' in label or 'fake' in label or 'ai' in label:
                    ai_score = p['score']
                    if ai_score > 0.5:
                        is_ai_generated = True
                        break
                elif 'human' in label or 'real' in label:
                    if p['score'] > 0.5:
                        is_ai_generated = False
                        ai_score = 1.0 - p['score']
                        break
        
        # Determine final verdict
        if is_ai_generated:
            result["is_fake_image"] = True
            result["image_authenticity_score"] = round(max(0.01, 1.0 - ai_score), 2)
            result["details"] = "AI-generated image detected"
        elif not has_camera_exif:
            result["is_fake_image"] = True
            result["image_authenticity_score"] = 0.4 
            result["details"] = "Possible downloaded/stock photo (No camera EXIF data)"
        else:
            result["is_fake_image"] = False
            result["image_authenticity_score"] = 0.95
            result["details"] = "Authentic camera photo"

    except Exception as e:
        logger.error(f"Error analyzing image {image_url}: {e}")
        # Default fallback
        pass

    return result
