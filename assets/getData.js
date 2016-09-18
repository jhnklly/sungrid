/*
getData.js
https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE,TIME

When storing fio data, hash to minimize?
No, keep full copies, and create jsons with only desired keys,
renamed to abbr.

Gather data from all requests into one large json.
Write to file/db for that date, showing number of requests and NE corner.

Use large json to animate? Or use hourly info, already stored on each pt.
Play/pause
Global animTime counter.

d3 instead? Better transitions; data bound to svg elements.

function cullDatum(obj) {
  var newDatum = {
    "t": obj.time,
    "pp": obj.precipProbability,
    "tempF": obj.temperature,
    "w": obj.windSpeed,
    "vis": obj.visibility,
    "cc": obj.cloudCover,
    "prsr": obj.pressure
  };
  return newDatum;
}


function cullDatumDaily(obj) {
  var newDatum = {
    "t": obj.time,
    "pp": obj.precipProbability,
    "tempFMax": obj.temperatureMax,
    "tempFMin": obj.temperatureMin,
    "w": obj.windSpeed,
    "vis": obj.visibility,
    "cc": obj.cloudCover,
    "prsr": obj.pressure,
    sunrise: obj.sunriseTime,
    sunset: obj.sunrsetTime,
  };
  return newDatum;
}


var newFeature = {};
var raw = a.properties.data;

newFeature.lat = raw.latitude;
newFeature.lon = raw.longitude;
newFeature.curr = {
  "t": raw.currently.time,
  "pp": raw.currently.precipProbability,
  "tempF": raw.currently.temperature,
  "w": raw.currently.windSpeed,
  "vis": raw.currently.visibility,
  "cc": raw.currently.cloudCover,
  "prsr": raw.currently.pressure
};

newFeature.hourly = { "data": [] };
newFeature.daily = { "data": [] };

raw.daily.data.forEach(function(v,i){
  newFeature.daily.data.push(cullDatum(v));
});

Step/animate:
Increment daylight hours
*/


var APIKEY = "86f515c3f0103714bc87cfc7910bcdc5";
var A = {};
A.gjFeature =  {
  "type": "Feature",
  "properties": {
    "name": "H",
    "data": {}
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-122.4220,37.7406]
  }
};

A.GJ = {
  "type": "FeatureCollection",
  "features": [A.gjFeature]
};

//A.gjPoints = returnPointGrid('-122.5 37.5 -122.0 38.0', 1/32); // SFBA 289 pts
//A.gjPoints = returnPointGrid('-122.75 37.5 -122.0 38.0', 1/64); // SFBA 289 pts

A.IDX = 0;
function animate() {
  var si = window.setInterval(function() {
    // for each feature, update the mapped value
    A.gjPoints.features.forEach(function(v,i){
      v.properties.sun = v.properties.data.hourly.data[A.IDX].cloudCover;
      console.log(A.IDX, v.properties.sun);
    });
    map.getSource('points').setData(A.gjPoints);

    A.IDX++;
    A.IDX = (A.IDX >= A.gjPoints.features[0].properties.data.hourly.data.length - 1) ? 0 : A.IDX + 1;
  }, 1000);
}

var colorGradient = d3.scaleSequential(d3.interpolateViridis);
colorGradient.domain([0, 1]);


//d3.json("assets/sfba_land_pts_64.geojson", function(err, data){
d3.json("assets/sfba_land_pts_64_forecast_data.geojson", function(err, data){
  A.gjPoints = data;
  //processData(A.gjPoints);
  // document.querySelector('body').innerHTML = JSON.stringify(A.gjPoints);

  addPoints();
});




function processData(gj) {

  gj.features.forEach(function(v,i){

    //console.log(v.properties.name);
    console.log(v.geometry.coordinates);
    var latLonTime = [v.geometry.coordinates[1], v.geometry.coordinates[0], A.nowTime];

    var url = "assets/proxy.php?url=" + encodeURIComponent( "https://api.forecast.io/forecast/" + APIKEY + "/" + latLonTime.join(",") );
    d3.json(url, function(err, data){
      console.log(err);
      console.log(data.currently.cloudCover);
      //gj.features[i].properties.data = data.currently.cloudCover;
      gj.features[i].properties.data = data;

      sun = 1 - data.currently.cloudCover;
      sun = Math.round(sun * 100) / 100
      gj.features[i].properties.sun = sun;
      //gj.features[i].properties["color"] = colorGradient(sun);
    });

  });

}


var primary_plus_colors = {
  //darkRed: '#B21F29',
  red2: '#ff0000',
  redOrange: '#ef4623',
  orange2: '#FF7F00',
  yellowOrange: '#fdb51e',
  yellow2: '#ffff00',
  yellowGreen: '#9fc33e',
  green2: '#008000',
  blueGreen: '#157D83',
  azure2: '#007FFF',
  //bluePurple: '#f83f99',
  not_purple2: '#7F00FF',
  purple2: '#800080'
};


