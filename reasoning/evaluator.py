import requests
import os

import os
import requests

def evaluate_answer(question, answer):
    from dotenv import load_dotenv
    load_dotenv()
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"

    prompt = f"""
Question:
{question}

Student Answer:
{answer}

Evaluate:

1. Score out of 10
2. Correctness
3. Short explanation
"""

    response = requests.post(
        GEMINI_URL,
        json={
            "contents": [{"parts": [{"text": prompt}]}]
        },
        headers={"Content-Type": "application/json"}
    )

    return response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")