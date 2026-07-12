from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AssessmentResult, CodingResult

class AnalyticsDashboardAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        assessments = AssessmentResult.objects.filter(user=request.user).order_by('created_at')
        coding_results = CodingResult.objects.filter(user=request.user).order_by('created_at')

        assessment_dates = [a.created_at.strftime("%b %d, %H:%M") for a in assessments]
        assessment_scores = [a.percentage for a in assessments]
        
        topic_data = {}
        for a in assessments:
            if a.topic not in topic_data:
                topic_data[a.topic] = []
            topic_data[a.topic].append(a.percentage)
        
        topics = list(topic_data.keys())
        topic_averages = [sum(scores)/len(scores) for scores in topic_data.values()]

        coding_dates = [c.created_at.strftime("%b %d, %H:%M") for c in coding_results]
        coding_scores = [c.percentage for c in coding_results]

        difficulty_data = {}
        for c in coding_results:
            if c.difficulty not in difficulty_data:
                difficulty_data[c.difficulty] = []
            difficulty_data[c.difficulty].append(c.percentage)
        
        difficulties = list(difficulty_data.keys())
        difficulty_averages = [sum(scores)/len(scores) for scores in difficulty_data.values()]

        from datetime import date, timedelta
        
        activity_dates = set()
        for a in assessments:
            activity_dates.add(a.created_at.date())
        for c in coding_results:
            activity_dates.add(c.created_at.date())
            
        sorted_dates = sorted(list(activity_dates), reverse=True)
        
        streak = 0
        today = date.today()
        
        if sorted_dates:
            if sorted_dates[0] == today:
                streak = 1
                expected_date = today - timedelta(days=1)
                for d in sorted_dates[1:]:
                    if d == expected_date:
                        streak += 1
                        expected_date -= timedelta(days=1)
                    else:
                        break
            elif sorted_dates[0] == today - timedelta(days=1):
                streak = 1
                expected_date = today - timedelta(days=2)
                for d in sorted_dates[1:]:
                    if d == expected_date:
                        streak += 1
                        expected_date -= timedelta(days=1)
                    else:
                        break

        return Response({
            'assessment_dates': assessment_dates,
            'assessment_scores': assessment_scores,
            'topics': topics,
            'topic_averages': topic_averages,
            'coding_dates': coding_dates,
            'coding_scores': coding_scores,
            'difficulties': difficulties,
            'difficulty_averages': difficulty_averages,
            'streak': streak,
        }, status=status.HTTP_200_OK)
