from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.urls import reverse
from django.contrib.auth import authenticate, login, logout
import googlemaps
import geocoder
import json
from django.conf import settings

from .models import *

def index(request):

    context_dict = {
        'g_key': settings.GOOGLE_API_KEY
    }

    return render(request, 'sancheck/base.html', context_dict)

def get_park_tags(request, park_id):

    park_tags = ParkTag.objects.filter(park_id=park_id)

    return JsonResponse([p.serialize() for p in park_tags], safe=False)

@csrf_exempt
def upvote_tag(request, id):

    park_tag = ParkTag.objects.get(id=id)
    n_ups = park_tag.num_upvotes.count()

    output_message = {
        'message': '',
        'upvotes': n_ups
    }

    if request.method == 'PUT':
        if park_tag.num_upvotes.filter(id=request.user.id).exists():

            output_message['message'] = 'Upvote removed.'
            output_message['upvotes'] = n_ups - 1
            park_tag.num_upvotes.remove(request.user)

            # delete tag if num_upvotes = 0
            if park_tag.num_upvotes.count() == 0:
                park_tag.delete()

        else:
            output_message['message'] = 'Upvote added.'
            output_message['upvotes'] = n_ups + 1
            park_tag.num_upvotes.add(request.user)

    return JsonResponse(output_message)

@csrf_exempt
def create_tag(request, park_id, tag):

    output_message = {
        'message': ''
    }

    # check if tag exists
    if request.method == 'PUT':

        new_tag, created = ParkTag.objects.get_or_create(
            park_id=park_id,
            tag_name=tag
        )

        new_tag.num_upvotes.add(request.user)

        if not created:
            output_message['message'] = 'Tag already exists.'
        else:
            output_message['message'] = 'Tag successfully created.'
            output_message['new_id'] = new_tag.id

    return JsonResponse(output_message)

def dashboard_view(request):

    gmaps = googlemaps.Client(key=settings.GOOGLE_API_KEY)

    try:
        # get values from search box
        searchValue = request.POST["destination-input"]
        result = gmaps.geocode(searchValue)

    except:
        result = {}

    # get user current location
    g = geocoder.ip('me')

    userLoc = {
        'lat': g.latlng[0],
        'lng': g.latlng[1]
    }

    context_dict = {
        'result': json.dumps(result),
        'userLoc': json.dumps(userLoc)
    }

    return render(request, 'sancheck/dashboard.html', context_dict)

# USER AUTHENTICATION SECTION

def register_view(request):

    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        if password != confirmation:

            return render(request, "sancheck/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "sancheck/register.html", {
                "message": "Username already taken."
            })

        login(request, user)

        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "sancheck/register.html")
