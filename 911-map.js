//maybe have an array of markers to show location of 911 incidents
//initialize google map. TODO: Add info to each marker.
function initialize(jsonParsed) {

    var mapCanvas = document.getElementById('googleMap');
    var nycOpenData = jsonParsed;
    var myCenter;

    //Depending on what use chooses as a borough, the map will focus on that location when user searches.
    switch(offenseSearchDetail.offenseBorough){
      case "BROOKLYN":
      myCenter = new google.maps.LatLng(40.650002,-73.949997);
      break;
      case "QUEENS":
      myCenter = new google.maps.LatLng(40.742054,-73.769417);
      break;
      case "BRONX":
      myCenter = new google.maps.LatLng(40.837048,-73.865433);
      break;
      case "STATEN ISLAND":
      myCenter = new google.maps.LatLng(40.579021,-74.151535);
      break;
      case "MANHATTAN":
      myCenter = new google.maps.LatLng(40.758896,-73.985130);
      break;
      default:
      myCenter = new google.maps.LatLng(40.650002,-73.949997);
    }


    var mapProp = {
        center: myCenter,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };


    var infowindow = new google.maps.InfoWindow(); //only need to make infowindow object once, and use in loop
    var map = new google.maps.Map(mapCanvas, mapProp); // map object


    //function adds an event listener to each marker. when clicked an infowindow is shown with some information about that specific marker.
    function markTheMap(nycOpenDataObject){
      var latLng = new google.maps.LatLng(nycOpenDataObject.location_1.coordinates[1], nycOpenDataObject.location_1.coordinates[0]);

      var marker = new google.maps.Marker({
          position: latLng,
          map: map
      });

        google.maps.event.addListener(marker, 'click', function(){
          infowindow.close(); // Close previously opened infowindow
          infowindow.setContent(googleMapInfoWindow.call(nycOpenDataObject));
                infowindow.maxWidth = 50;
                infowindow.open(map, marker);
        });

    }

    //go through each value in the json and mark it on the map and give appropriate infowindow.
    for (var value in nycOpenData){
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
function googleMapInfoWindow(info){
  var parsedDate = moment(this.occurrence_date).format("MMMM Do YYYY, h:mm: a");

  var contentString = '<div class="info-window">' +
        '<h3>'+this.borough+'</h3>' +
        '<div class="info-content">' +
        '<p><b>Offense:\t</b>'+this.offense+'</p>' +
        '<p><b>Occurence Date:\t</b>'+parsedDate+'</p>' +
        '<p><b>Day:\t</b>'+this.day_of_week+'</p>' +
        '<p><b>Precinct:\t</b>'+this.precinct+'</p>' +
        '<p><b>Jurisdiction:\t</b>'+this.jurisdiction+'</p>'+
        '</div>' +
        '</div>';
  return contentString;
}

//AJAX request to cityofnewyork API. return the response parsed as JSON
function startRequest(url) {
    var httpRequest;
    //var url = 'https://data.cityofnewyork.us/resource/e4qk-cpnv.json?occurrence_year=2006&occurrence_month=Sep&offense=ROBBERY&borough=BROOKLYN';
    var dataSet;
    console.log(url);
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    httpRequest.onreadystatechange = NYCOpenDataResponse;
    httpRequest.open('GET', url, false);
    httpRequest.setRequestHeader('X-App-Token', 'VxVfB1l051bDWPhFmrm2QeX9a');
    httpRequest.send(null);


    function NYCOpenDataResponse() {
      try {
          if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {
                  dataSet = httpRequest.responseText;
                  //return testData;
              }
              else {
                alert('There was a problem with the request.');
              }
          }
    }
    catch (e) {
        alert('Problem with server');
        console.log(e.description);
    }
  }

    return parsingToJSON(dataSet);
}

function parsingToJSON(text) {
    var JSONobject = JSON.parse(text);
    return JSONobject;
}

//function that edits the URL parameters and returns edited url.
function editUrlQuery(){
  console.log(this.offenseType+ " " + this.offenseYear + " " + this.offenseMonth +" "+ this.offenseBorough+" "+" From editUrlQuery");
  var url = 'https://data.cityofnewyork.us/resource/e4qk-cpnv.json?occurrence_year='+this.offenseYear+'&occurrence_month='+this.offenseMonth+'&offense='+this.offenseType+'&borough='+this.offenseBorough;
  return url;
}

//Object with all they keys required to edit url. Any search option user chooses gets assigned to appropriate key;
var offenseSearchDetail = {
  offenseType: null,
  offenseYear: null,
  offenseMonth: null,
  offenseBorough: null
}

//Gets the value in the select elements in html which contains all the search categories.
function assignSearchSelection(){
   this.offenseType = document.getElementById('offenseSelector').value;
   this.offenseYear = document.getElementById('yearSelector').value;
   this.offenseMonth = document.getElementById('monthSelector').value;
   this.offenseBorough = document.getElementById('boroughSelector').value;
}

//event laaunched when search button is pressed. assignSearchSelection function assigns values to the keys in offenseSearchDetail object, which is then passed into
//editUrlQuery which then inserts the value into the url and returns the url. startRequest makes an ajax call to the url.
document.getElementById("searchButton").addEventListener('click', function() {
    assignSearchSelection.call(offenseSearchDetail);
    var jsontext = startRequest(editUrlQuery.call(offenseSearchDetail));
    initialize(jsontext);
}, false);

//Create option values for the Select element. Option values contain years from 2000 - 2015
function fillYearSelectElement(){
  var yearSelection = document.getElementById("yearSelector");
  var yearArray = [];
  var total = 2000;
  var selectOptions;
  for (var i = 0; i<=15; i++){
      yearArray[i] = total;
      total++;
  }

  //creat one option with each loop, give it a value and text (what the use sees). Then append the option to the Select element
  for (let i = 0; i <= yearArray.length-1; i++){
      selectOptions = document.createElement("option");
      selectOptions.value = yearArray[i];
      selectOptions.text = yearArray[i];
      yearSelection.appendChild(selectOptions);
  }

}

//Create option values for the Select element. Option values contain the months in the year
function fillMonthSelectElement(){
  var monthSelection = document.getElementById("monthSelector");
  var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October","November", "December"];

  //creat one option with each loop, give it a value and text (what the use sees). Then append the option to the Select element
  for (let i = 0; i <= monthArray.length-1; i++){
      selectOptions = document.createElement("option");
      selectOptions.value = monthArray[i].substring(0, 3);
      selectOptions.text = monthArray[i];
      monthSelector.appendChild(selectOptions);
  }

}

//Create option values for the Select element. Option values contain the borough of new york
function fillBoroughSelectElement(){
  var boroughSelection = document.getElementById("boroughSelector");
  var boroughArray = ["Brooklyn", "Queens", "Bronx", "Manhattan", "Staten Island"];

  //creat one option with each loop, give it a value and text (what the use sees). Then append the option to the Select element
  for (let i = 0; i <= boroughArray.length-1; i++){
      selectOptions = document.createElement("option");
      selectOptions.value = boroughArray[i].toUpperCase();
      selectOptions.text = boroughArray[i];
      boroughSelection.appendChild(selectOptions);
  }
}

//Create option values for the Select element. Option values contain offense types
function fillOffenseTypeSelectElement(){
  var offenseSelection = document.getElementById("offenseSelector");
  var offenseArray = ["Burglary", "Felony Assault", "Grand Larceny", "Grand Larceny of Motor Vehicle", "Murder & Non-negl. Manslaughte", "Rape", "Robbery"];

  //creat one option with each loop, give it a value and text (what the use sees). Then append the option to the Select element
  for (let i = 0; i <= offenseArray.length-1; i++){
      selectOptions = document.createElement("option");
      selectOptions.value = offenseArray[i].toUpperCase();
      selectOptions.text = offenseArray[i];
      offenseSelection.appendChild(selectOptions);
  }
}



window.onload = function(){
    fillYearSelectElement();
    fillMonthSelectElement();
    fillBoroughSelectElement();
    fillOffenseTypeSelectElement();
}
