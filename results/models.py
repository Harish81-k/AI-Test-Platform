from django.db import models
from django.contrib.auth.models import User

class AssessmentResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.CharField(max_length=255)
    score = models.IntegerField()
    total_questions = models.IntegerField()
    percentage = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.topic} - {self.score}/{self.total_questions}"

class CodingResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    difficulty = models.CharField(max_length=50)
    total_score = models.IntegerField()
    max_possible_score = models.IntegerField()
    percentage = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.difficulty} - {self.total_score}/{self.max_possible_score}"