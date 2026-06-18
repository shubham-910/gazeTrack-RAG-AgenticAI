import json
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# Strict response schema for Google Gemini API
GEMINI_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "clinical_assessment": {
            "type": "STRING",
            "description": "Clinical assessment summarizing user's gaze focus (Left vs Right bias), how it relates to their GAD-7 score, and its clinical implication."
        },
        "attention_bias_ratio": {
            "type": "NUMBER",
            "description": "Calculated bias score between 0.0 and 1.0 (e.g. ratio of gaze points towards negative stimuli)."
        },
        "cognitive_techniques": {
            "type": "ARRAY",
            "description": "At least 2 actionable Cognitive Behavioral Therapy (CBT) or Attentional Bias Modification (ABM) techniques.",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "title": {"type": "STRING"},
                    "description": {"type": "STRING"}
                },
                "required": ["title", "description"]
            }
        },
        "actionable_next_steps": {
            "type": "ARRAY",
            "description": "At least 2 simple next steps for daily self-guided practice.",
            "items": {"type": "STRING"}
        }
    },
    "required": [
        "clinical_assessment", 
        "attention_bias_ratio", 
        "cognitive_techniques", 
        "actionable_next_steps"
    ]
}

def generate_agent_cbt_feedback(user_profile, gad_score, anxiety_level, left_count, right_count, final_prediction):
    """
    Orchestrates the AI CBT Gaze Agent loop. Consumes patient history and spatial metrics
    and returns clinical recommendations using Google Gemini structured outputs.
    """
    total_gaze = left_count + right_count
    bias_ratio = round(left_count / total_gaze if total_gaze > 0 else 0.5, 2)
    
    # Check if API key is configured
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    
    # 1. Fallback Strategy if API Key is not set
    if not api_key:
        logger.warning("GEMINI_API_KEY not found in settings. Running local fallback simulator.")
        return generate_mock_feedback(anxiety_level, bias_ratio, final_prediction)

    # 2. Setup Gemini REST endpoint
    models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"]
    
    # 3. Construct System Instructions & User Context
    # Stripping Personally Identifiable Information (PII) to comply with HIPAA guidelines.
    # We replace user_profile.username with a pseudonymous Patient Reference ID.
    prompt = f"""
    You are an AI Clinical Cognitive Behavioral Therapy (CBT) Agent specializing in Attentional Bias Modification (ABM).
    A user has completed an assessment cycle. Process the following clinical parameters to generate a patient-facing report:
    
    - Patient Reference ID: PATIENT-{user_profile.id}
    - GAD-7 Anxiety Score: {gad_score} ({anxiety_level})
    - Gaze Count on Negative Stimuli (Left): {left_count}
    - Gaze Count on Positive Stimuli (Right): {right_count}
    - Calculated Attentional Focus Prediction: {final_prediction} (Bias Ratio towards negative targets: {bias_ratio})
    
    Provide an encouraging, scientifically grounded clinical response. Suggest custom CBT exercises matching their attention patterns.
    """
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": GEMINI_SCHEMA,
            "temperature": 0.3
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    parsed_data = None
    for model_name in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            response.raise_for_status()
            result_json = response.json()
            
            # Extract response text from Gemini format
            candidate_parts = result_json['candidates'][0]['content']['parts']
            response_text = candidate_parts[0]['text']
            
            parsed_data = json.loads(response_text)
            logger.info(f"Successfully generated CBT feedback using {model_name}.")
            break
        except Exception as e:
            logger.warning(f"CBT feedback generation failed with {model_name}: {str(e)} — trying next model.")
            
    if not parsed_data:
        logger.error("All Gemini models failed for CBT feedback. Falling back to mock generator.")
        return generate_mock_feedback(anxiety_level, bias_ratio, final_prediction)
        
    return parsed_data


