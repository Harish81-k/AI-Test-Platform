from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .ai_engine import generate_quiz
from results.models import AssessmentResult

class GenerateQuizAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        topic = request.data.get("topic", "Python")
        level = request.data.get("difficulty", "Beginner")
        
        quiz = generate_quiz(topic, level)
        return Response({"quiz": quiz, "topic": topic}, status=status.HTTP_200_OK)

class SubmitQuizAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        data = request.data
        quiz = data.get("quiz", [])
        answers = data.get("answers", {}) # Format: {"0": "user_answer", "1": "user_answer"}
        topic = data.get("topic", "General Assessment")

        score = 0
        attempted = 0
        results = []

        for index, q in enumerate(quiz):
            user_answer = answers.get(str(index))

            if user_answer:
                attempted += 1

            correct_answer = q.get("answer")
            is_correct = user_answer == correct_answer

            if is_correct:
                score += 1

            results.append({
                "question": q.get("question"),
                "user_answer": user_answer or "Not Answered",
                "correct_answer": correct_answer,
                "is_correct": is_correct
            })

        total = len(quiz)
        wrong = attempted - score
        unattempted = total - attempted
        percentage = round((score / total) * 100, 2) if total else 0

        AssessmentResult.objects.create(
            user=request.user,
            topic=topic,
            score=score,
            total_questions=total,
            percentage=percentage
        )

        return Response({
            "score": score,
            "total": total,
            "wrong": wrong,
            "unattempted": unattempted,
            "percentage": percentage,
            "results": results
        }, status=status.HTTP_200_OK)
