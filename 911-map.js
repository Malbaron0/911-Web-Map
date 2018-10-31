//GLOBALS VARIABLES
var map;
var parsedNYCData;
var markersArray = [];

//Mark the google map with appropriate data.
function initialize(jsonParsed) {

    //var mapCanvas = document.getElementById('googleMap');
    var nycOpenData = jsonParsed;

    //var infowindow = new google.maps.InfoWindow(); //only need to make infowindow object once, and use in loop
    var infoBubble = new InfoBubble({
        maxWidth: 300,
        backgroundColor: '#428BCA',
    });

    //function adds an event listener to each marker. when clicked an infowindow is shown with some information about that specific marker.
    function markTheMap(nycOpenDataObject) {

        var parsedDateMonth = moment(nycOpenDataObject.rpt_dt).format("MMMM"); //get the month of the current object.

        //Mark the object on the map if it has the same offense month as what the user chose.
        if (parsedDateMonth == offenseSearchDetail.offenseMonth) {
            console.log(parsedDateMonth);

            var latLng = new google.maps.LatLng(nycOpenDataObject.latitude, nycOpenDataObject.longitude);
            var marker = new google.maps.Marker({
                position: latLng,
                map: map
            });

            markersArray.push(marker); //Adding markers to array, so later they can be removed.
            google.maps.event.addListener(marker, 'click', function () {

                infoBubble.close(); // Close previously opened infowindow
                infoBubble.removeTab(0);

                infoBubble.addTab(nycOpenDataObject.boro_nm.fontcolor("white"), googleMapInfoWindow.call(nycOpenDataObject));
                infoBubble.open(map, marker);
                //infowindow.setContent(googleMapInfoWindow.call(nycOpenDataObject));
                //infowindow.maxWidth = 250;
                //infowindow.open(map, marker);
            });
        } else {
            console.log('Month not avaliable');
            return;
        }
    }

    //go through each value in the json and mark it on the map and give appropriate infowindow.
    for (var value in nycOpenData) {
        markTheMap(nycOpenData[value]);
    }
}

//All markers when are cleared off the map, by going through each marker and setting it to null on the map.
function clearOverlays() {
    for (let i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
}

//Returns a promise. Loads the initial empty map
let loadMap = function () {
    var mymap = L.map('mapid').setView([51.505, -0.09], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFsYmFyb24wIiwiYSI6ImNqbndkNmZpZjBpcmIza2tqN2M4N3RyeHQifQ.vDAQtwqKGBaKRW0xZG_Ggw', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'your.mapbox.access.token'
    }).addTo(mymap);
};

function centerLocation() {

    //Depending on what user chooses as a borough, the map will focus on that location when user searches.
    switch (offenseSearchDetail.offenseBorough) {
        case "BROOKLYN":
            return new google.maps.LatLng(40.650002, -73.949997);
            break;
        case "QUEENS":
            return new google.maps.LatLng(40.742054, -73.769417);
            break;
        case "BRONX":
            return new google.maps.LatLng(40.837048, -73.865433);
            break;
        case "STATEN ISLAND":
            return new google.maps.LatLng(40.579021, -74.151535);
            break;
        case "MANHATTAN":
            return new google.maps.LatLng(40.758896, -73.985130);
            break;
        default:
            return new google.maps.LatLng(40.650002, -73.949997); //Brooklyn
    }
}

//HTML for the info window when clicked on the marker.
function googleMapInfoWindow() {
    var parsedDate = moment(this.rpt_dt).format("MMMM Do YYYY"); //use this to get the yaer and let user search by year.

    var contentString = '<div class="iw-content">' +
        '<h3>' + this.ofns_desc + '</h3>' +
        '<div class="info-content">' +
        '<p><b>Offense Description:\t</b>' + this.pd_desc + '</p>' +
        '<p><b>Location Type:\t</b>' + this.prem_typ_desc + '</p>' +
        '<p><b>Occurence Date:\t</b>' + parsedDate + '</p>' +
        '<p><b>Complaint Number:\t</b>' + this.cmplnt_num + '</p>' +
        '</div>' +
        '</div>';
    return contentString;
}

//AJAX request to cityofnewyork API.
function startRequest(myUrl) {
    //var url = 'https://data.cityofnewyork.us/resource/e4qk-cpnv.json?occurrence_year=2006&occurrence_month=Sep&offense=ROBBERY&borough=BROOKLYN';
    var dataSet;
    console.log(myUrl);
    var promise = $.ajax({
        url: myUrl,
        headers: {
            'X-App-Token': 'VxVfB1l051bDWPhFmrm2QeX9a'
        },
    });

    return promise;
};

//function that edits the URL parameters and returns edited url.
function editUrlQuery() {
    var url;
    if (this.offenseYear < 2016) {
        console.log(this.offenseType + " " + this.offenseYear + " " + this.offenseMonth + " " + this.offenseBorough + " " + "Before 2016");

        url = 'https://data.cityofnewyork.us/resource/9s4h-37hy.json?&ofns_desc=' + this.offenseType + '&boro_nm=' + this.offenseBorough;
    } else {
        url = 'https://data.cityofnewyork.us/resource/7x9x-zpz6.json?&ofns_desc=' + this.offenseType + '&boro_nm=' + this.offenseBorough;
        console.log(this.offenseType + " " + this.offenseYear + " " + this.offenseMonth + " " + this.offenseBorough + " " + "On 2016");
    }
    return url;
}

