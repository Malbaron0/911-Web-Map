//maybe have an array of markers to show location of 911 incidents
//initialize google map. TODO: Add info to each marker.
function initialize(jsonParsed) {

    var mapCanvas = document.getElementById('googleMap');
    var nycOpenData = jsonParsed;
    var myCenter = new google.maps.LatLng(40.5989055802915, -74.00132831970851);
    var mapProp = {
        center: myCenter, // needs LatLng, using myCenter for now.
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(mapCanvas, mapProp); // map object


    for (var value in nycOpenData) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(nycOpenData[value].location_1.coordinates[1], nycOpenData[value].location_1.coordinates[0]),
            title: 'map911'
        });
        //console.log(nycOpenData[value].location_1.coordinates[1]+'  ' +nycOpenData[value].location_1.coordinates[0])
        marker.setMap(map);

    }

    // tool tip on top of the marker
    /*
    var infowindow = new google.maps.InfoWindow({
        content: 'Show name or title of 911 call'
    });
    */
    //infowindow.open(map, marker);
}


//AJAX request to
function startRequest(url) {
    var httpRequest;
    //Added multiple queries--- TODO: Make navigation bar for user to input these queries to make easy to read.
    //var url = 'https://data.cityofnewyork.us/resource/e4qk-cpnv.json?occurrence_year=2006&occurrence_month=Sep&offense=ROBBERY&borough=BROOKLYN';
    var testData;
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
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) {
                testData = httpRequest.responseText;
                return testData;
            } else {
                alert('There was a problem with the request.');
            }
        }
    }

    var JSONobject = JSON.parse(testData);
    return JSONobject;
}

function parsingJSONRequest(text) {
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
