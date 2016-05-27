/**
 * Created by willcadell on 2016-05-26.
 */
maptiks.trackcode = '67f8ce06-141e-4352-b619-1d8fd4537368';
var map;

function getParamByName(name) {
    "use strict";
    var results, regex;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function main() {
    "use strict";
    var raceData, trails, raceStyle, sql, mapboxAccessToken, baseTiles, satTiles, baseMaps, baseMapLive, baseActions, logo;

    //mapbox base layers
    mapboxAccessToken = 'pk.eyJ1Ijoid2lsbGNhZGVsbCIsImEiOiJKbjZwckU0In0.ET9f2IdpUPpsmZsOc_0T-w';

    baseTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/willcadell.20c8a20a/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
        zIndex: 0,
        maptiks_id: "Summer Mapbox Tiles"
    });

    satTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
        zIndex: 0,
        maptiks_id: "Satellite Mapbox Tiles"
    });

    baseMaps = {"topo": baseTiles, "sat": satTiles};
    baseMapLive = baseMaps.topo;

    // build simple map
    map = new L.Map('map', {
        center: [53.98, -122.86],
        zoom: 13,
        maxZoom: 19,
        minZoom: 12,
        layers: baseMapLive,
        maptiks_id: "Pidherny Single Track",
        attributionControl: false
    });



    // cartodb trail data
    trails = cartodb.createLayer(map, 'https://sparkgeo.cartodb.com/api/v2/viz/6cbc03be-fdad-11e5-8a85-0e674067d321/viz.json', {
        mobile_layout: false,
        legends: false,
        cartodb_logo: false,
        zIndex: 999,
        maptiks_id: "CartoDB Data"
    }).addTo(map).done(function () {

        if (getParamByName('race') === 'rustchucker') {

            raceStyle = {"color": "#F11810", "weight": 5, "opacity": 0.65};

            sql = new cartodb.SQL({user: 'sparkgeo', format: 'geojson'});

            sql.execute("SELECT * FROM pidherny_08042016 WHERE race = 'long' or race = 'both'")
                .done(function (data) {
                    raceData = L.geoJson(data, {style: raceStyle});
                    map.addLayer(raceData);
                })
                .error(function (errors) {
                    // errors contains a list of errors
                    console.log("errors:" + errors);
                });

            $("#layer-list").append("<li id='raceCourse' class='selected layer-menu layer'><i class='map-icon-bicycling'></i><span class='title'> RUSTCHUCKER!</span></li>");
            $('#raceCourse').click(function (e) {
                $(this).toggleClass('selected');
                var elem = e.target.id ? e.target : e.target.parentNode;
                if (map.hasLayer(raceData)) {
                    map.removeLayer(raceData);
                } else {
                    map.addLayer(raceData);
                }
            });
        }
    }).error(function (err) {
        console.log(err);
    });

    //satellite-topo layer switcher
    function toggleBase(base) {
        map.removeLayer(baseMapLive);
        baseMapLive = baseMaps[base];
        map.addLayer(baseMapLive);
    }

    baseActions = {
        topo: function () {
            toggleBase('topo');
        },
        sat: function () {
            toggleBase('sat');
        }
    };

    L.easyButton({
        states: [{
            stateName: 'add-satellite',
            icon: 'map-icon-point-of-interest',
            title: 'Show image background',
            onClick: function (control) {
                baseActions.sat();
                control.state('add-topo');
            }
        }, {
            stateName: 'add-topo',
            icon: 'map-icon map-icon-compass',
            title: 'Show topo background',
            onClick: function (control) {
                baseActions.topo();
                control.state('add-satellite');
            }
        }]
    }).addTo(map);

    //geolocation
    new L.control.locate({
        icon: 'map-icon-crosshairs',
        locateOptions: {
            maxZoom: 15,
            watch: true,
            setView: true,
            maximumAge: 1000,
            enableHighAccuracy: true
        },
        keepCurrentZoomLevel: true,
        strings: {
            title: "Locate Me",  // title of the locate control
            popup: "You are within {distance} {unit} from this point",  // text to appear if user clicks on circle
            outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
        }
    }).addTo(map)

    //branding
    logo = L.control({
        position: 'bottomright'
    });
    logo.onAdd = function () {
        this._div = L.DomUtil.create('div', 'spk');
        this._div.innerHTML = "<div class='spk'><img src='http://images.sparkgeo.com/poweredby_transparent_100w.png?src=otway'></img></div>";
        return this._div;
    };
    logo.addTo(map);

    //warning
    L.control.attribution({
        position: 'bottomleft',
        prefix: "Warning: Trails are used at your own risk! Maps are provided for your education & safety"
    }).addTo(map);
}

window.onload = main;