//Object with all they keys required to edit url. Any search option user chooses gets assigned to appropriate key;
var offenseSearchDetail = {
    offenseType: null,
    offenseMonth: null,
    offenseBorough: null,
    offenseYear: null
}

//Gets the value in the select elements in html which contains all the search categories.
function assignSearchSelection() {
    this.offenseType = document.getElementById('offenseSelector').value;
    this.offenseMonth = document.getElementById('monthSelector').value;
    this.offenseBorough = document.getElementById('boroughSelector').value;
    this.offenseYear = document.getElementById('yearSelector').value;


}

//event laaunched when search button is pressed. assignSearchSelection function assigns values to the keys in offenseSearchDetail object, which is then passed into
//editUrlQuery which then inserts the value into the url and returns the url. startRequest makes an ajax call to the url.
$(document).ready(function () {
    document.getElementById("search_Button").addEventListener('click', function () {

        //$(".navbar").addClass("slideUp"); //jquery add class that translates nav bar to top of page
        assignSearchSelection.call(offenseSearchDetail);

        //startRequestFunc returns $.ajax object which is a promise, and using the .done function once the $.ajax receives the result
        startRequest(editUrlQuery.call(offenseSearchDetail)).done(function (result) {
            console.log("Succes with the AJAX call")
            clearOverlays(); //Clear any previous Markers on map
            map.setCenter(centerLocation()); //center to the new location
            initialize(result) //load the data on to the map

        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.log("Error with the AJAX request: " + jqXHR.status + "  " + textStatus + "  " + errorThrown);
        })
        //initialize(jsontext);

    }, false);
});


//At them moment only using api that contains crimes for 2016
//Create option values for the Select element. Option values contain years from 2000 - 2015
function fillYearSelectElement() {
    var yearSelection = document.getElementById("yearSelector");
    var selectOptions;

    //Create option to show all data starting with year 2015 or older. using 2009 as a default value.
    selectOptions = document.createElement("option");
    selectOptions.value = 2009;
    selectOptions.text = "2015 and older";
    yearSelection.appendChild(selectOptions);

    //option to see 2016 data
    selectOptions = document.createElement("option");
    selectOptions.value = 2016;
    selectOptions.text = "2016";
    yearSelection.appendChild(selectOptions);
}

//Create option values for the Select element. Option values contain the months in the year
function fillMonthSelectElement() {
    var monthSelection = document.getElementById("monthSelector");
    var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    //creat one option with each loop, give it a value and text (what the use sees). Then append the option to the Select element
    for (let i = 0; i <= monthArray.length - 1; i++) {
        selectOptions = document.createElement("option");
        selectOptions.value = monthArray[i];
        selectOptions.text = monthArray[i];
        monthSelector.appendChild(selectOptions);
    }

}

//Create option values for the Select element. Option values contain the borough of new york
function fillBoroughSelectElement() {
    var boroughSelection = document.getElementById("boroughSelector");
    var boroughArray = ["Brooklyn", "Queens", "Bronx", "Manhattan", "Staten Island"];

    //creat one option with each loop, give it a value and text (what the use sees). Then append the option to the Select element
    for (let i = 0; i <= boroughArray.length - 1; i++) {
        selectOptions = document.createElement("option");
        selectOptions.value = boroughArray[i].toUpperCase();
        selectOptions.text = boroughArray[i];
        boroughSelection.appendChild(selectOptions);
    }
}

//Create option values for the Select element. Option values contain offense types
function fillOffenseTypeSelectElement() {
    var offenseSelection = document.getElementById("offenseSelector");
    var offenseArray = ["Burglary", "Felony Assault", "Grand Larceny", "Grand Larceny of Motor Vehicle", "Kidnapping", "Rape", "Robbery"];

    //creat one option with each loop, give it a value and text (what the use sees). Then append the option to the Select element
    for (let i = 0; i <= offenseArray.length - 1; i++) {
        selectOptions = document.createElement("option");
        selectOptions.value = offenseArray[i].toUpperCase();
        selectOptions.text = offenseArray[i];
        offenseSelection.appendChild(selectOptions);
    }
}

function mapStyle() {
    //black and white style for google maps https://snazzymaps.com/style/8097/wy
    var styledMapType = new google.maps.StyledMapType(
        [{
            "featureType": "all",
            "elementType": "geometry.fill",
            "stylers": [{
                "weight": "2.00"
            }]
        }, {
            "featureType": "all",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#9c9c9c"
            }]
        }, {
            "featureType": "all",
            "elementType": "labels.text",
            "stylers": [{
                "visibility": "on"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "color": "#f2f2f2"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "landscape.man_made",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                "saturation": -100
            }, {
                "lightness": 45
            }]
        }, {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#eeeeee"
            }]
        }, {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#7b7b7b"
            }]
        }, {
            "featureType": "road",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "labels.icon",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "color": "#46bcec"
            }, {
                "visibility": "on"
            }]
        }, {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#c8d7d4"
            }]
        }, {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#070707"
            }]
        }, {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#ffffff"
            }]
        }], {
            name: 'Styled Map'
        });

    return styledMapType;
}


window.onload = function () {
    fillYearSelectElement();
    fillMonthSelectElement();
    fillBoroughSelectElement();
    fillOffenseTypeSelectElement();

    //Load google map on window load. Map is loaded once and not over and over again when search button is clicked.
    loadMap();
}