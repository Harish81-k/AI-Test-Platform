import os
import requests
import re

def generate_quiz(topic, level):
    from dotenv import load_dotenv
    import json
    load_dotenv()
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"
    prompt = f"""
You are an expert aptitude and reasoning question generator.

Generate EXACTLY 10 multiple-choice questions.

Topic: {topic}
Difficulty: {level}

Difficulty Guidelines:
- Beginner: Very easy questions, direct answers, simple concepts.
- Basic: Fundamental reasoning, simple logic, straightforward deductions.
- Intermediate: Multi-step reasoning, moderate complexity, analytical thinking.
- Advanced: Complex logical deductions, higher-order reasoning, tricky distractors.
- Pro: Interview-level, placement-level, competitive exam-level reasoning.

Rules:
1. Generate EXACTLY 10 questions.
2. Each question must have exactly 4 options.
3. Only one option must be correct.
4. Questions must match the requested difficulty.
5. Avoid duplicate questions.
6. Incorrect options should be realistic.
7. Do NOT explain answers.
8. If a question contains code, wrap the code snippet in HTML <pre><code> tags instead of markdown.
9. Output ONLY a valid JSON array of objects.

JSON Format:
[
  {{
    "question": "Question text here?",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "answer": "Option 1"
  }}
]
"""

    if topic.lower() == "reasoning":
        prompt += """
Include a balanced mix of:
- Syllogisms, Logical Deduction, Statements and Conclusions
- Coding-Decoding, Blood Relations, Direction Sense
- Analogies, Number Series, Verbal Reasoning, Critical Thinking
"""

    try:
        response = requests.post(
            GEMINI_URL,
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "responseMimeType": "application/json"
                }
            },
            headers={"Content-Type": "application/json"},
            timeout=180
        )

        response.raise_for_status()

        text = response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        
        # Parse JSON
        questions = json.loads(text)
        
        valid_questions = []
        for q in questions:
            if q.get("question") and len(q.get("options", [])) == 4 and q.get("answer"):
                # Ensure newlines in the question are HTML breaks (unless in pre tags)
                q_text = q["question"]
                parts = re.split(r'(<pre><code>.*?</code></pre>)', q_text, flags=re.DOTALL)
                for i in range(len(parts)):
                    if not parts[i].startswith('<pre>'):
                        parts[i] = parts[i].replace('\n', '<br>')
                q["question"] = "".join(parts)
                
                valid_questions.append(q)

        print(f"SUCCESS: {len(valid_questions)} questions generated")
        return valid_questions[:10]

    except Exception as e:
        import traceback
        with open("ai_engine_error.log", "w") as f:
            f.write(traceback.format_exc())
        print("QUIZ ERROR:", str(e))
        return []