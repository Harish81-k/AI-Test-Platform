import os
import requests
import json

def generate_coding_questions(level):
    from dotenv import load_dotenv
    load_dotenv()
    GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
    GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    prompt = f"""
You are an expert programming question generator.

Generate between 6 and 10 coding questions for a technical interview or practice test.

Difficulty: {level}

Difficulty Guidelines:
- basic: Simple arrays, strings, loops, basic math logic. (e.g. FizzBuzz, Reverse String)
- intermediate: Hash maps, simple recursion, sorting, two pointers. (e.g. Two Sum, Valid Palindrome)
- advanced: Dynamic programming, graphs, trees, complex algorithms. (e.g. Longest Increasing Subsequence, Graph BFS)

Rules:
1. Generate between 6 and 10 coding questions.
2. Provide 'title', 'description', 'input_format', 'output_format', 'constraints', 'stub' (starter code in Python), 'sample_input', 'sample_output'.
CRITICAL: The 'stub' MUST ONLY contain the function signature, necessary class definitions, and an empty function body (using 'pass' or 'return None'). NEVER include the actual solution or implementation logic inside the stub!
3. Include an array of 'hidden_tests', each being an object with 'input' and 'output'. Provide exactly 3 hidden tests for each question.
4. Include a 'test_harness' field. This must be Python code that reads from sys.stdin, parses the input according to input_format, calls the function defined in 'stub', and prints the result to stdout. Do NOT include the function definition in the test harness.
5. The output must be ONLY a valid JSON array of objects.

JSON Format:
[
  {{
    "title": "Title of Question",
    "description": "HTML description of the problem...",
    "input_format": "Description of input format...",
    "output_format": "Description of output format...",
    "constraints": "<ul><li>Constraint 1</li></ul>",
    "stub": "def function_name(args):\\n    pass\\n",
    "test_harness": "import sys\\ninput_data = sys.stdin.read().split()\\n# parse logic...\\nprint(function_name(parsed_args))",
    "sample_input": "1 2 3",
    "sample_output": "6",
    "hidden_tests": [
      {{"input": "4 5", "output": "9"}},
      {{"input": "10 10", "output": "20"}},
      {{"input": "0 0", "output": "0"}}
    ]
  }}
]
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
        
        # Clean markdown if present
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        # Parse JSON
        questions = json.loads(text)
        return questions

    except Exception as e:
        import traceback
        print("CODING QUIZ ERROR:", str(e), flush=True)
        return []