def generate_mock_feedback(anxiety_level, bias_ratio, final_prediction):
    """
    Generates high-quality simulated clinical outputs if API limits are hit or key is unconfigured.
    """
    if final_prediction == "Left" or bias_ratio > 0.5:
        assessment = (
            f"Your gaze tracking assessment indicates an attentional bias towards negative visual stimuli ({int(bias_ratio*100)}%). "
            f"In the context of your {anxiety_level.lower()}, this pattern suggests a threat-monitoring focus common in anxious states, "
            f"where negative imagery captures interest longer than positive alternatives."
        )
        tech_1_title = "Attention Shifting Practice (ABM)"
        tech_1_desc = "Consciously practice shifting focus from threat-related thoughts or objects toward neutral or positive aspects in your workspace."
        tech_2_title = "Cognitive Restructuring"
        tech_2_desc = "Notice automatic threat-focused assumptions and challenge them by compiling evidence for safety and positive outcomes."
        step_1 = "Dedicate 5 minutes daily to view positive imagery or practice progressive muscle relaxation."
        step_2 = "Keep a brief log of situations where you notice threat-monitoring triggers."
    else:
        assessment = (
            f"Your gaze tracking assessment shows a healthy visual focus towards positive stimuli ({int((1-bias_ratio)*100)}%). "
            f"This is an encouraging sign of attentional flexibility despite your reported {anxiety_level.lower()} symptoms."
        )
        tech_1_title = "Behavioral Activation"
        tech_1_desc = "Schedule small positive activities during the day to reinforce positive visual focus and sensory enjoyment."
        tech_2_title = "Mindfulness Anchor Exercises"
        tech_2_desc = "Observe neutral environments without evaluation to strengthen baseline grounding in the present moment."
        step_1 = "Engage in one preferred hobby or outdoor walk for 15 minutes today."
        step_2 = "Continue tracking your daily gaze behaviors to strengthen positive attention pathways."

    return {
        "clinical_assessment": assessment,
        "attention_bias_ratio": bias_ratio,
        "cognitive_techniques": [
            {"title": tech_1_title, "description": tech_1_desc},
            {"title": tech_2_title, "description": tech_2_desc}
        ],
        "actionable_next_steps": [step_1, step_2]
    }


def embed_text(text):
    """
    Generates a 768-dimensional vector embedding for the given text.
    Tries models in order: text-embedding-004 -> embedding-001 -> zero-vector fallback.
    This ensures the embedding always returns a valid 768-dim list so the rest
    of the application (LLM response creation, RAG search) never crashes.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    if not api_key:
        logger.warning("GEMINI_API_KEY not set — returning zero vector for embedding.")
        return [0.0] * 768

    # Model priority: newest stable → older stable → zero-vector
    candidates = [
        ("models/gemini-embedding-001", "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent"),
        ("models/text-embedding-004", "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"),
        ("models/embedding-001",      "https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent"),
    ]

    for model_name, base_url in candidates:
        url = f"{base_url}?key={api_key}"
        payload = {
            "model": model_name,
            "content": {"parts": [{"text": text}]}
        }
        if "gemini-embedding-001" in model_name:
            payload["outputDimensionality"] = 768

        try:
            response = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            embedding = data.get("embedding", {}).get("values", [])

            if embedding and len(embedding) == 768:
                logger.info(f"Embedding generated successfully using {model_name}.")
                return embedding
            else:
                logger.warning(f"Unexpected embedding dimensions from {model_name}: got {len(embedding)}.")
        except Exception as e:
            logger.warning(f"embed_text failed with {model_name}: {str(e)} — trying next model.")

    # All models failed — return a deterministic zero-vector so the caller never crashes.
    # The RAG chat will still work via the Python fallback similarity search.
    logger.error("All embedding models failed. Returning zero vector.")
    return [0.0] * 768


def generate_rag_response(user_query, context_records):
    """
    Calls Gemini to answer a user query based on their historical session records.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', '')
    if not api_key:
        return "The Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file."

    # Prompt construction
    context_text = "\n\n".join(
        f"--- Session ID: {rec['id']} (Date: {rec['date']}) ---\n{rec['text']}"
        for rec in context_records
    )

    prompt = f"""You are an AI Clinical CBT Assistant helping a user review their historical gaze tracking and mental health data.
You have retrieved the following past sessions from the user's secure database:

{context_text}

User Query: "{user_query}"

Instructions:
1. Answer the user's query thoughtfully and empathetically based ONLY on the provided session records.
2. If the answer cannot be found in the context, politely say so.
3. Explicitly cite the session date when drawing conclusions (e.g., "In your session on Jun 6th, ...").
4. Provide the final response in clear, conversational markdown. Do not include internal reasoning steps."""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.2}
    }

    models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"]
    
    for model_name in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            response = requests.post(
                url,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            result_json = response.json()

            # Safe extraction — avoids KeyError if Gemini returns unexpected structure
            candidates = result_json.get('candidates', [])
            if not candidates:
                logger.error(f"Gemini returned no candidates in RAG response for {model_name}.")
                continue

            parts = candidates[0].get('content', {}).get('parts', [])
            if not parts:
                logger.error(f"Gemini candidate has no parts in RAG response for {model_name}.")
                continue

            logger.info(f"Successfully generated RAG response using {model_name}.")
            return parts[0].get('text', "I'm sorry, I couldn't generate a response right now.")

        except requests.exceptions.Timeout:
            logger.error(f"Gemini RAG response timed out with {model_name}.")
            continue
        except Exception as e:
            logger.error(f"Error generating RAG response with {model_name}: {str(e)}")
            continue

    return "I'm sorry, I encountered an error while analyzing your history. Please try again later."
