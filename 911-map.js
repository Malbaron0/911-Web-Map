//maybe have an array of markers to show location of 911 incidents
//initialize google map. TODO: Add info to each marker.
function initialize(jsonParsed) {

    var mapCanvas = document.getElementById('googleMap');
    var nycOpenData = jsonParsed;
    var myCenter;

    //Depending on what use chooses as a borough, the map will focus on that location when user searches.
    switch (offenseSearchDetail.offenseBorough) {
        case "BROOKLYN":
            myCenter = new google.maps.LatLng(40.650002, -73.949997);
            break;
        case "QUEENS":
            myCenter = new google.maps.LatLng(40.742054, -73.769417);
            break;
        case "BRONX":
            myCenter = new google.maps.LatLng(40.837048, -73.865433);
            break;
        case "STATEN ISLAND":
            myCenter = new google.maps.LatLng(40.579021, -74.151535);
            break;
        case "MANHATTAN":
            myCenter = new google.maps.LatLng(40.758896, -73.985130);
            break;
        default:
            myCenter = new google.maps.LatLng(40.650002, -73.949997);
    }

    var mapProp = {
        center: myCenter,
        zoom: 12
    };

    var styledMapType = mapStyle();
    //var infowindow = new google.maps.InfoWindow(); //only need to make infowindow object once, and use in loop
    var infoBubble = new InfoBubble({
          maxWidth: 300,
          backgroundColor: '#428BCA',
        });
    //infoBubble.tabsContainer_.style['display'] = 'none'; //remove the tab feature of infobubble.

    var map = new google.maps.Map(mapCanvas, mapProp); // map object

    //set the style type
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');



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

            google.maps.event.addListener(marker, 'click', function() {

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

    // closure problem with this method. refer to http://stackoverflow.com/a/30479554
    /*for (var value in nycOpenData) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(nycOpenData[value].location_1.coordinates[1], nycOpenData[value].location_1.coordinates[0]),
            title: 'map911'
            map: map
        });

          google.maps.event.addListener(marker, 'click', function(){
            infowindow.close(); // Close previously opened infowindow
            infowindow.setContent( "<div id='infowindow'>"+ nycOpenDataObject.precinct +"</div>");
            infowindow.open(map, marker);
          });

        //console.log(nycOpenData[value].location_1.coordinates[1]+'  ' +nycOpenData[value].location_1.coordinates[0])
        //marker.setMap(map);

    }*/

    // tool tip on top of the marker
    /*
    var infowindow = new google.maps.InfoWindow({
        content: 'Show name or title of 911 call'
    });
    */
    //infowindow.open(map, marker);
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

//AJAX request to cityofnewyork API. return the response parsed as JSON
function startRequest(myUrl) {
    //var url = 'https://data.cityofnewyork.us/resource/e4qk-cpnv.json?occurrence_year=2006&occurrence_month=Sep&offense=ROBBERY&borough=BROOKLYN';
    var dataSet;
    console.log(myUrl);

    /*
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    httpRequest.onreadystatechange = NYCOpenDataResponse;
    httpRequest.open('GET', myUrl, true);
    httpRequest.setRequestHeader('X-App-Token', 'VxVfB1l051bDWPhFmrm2QeX9a');
    httpRequest.send(null);


    function NYCOpenDataResponse() {
        try {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    dataSet = httpRequest.responseText;
                    //return testData;
                } else {
                    alert('There was a problem with the request.');
                }
            }
        } catch (e) {
            alert('Problem with server');
            console.log(e.description);
        }
    }
    */

    //return parsingToJSON(dataSet);

    $.ajax({
      url: myUrl,
      headers : {
          'X-App-Token' : 'VxVfB1l051bDWPhFmrm2QeX9a'
      },

      success: function (data){
        console.log(data);
        //put all logic here when  search button is clicked. 
      }


    });


}

function parsingToJSON(text) {
    var JSONobject = JSON.parse(text);
    return JSONobject;
}

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
$(document).ready(function() {
    document.getElementById("searchButton").addEventListener('click', function() {

        $(".navbar").addClass("slideUp"); //jquery add class that translates nav bar to top of page
        assignSearchSelection.call(offenseSearchDetail);
        var jsontext = startRequest(editUrlQuery.call(offenseSearchDetail));
        console.log(jsontext + "calling!!!!!!!!!!!!!!!!!");
        initialize(jsontext);

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
    var offenseArray = ["Arson", "Assault 3 & Related Offenses", "Burglary", "Child Abandonment/Non Support", "Felony Assault", "Grand Larceny", "Grand Larceny of Motor Vehicle", "Homicide-Negligent-Vehicle", "Kidnapping", "Rape", "Robbery", "Theft-Fraud"];

    //creat one option with each loop, give it a value and text (what the use sees). Then append the option to the Select element
    for (let i = 0; i <= offenseArray.length - 1; i++) {
        selectOptions = document.createElement("option");
        selectOptions.value = offenseArray[i].toUpperCase();
        selectOptions.text = offenseArray[i];
        offenseSelection.appendChild(selectOptions);
    }
}

function mapStyle(){
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


window.onload = function() {
    fillYearSelectElement();
    fillMonthSelectElement();
    fillBoroughSelectElement();
    fillOffenseTypeSelectElement();
}
