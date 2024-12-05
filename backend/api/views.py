from django.shortcuts import render
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import *
import ujson as json
import time

class Presets(APIView):
    def get(self, request) -> Response:
        presets = PresetsModel.objects.all()
        result = []
        for preset in presets:
            result.append({
                "key": preset.key,
                "name": preset.name,
                "line_spacing": preset.line_spacing,
                "speed": preset.speed,
                "alt": preset.alt,
                "mode": preset.mode,
                "liters_per_hectar": preset.liters_per_hectar
            })
        return Response(result)
    
    def post(self, request) -> Response:
        command = request.data["command"]
        if command == "save":
            preset = json.loads(request.data["preset"])
            cur_preset = PresetsModel.objects.get(key=preset["key"])
            cur_preset.key = preset["key"]
            cur_preset.name = preset["name"]
            cur_preset.line_spacing = preset["line_spacing"]
            cur_preset.speed = preset["speed"]
            cur_preset.alt = preset["alt"]
            cur_preset.mode = preset["mode"]
            cur_preset.liters_per_hectar = preset["liters_per_hectar"]
            cur_preset.save()
        elif command == "add":
            presets = PresetsModel.objects.create(
                key=time.time(), 
                name=f"preset_{time.time()}"[:15],
                line_spacing=1,
                speed=1,
                alt=1,
                mode="spray",
                liters_per_hectar=1 
            )
            presets.save()
        elif command == "delete":
            preset_key = request.data["key"]
            presets = PresetsModel.objects.filter(key=preset_key).delete()
        return Response({})
