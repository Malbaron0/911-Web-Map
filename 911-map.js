//maybe have an array of markers to show location of 911 incidents
//initialize google map.
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
function startRequest() {
    var httpRequest;
    //Added multiple queries--- TODO: Make navigation bar for user to input these queries to make easy to read.
    var url = 'https://data.cityofnewyork.us/resource/e4qk-cpnv.json?occurrence_year=2006&occurrence_month=Sep&offense=ROBBERY&borough=BROOKLYN';
    var testData;

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


document.getElementById("searchButton").addEventListener('click', function() {
    //get the selected value in the select element and assign it to the query.
    if(document.getElementById('crimeSelector').value == 'Burglary'){
      alert("Burglary");
    }
    if(document.getElementById('crimeSelector').value == 'Robbery'){
      alert("Robbery");
    }
    if(document.getElementById('crimeSelector').value == 'Grand Larceny'){
      alert("Grand Larceny");
    }
    var jsontext = startRequest();
    initialize(jsontext);
}, false);