var keysReverse = Object.keys(primary_plus_colors).reverse();

var stops = [[0.0, "#000000"]];
var j = 0.10;

for(i=0; i< keysReverse.length; i++) {
    console.log(primary_plus_colors[keysReverse[i]]);
  //j += 0.02;
  j += 0.08;
  stops.push( [j, primary_plus_colors[ keysReverse[i] ] ] );
}
/*
for (var key in primary_plus_colors) {
  j += 0.02;
  stops.push([j, primary_plus_colors[key]]);
}
*/
function addPoints() {

  map.on('load', function () {
    map.addSource("points", {
        "type": "geojson",
        "data": A.gjPoints
    })


    map.addLayer({
        "id": "points2",
        "type": "circle",
        "source": "points",
        "paint": {
            "circle-color": {
              property: 'sun',
              stops: stops // [
                  //[0.10, '#0033ff'], // nb whether value is cloudiness or sunniness
                  //[0.55, '#ff7700'] //
                  /*[0.0, '#000000'],
                  [0.10, '#7F00FF'],
                  [0.12, '#0000ff'],
                  [0.14, '#008000'],
                  [0.16, '#ffff00'],
                  [0.18, '#ff7f00'],
                  [0.2, '#ff0000'],
                  [0.22, '#ff00ff']*/
              //]
            },
            "circle-radius": 9,
            "circle-opacity": 0.25
        }
    });

    map.addLayer({
        "id": "points3",
        "type": "symbol",
        "source": "points",
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{sun}",
            "text-size": 12,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-offset": [0, -0.5],
            "text-anchor": "top"
        }
    });

  });

  // When a click event occurs near a place, open a popup at the location of
  // the feature, with description HTML from its properties.
  map.on('click', function (e) {
      var features = map.queryRenderedFeatures(e.point, { layers: ['points'] });

      if (!features.length) {
          return;
      }

      var feature = features[0];

      var data = feature.properties.name + ": " + feature.properties.data || "no data";

      // Populate the popup and set its coordinates
      // based on the feature found.
      var popup = new mapboxgl.Popup()
          .setLngLat(feature.geometry.coordinates)
          .setHTML(data)
          .addTo(map);
  });

  // Use the same approach as above to indicate that the symbols are clickable
  // by changing the cursor style to 'pointer'.
  map.on('mousemove', function (e) {
      var features = map.queryRenderedFeatures(e.point, { layers: ['points'] });
      map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
  });

}


var aCity;
aCity = copyJSON(A.gjFeature);
aCity.properties.name = "ATT";
aCity.geometry.coordinates = [-122.3938,37.7769]
A.GJ.features.push(aCity);

aCity = copyJSON(A.gjFeature);
aCity.properties.name = "Fairfax";
aCity.geometry.coordinates = [-122.5904,37.9852]
A.GJ.features.push(aCity);

aCity = copyJSON(A.gjFeature);
aCity.properties.name = "LakeMerritt";
aCity.geometry.coordinates = [-122.2657,37.7975]
A.GJ.features.push(aCity);

aCity = copyJSON(A.gjFeature);
aCity.properties.name = "FosterCity";
aCity.geometry.coordinates = [-122.2689,37.5611]
A.GJ.features.push(aCity);

aCity = copyJSON(A.gjFeature);
aCity.properties.name = "SanMateo";
aCity.geometry.coordinates = [-122.3243053,37.5640288]
A.GJ.features.push(aCity);


A.sw = [-122.3243053,37.5640288];
A.ne = [-122.2657,37.7975];
A.boundsData = [A.sw, A.ne];

A.nowTime = Math.floor((new Date()).getTime() / 1000);
/*
For each latLons
- Get weather data from forecast.io for right meow.

- Drop a pin

- Symbolize by amount of sun
Readable as %
ooo
oo-
---
 -

- Clickable for all info


ogr2ogr -f geojson ne10_california.geojson -sql "select name from ne_10m_admin_1_states_provinces_lakes_shp where name='California'" ne_10m_admin_1_states_provinces_lakes_shp.shp -lco coordinate_precision=6


*/


/*
A.GJ.features.forEach(function(v,i){
  //console.log(v.properties.name);
  console.log(v.geometry.coordinates);
  var latLonTime = [v.geometry.coordinates[1], v.geometry.coordinates[0], A.nowTime];

  var url = "assets/proxy.php?url=" + encodeURIComponent( "https://api.forecast.io/forecast/" + APIKEY + "/" + latLonTime.join(",") );

  d3.json(url, function(err, data){
    //console.log(url);
    console.log(err);
    console.log(A.GJ.features[i].properties.name);
    console.log(data.currently.cloudCover);
    A.GJ.features[i].properties.data = data.currently.cloudCover;
  });

});
*/

function copyJSON(json) {
  return JSON.parse(JSON.stringify(json));
}