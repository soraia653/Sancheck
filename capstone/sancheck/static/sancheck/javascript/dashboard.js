let map;
let places;
let radius;
let markers = [];
let autocomplete;

const countryRestrict = { country: "ch" };

// if user went directly to dashboard, use her/his current location
var receivedUserInput = !jQuery.isEmptyObject(result);

if (receivedUserInput === true) {
    userLocation = result[0]['geometry']['location'];
} else {
    userLocation = userLoc;
};

const MARKER_PATH =
"https://developers.google.com/maps/documentation/javascript/images/marker_green";

const countries = {

userLoc: {
    center: userLocation,
    zoom: 12,
    }
};

function initMap() {
map = new google.maps.Map(document.getElementById("map"), {
    zoom: countries["userLoc"].zoom,
    center: countries["userLoc"].center,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false,
});

const marker = new google.maps.Marker({
    position: {
        lat: userLocation['lat'],
        lng: userLocation['lng'],
    },
    map: map
});

// build the radius around the user location
radius = new google.maps.Circle({
    editable: true,
    strokeOpacity: 1,
    strokeWeight: 2,
    fillColor: "#FF0000",
    fillOpacity: 0.35,
    map,
    center: countries["userLoc"].center,

    radius: 3 * 1000
});

radius.addListener("radius_changed", search);
search();
}


// Search for dog parks in the selected city, within the viewport of the map.
function search(radiusVal) {

    places = new google.maps.places.PlacesService(map);
    var loc = new google.maps.LatLng(userLocation);

    const search = {
        location: loc,
        radius: radius.getRadius(),
        types: ["park"],
    };

    places.nearbySearch(search, (results, status, pagination) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        clearResults();
        clearMarkers();

        // Create a marker for each park found, and
        // assign a letter of the alphabetic to each marker icon.
        for (let i = 0; i < results.length; i++) {
            const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
            const markerIcon = MARKER_PATH + markerLetter + ".png";

            // Use marker animation to drop the icons incrementally on the map.
            markers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon,
            });


            // If the user clicks a park marker, show the details of that park
            // in a modal window.
            markers[i].placeResult = results[i];
            google.maps.event.addListener(markers[i], "click", showModal);
            setTimeout(dropMarker(i), i * 100);
            addResult(results[i], i);
            }
        }
    });
}

function clearMarkers() {
for (let i = 0; i < markers.length; i++) {
    if (markers[i]) {
    markers[i].setMap(null);
    }
}

    markers = [];
}

function dropMarker(i) {
return function () {
    markers[i].setMap(map);
    };
}

function addResult(result, i) {
    const results = document.getElementById("results");
    const markerLetter = String.fromCharCode("A".charCodeAt(0) + (i % 26));
    const markerIcon = MARKER_PATH + markerLetter + ".png";
    const tr = document.createElement("tr");

    tr.onclick = function () {
        google.maps.event.trigger(markers[i], "click");
    };

    // elements to create table
    const iconTd = document.createElement("td");
    const nameTd = document.createElement("td");
    const locationTd = document.createElement("td");
    const ratingTd = document.createElement("td");
    const icon = document.createElement("img");

    icon.src = markerIcon;
    icon.setAttribute("class", "placeIcon");
    icon.setAttribute("className", "placeIcon");

    const name = document.createTextNode(result.name);
    const loct = document.createTextNode(result.vicinity);

    let ratingHTML = "";

    for (let i = 0; i < 5; i++) {
        if (result.rating < i + 0.5) {
            ratingHTML += "&#10025;";
        } else {
            ratingHTML += "&#10029;";
        }
    }

    let rat = document.createElement("p");
    rat.innerHTML = ratingHTML;

    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    locationTd.appendChild(loct);
    ratingTd.appendChild(rat);

    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    tr.appendChild(locationTd);
    tr.appendChild(ratingTd);

    results.appendChild(tr);
}

function clearResults() {
    const results = document.getElementById("results");

    while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);
    }
}

