// getData.js
//https://api.forecast.io/forecast/APIKEY/LATITUDE,LONGITUDE,TIME
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
              stops: [
                  [0, '#0033ff'], // sfba_land_pts.geojson = cloudiness - 1=overcast, 0=sunny
                  [0.55, '#ff7700'] // max cloudy for that datetime
              ]
            },
            "circle-radius": 9,
            "circle-opacity": 0.5
        }
    });

    map.addLayer({
        "id": "points3",
        "type": "symbol",
        "source": "points",
        "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{sun}",
            "text-size": 8,
            //"text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
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