from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
import json
import requests
import os

from .new import generate_coding_questions
from .executor import run_code
from results.models import CodingResult

class GenerateCodingQuestionsAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            level = request.data.get("difficulty", "medium")
            questions = generate_coding_questions(level)
            return Response({"questions": questions, "difficulty": level}, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            return Response({"error": str(e), "traceback": tb}, status=status.HTTP_400_BAD_REQUEST)

class SubmitCodingQuizAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        data = request.data
        scores = data.get("scores", [])
        quiz = data.get("questions", [])
        difficulty = data.get("difficulty", "medium")

        total_questions = len(quiz)
        max_possible_score = total_questions * 20
        total_score = sum(scores)
        
        percentage = round((total_score / max_possible_score) * 100, 2) if max_possible_score else 0
        
        results = []
        for idx, q in enumerate(quiz):
            q_score = scores[idx] if idx < len(scores) else 0
            results.append({
                "question": q.get("title", f"Question {idx+1}"),
                "user_answer": f"Score: {q_score} / 20",
                "correct_answer": "Expected: 20 / 20",
                "is_correct": q_score == 20
            })
            
        score_count = sum(1 for s in scores if s == 20)
        wrong = sum(1 for s in scores if s > 0 and s < 20)
        unattempted = sum(1 for s in scores if s == 0)
        
        grade = "Excellent" if percentage >= 90 else "Good" if percentage >= 70 else "Fair" if percentage >= 50 else "Needs Improvement"
        
        CodingResult.objects.create(
            user=request.user,
            difficulty=difficulty,
            total_score=total_score,
            max_possible_score=max_possible_score,
            percentage=percentage
        )
        
        return Response({
            "score": score_count,
            "total": total_questions,
            "wrong": wrong,
            "unattempted": unattempted,
            "percentage": percentage,
            "results": results,
            "grade": grade
        }, status=status.HTTP_200_OK)

class ExecuteCodeAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        data = request.data
        code = data.get("code", "").strip()
        language = data.get("language", "python")
        input_data = data.get("input", "")

        if not code:
            return Response({"error": "Code is empty"}, status=status.HTTP_400_BAD_REQUEST)

        result = run_code(code, language, input_data)
        return Response(result, status=status.HTTP_200_OK)

class GetHintAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        data = request.data
        prompt = f"""
Give ONLY one short coding hint.

Problem:
Title: {data.get('title','')}
Description: {data.get('description','')}
"""
        from dotenv import load_dotenv
        load_dotenv(override=True)
        GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
        GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
        
        try:
            response = requests.post(
                GEMINI_URL,
                json={
                    "contents": [{"parts": [{"text": prompt}]}]
                },
                headers={"Content-Type": "application/json"},
                timeout=60
            )
            response.raise_for_status()
            hint = response.json().get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No hint generated")
            return Response({"hint": hint}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
