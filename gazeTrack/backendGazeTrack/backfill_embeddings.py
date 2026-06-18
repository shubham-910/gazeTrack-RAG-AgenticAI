import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backendmentalhealth.settings')
django.setup()

from home.models import LLMResponse, SessionEmbedding, GadResponse
from home.services.agent_service import embed_text


def backfill():
    """
    Backfills SessionEmbedding records for all historical LLMResponse records.

    Strategy:
    - Skips sessions that already have an embedding.
    - Always saves the embedding, even if it is a zero-vector (which happens
      when the API key is invalid or rate-limited). This ensures the RAG chat
      works locally via the Python L2 distance fallback in ChatRAGView.
    - Prints a clear status for each record.
    """
    responses = LLMResponse.objects.all().select_related('prediction_test', 'user')
    total = responses.count()
    print(f"Found {total} historical LLM responses to embed.")

    if total == 0:
        print("Nothing to backfill. Run a gaze test first, then re-run this script.")
        return

    saved = 0
    skipped = 0
    failed = 0

    for count, response in enumerate(responses, 1):
        # Skip if a valid embedding already exists, but overwrite zero-vectors
        existing = SessionEmbedding.objects.filter(llm_response=response).first()
        if existing:
            # Check if it is a zero-vector
            is_zero_vector = all(v == 0.0 for v in existing.embedding)
            if not is_zero_vector:
                print(f"[{count}/{total}] Skipping Session {response.prediction_test.id} — already has a valid real embedding.")
                skipped += 1
                continue
            else:
                print(f"[{count}/{total}] Session {response.prediction_test.id} has a zero-vector embedding. Re-generating it...")
                existing.delete()

        print(f"[{count}/{total}] Generating embedding for Session {response.prediction_test.id}...", end=" ", flush=True)

        user = response.user
        prediction = response.prediction_test

        # Get the latest GAD score at or before this prediction
        gad_score = 0
        anxiety_level = "Unknown"
        latest_gad = GadResponse.objects.filter(
            user=user,
            submitted_at__lte=prediction.test_date
        ).order_by('-submitted_at').first()

        if latest_gad:
            gad_score = latest_gad.total_score
            if gad_score <= 4:
                anxiety_level = "Minimal anxiety"
            elif gad_score <= 9:
                anxiety_level = "Mild anxiety"
            elif gad_score <= 14:
                anxiety_level = "Moderate anxiety"
            else:
                anxiety_level = "Severe anxiety"

        session_text = (
            f"Date: {prediction.test_date.strftime('%Y-%m-%d')}\n"
            f"Anxiety Score: {gad_score} ({anxiety_level})\n"
            f"Attentional Bias: {prediction.final_prediction}\n"
            f"{response.response_llm}"
        )

        try:
            embedding_vector = embed_text(session_text)
        except Exception as e:
            print(f"\n  ERROR calling embed_text: {e}")
            failed += 1
            continue

        # Check if we got a valid real embedding or a zero-vector
        is_zero_vector = all(v == 0.0 for v in embedding_vector)
        if is_zero_vector:
            print(f"\n  WARNING: Got zero-vector (API key may be invalid or rate-limited).")
            print(f"  Saving anyway so local RAG search works via Python fallback.")

        try:
            SessionEmbedding.objects.create(
                user=user,
                prediction_data=prediction,
                llm_response=response,
                session_text=session_text,
                embedding=embedding_vector
            )
            status_label = "zero-vector (local fallback)" if is_zero_vector else "real embedding"
            print(f"Saved ({status_label}).")
            saved += 1
        except Exception as e:
            print(f"\n  ERROR saving to database: {e}")
            failed += 1

    print(f"\n{'='*50}")
    print(f"Backfill complete: {saved} saved, {skipped} skipped, {failed} failed.")
    if saved > 0:
        print("You can now use the RAG chat on the Insights page.")


if __name__ == '__main__':
    backfill()
