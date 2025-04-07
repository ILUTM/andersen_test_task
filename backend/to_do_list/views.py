from django.shortcuts import render
from django.http import HttpResponse

def empty_view(request):
    return HttpResponse("API endpoint - work in progress")