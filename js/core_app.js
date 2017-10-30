// Define all variables to satisfy strict mode.
var ko;
var google;

// Create a location object with default values
function getNewLocation(name, fsID) {
    var self = {
        fid: fsID,
        id: ko.observable(name),
        title: ko.observable(name),
        lat: ko.observable(0),
        lng: ko.observable(0),
        address: ko.observable(""),
        visible: ko.observable(false)
    };

    return self;
}

var map;
var renoLat = 39.529633;
var renoLng = -119.813803;
var listLocations = ko.observableArray([
    getNewLocation("The Hub Coffee Roasters", "4ff1c28fe4b0c8e6f65ae2f6"),
    getNewLocation("The Jungle", "55738ad6498ee2c077cea239"),
    getNewLocation("Bibo Coffee Company", "4bf5738e6a31d13a0de8962e"),
    getNewLocation("The Purple Bean", "4beb08f562c0c9285a9de1d4"),
    getNewLocation("Sips Coffee & Tea", "4bacec0ef964a520ea193be3")
]);

listLocations().forEach(function (place) {
    var requestURL = "https://api.foursquare.com/v2/venues/" + place.fid;
    var params = {
        v: 20171028,
        ll: renoLat + "," + renoLng,
        client_id: "IRS2HTTGWUMCGKVJSDBUCGK0CMGSHZEFJ5CILK4VOTRNNBKG",
        client_secret: "ITMLE4HJDI3DOG03V4XTVXMF4DIKY3VHD2FFC00PLUPQOYNN"
    };
    $.ajaxSetup({
        "error": function () { foursquareError(place.title());}
    });
    $.getJSON(requestURL, params, function (json) {
        place.id(json.response.venue.name);
        place.title(json.response.venue.name);
        place.lat(json.response.venue.location.lat);
        place.lng(json.response.venue.location.lng);
        place.address(json.response.venue.location.address);
        place.visible(true);

        addMarkerToMap(place);
    });
});

// Initalize map location & position.
function initMap() {
    "use strict";
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: renoLat,
            lng: renoLng
        },
        zoom: 14
    });
}

// Adds a new marker to the existing map
function addMarkerToMap(data) {
    var positionMk = new google.maps.LatLng(data.lat(), data.lng());
    var marker = new google.maps.Marker({
        position: positionMk,
        map: map,
        title: data.id(),
        animation: google.maps.Animation.DROP
    });

    var infowindow = new google.maps.InfoWindow({
        content: data.id() + "<br>" + data.address()
    });

    data.mapMarker = marker;

    marker.addListener("click", function () {
        data.triggerMarker(marker);
        listLocations().forEach(function (place) {
            if (data.id() === place.id()) {
                place.openInfoWindow();
            } else {
                place.closeInfoWindow();
            }
        });
    });

    map.addListener("click", function () {
        listLocations().forEach(function (place) {
            place.closeInfoWindow();
        });
    });

    var setMk = function (marker) {
        infowindow.open(map, marker);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {
            marker.setAnimation(null);
        }, 750);
    };
    data.triggerMarker = setMk.bind();

    var openMk = function () {
        infowindow.open(map, marker);
    };
    data.openInfoWindow = openMk.bind();

    var closeMk = function () {
        infowindow.close(map, marker);
    };
    data.closeInfoWindow = closeMk.bind();
}

// Define ViewModel for list and sorting of list.
function ViewModel() {
    "use strict";

    var self = {};

    self.placeList = ko.observableArray([]);

    listLocations().forEach(function (place) {
        self.placeList.push(place);
    });

    self.filterValue = ko.observable("");

    self.filterList = ko.computed(function () {
        listLocations().forEach(function (place) {
            var searchParam = self.filterValue().toLowerCase();
            var toBeSearched = place.id().toLowerCase();

            place.visible(toBeSearched.indexOf(searchParam) > -1);

            if (place.mapMarker) {
                place.mapMarker.setVisible(toBeSearched.indexOf(searchParam) > -1);
            }

            if (place.visible() && searchParam && place.mapMarker) {
                place.triggerMarker(place.mapMarker);
            } else if (place.mapMarker) {
                place.closeInfoWindow();
            }
        });
    });

    // Responsiveness for locations on the list.
    self.onClickListener = function (data) {
        listLocations().forEach(function (place) {
            if (data.id() === place.id()) {
                place.openInfoWindow();
                place.triggerMarker(place.mapMarker);
            } else {
                place.closeInfoWindow();
            }
        });
    };

    return self;
}

ko.applyBindings(new ViewModel());

// Error handling for API's.
function foursquareError(location) {
    "use strict";
    alert("Foursquare API is unreachable, location data for " + location + " will be unavailable.");
}

function googleMapsError() {
    "use strict";
    alert("Google Maps API is unreachable, please check your internet connection and try again.");
}