// Define all variables to satisfy strict mode.
var ko;
var google;

// Parsing for dynamic background & quote.
function parseQuote(response) {
    "use strict";
    document.getElementById("quote").innerHTML = response.quoteText;
    document.getElementById("author").innerHTML = "Author - <b>" + response.quoteAuthor + "</b>";
}

// Specify all locations on map.
function model() {
    "use strict";
    var locations = [{
        title: "The Hub",
        lat: 39.521975,
        lng: -119.822078,
        id: "The Hub"
    }, {
        title: "The Jungle",
        lat: 39.524982,
        lng: -119.815983,
        id: "The Jungle"
    }, {
        title: "Bibo Coffee Company",
        lat: 39.536966,
        lng: -119.811042,
        id: "Bibo Coffee Company"
    }, {
        title: "Purple Bean",
        lat: 39.531135,
        lng: -119.833802,
        id: "Purple Bean"
    }, {
        title: "Sips Coffee and Tea",
        lat: 39.530438,
        lng: -119.814742,
        id: "Sips Coffee and Tea"
    }];
    return locations;
}

var listLocations = ko.observableArray(model());

// Initalize map location & position.
function initMap() {
    "use strict";
    var map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 39.529633,
            lng: -119.813803
        },
        zoom: 14
    });

// Define markers & content.
    listLocations().forEach(function (data) {

        var positionMk = new google.maps.LatLng(data.lat, data.lng);
        var marker = new google.maps.Marker({
            position: positionMk,
            map: map,
            title: data.title,
            animation: google.maps.Animation.DROP
        });

        var infowindow = new google.maps.InfoWindow({
            content: data.title
        });

        data.mapMarker = marker;

        marker.addListener("click", function () {
            data.triggerMarker(marker);
            listLocations().forEach(function (place) {
                if (data.title === place.title) {
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

    });

}

// Define ViewModel for list and sorting of list.

function ViewModel() {
    "use strict";
    var self = {};

    self.placeList = ko.observableArray([]);

    listLocations().forEach(function (place) {
        place.visible = ko.observable(true);
        self.placeList.push(place);
    });

    self.filterValue = ko.observable("");

    self.filterList = ko.computed(function () {
        listLocations().forEach(function (place) {
            var searchParam = self.filterValue().toLowerCase();
            var toBeSearched = place.title.toLowerCase();

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
            if (data.title === place.title) {
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
function forismaticError() {
    "use strict";
    alert("Forismatic API is unreachable, please check your internet connection and try again.");
}

function googleMapsError() {
    "use strict";
    alert("Google Maps API is unreachable, please check your internet connection and try again.");
}