function showModal() {
    const marker = this;

    places.getDetails(
        { placeId: marker.placeResult.place_id },
        (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
        }

    console.log(place);


    // show modal
    $('#exampleModal').modal('show');

    // set modal title
    $('#exampleModalLabel').html(place['name']);

    // display picture
    var photo = place['photos'][0].getUrl({
        maxWidth: 450,
        maxHeight: 300
    });

    $('#park-img').attr('src', photo);

    // display address
    document.getElementById('park-address').innerHTML = place['formatted_address'];

    // opening hours
    const openDiv = document.getElementById('park-opening');

    // display opening times
    const openingTimes = place['opening_hours']['weekday_text'];

    openingTimes.forEach((ot, index) => {

        const [first, ...rest] = ot.split(':');
        var times = rest.join(':');

        document.getElementById(`day${index + 1}`).innerHTML = times;

    });

    $('div#park-opening').empty();

    let alert = document.createElement("div");

    var placeOpen = place['current_opening_hours']['open_now'];

    var content = "";

    if (placeOpen === true) {
        content = document.createTextNode("Currently open - enjoy!");
        alert.setAttribute("class", "alert alert-success");

    } else {
        content = document.createTextNode("It's closed...Come back tomorrow!");
        alert.setAttribute("class", "alert alert-danger");
    }

    alert.appendChild(content);
    openDiv.appendChild(alert);

    // display tags
    $('div#park-tags').empty();

    var place_id = place['place_id'];

    fetch(`/sancheck/tags/${place_id}`)
        .then(response => response.json())
        .then(park_tags => {

            park_tags.forEach(park => {

                possible_colors = [
                    'primary', 'secondary', 'success',
                    'danger', 'warning', 'info'
                ];

                var i = Math.floor(Math.random() * (7 - 1) + 1);

                var tagSpan = document.createElement("button");
                tagSpan.setAttribute("class", `btn btn-${possible_colors[i]} position-relative`);
                tagSpan.setAttribute("id", `park_tag_${park["id"]}`);

                // number of tag upvotes
                var tagUps = document.createElement("span");
                tagUps.setAttribute("class", "position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success");

                tagSpan.innerHTML = park['tag'];
                tagUps.innerHTML = park['upvotes'];
                tagSpan.appendChild(tagUps);

                document.getElementById('park-tags').appendChild(tagSpan);

                // if user clicks button -> like_post view
                const selected_tag = document.getElementById(`park_tag_${park["id"]}`);

                selected_tag.addEventListener('click', () => {

                    // update DB table
                    fetch(`/sancheck/upvote_tag/${park["id"]}`, {
                        method: 'PUT'
                    })
                    .then(response => response.json())
                    .then(response => {
                        console.log(response);

                        // display changes immediately
                        if (response['message'] == 'Upvote removed.') {

                            // decrease count by 1
                            tagUps.innerHTML = response['upvotes'];

                            //TODO: if num_upvotes = 0, remove tag from display
                            selected_tag.remove();

                        } else {

                            // increase count by 1
                            tagUps.innerHTML = response['upvotes'];
                        }

                    });
                });

                });

            });
    // add new tag
    var input = document.getElementById('tags-input-form');

    input.addEventListener('keypress', createTag);


}
    );
}

// helper functions
function createTag(e){
    if (e.key === 'Enter') {

        // remove wanted spaces
        let tag = e.target.value.trim();
        console.log(tag);
        e.target.value = "";

        // if (tag.length > 1) {

        //     tag.split(',').forEach(tag => {

        //         console.log(place_id, tag);

        //         // save new tags to DB
        //         fetch(`/sancheck/create_tag/${place_id}/${tag}`, {
        //             method: 'PUT'
        //         })
        //         .then(response => response.json())
        //         .then(response => {

        //             var tag_exists = response['message'] == 'Tag already exists.';

        //             if (!tag_exists) {

        //                 //TODO: display changes immediately
        //                 possible_colors = [
        //                     'primary', 'secondary', 'success',
        //                     'danger', 'warning', 'info'
        //                 ];

        //                 var i = Math.floor(Math.random() * (7 - 1) + 1);

        //                 var tagSpan = document.createElement("button");
        //                 tagSpan.setAttribute("class", `btn btn-${possible_colors[i]} position-relative`);
        //                 tagSpan.setAttribute("id", `park_tag_${response["new_id"]}`);

        //                 // number of tag upvotes
        //                 var tagUps = document.createElement("span");
        //                 tagUps.setAttribute("class", "position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success");

        //                 tagSpan.innerHTML = tag;
        //                 tagUps.innerHTML = 1;
        //                 tagSpan.appendChild(tagUps);

        //                 document.getElementById('park-tags').appendChild(tagSpan);

        //             }


        //         });

        //     });
        // }
    }
}

window.initMap = initMap;