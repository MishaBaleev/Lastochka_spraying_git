from django.db import models

class PresetsModel(models.Model):
    key = models.CharField(max_length=20)
    name = models.CharField(max_length=20)
    line_spacing = models.IntegerField()
    speed = models.IntegerField()
    alt = models.FloatField()
    mode = models.CharField(max_length=6)
    liters_per_hectar = models.IntegerField()