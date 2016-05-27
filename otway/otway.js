maptiks.trackcode = '67f8ce06-141e-4352-b619-1d8fd4537368';
var skiPlacesCartoCSS = "Map {buffer-size:140;}#otway_trail_places{marker-fill-opacity: 1;marker-line-color: #FFFFFF;marker-line-width: 2;marker-line-opacity: 1;marker-placement:point;marker-type:ellipse;marker-allow-overlap: true;}#otway_trail_places[descriptio='Junction']{marker-fill: #575757;marker-width: 12;}#otway_trail_places[descriptio='Trail Connection']{marker-file: url(http://com.cartodb.users-assets.production.s3.amazonaws.com/maki-icons/park-18.svg);marker-width: 35;} #otway_trail_places::labels{text-name: [name];text-face-name: 'Open Sans Bold Italic';text-size: 14;text-label-position-tolerance: 10;text-fill: #FFFFFF;text-halo-fill: #575757;text-halo-radius: 2;text-dy: -10;text-allow-overlap: true;text-placement: point;text-placement-type: simple;}#otway_trail_places[descriptio='Trail Connection']::labels{text-dy: 20;}";
var map;
var MODE, DEFAULT_MODE = 'singletrack';

function getParamByName(name) {
    "use strict";
    var results, regex;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function nordicLayers(layers) {
    "use strict";
    layers.getSubLayer(0).hide(); // ski background trails
    layers.getSubLayer(1).hide(); // bike trails
    layers.getSubLayer(2).hide(); // otway places
    layers.getSubLayer(3).show(); // ski trails
    layers.getSubLayer(4).hide(); // snow shoe trails
    layers.getSubLayer(5).show(); // added layer - will always be last
}

function singletrackLayers(layers) {
    "use strict";
    layers.getSubLayer(0).show();
    layers.getSubLayer(1).show();
    layers.getSubLayer(2).show();
    layers.getSubLayer(3).hide();
    layers.getSubLayer(4).hide();// snow shoe trails
    if (MODE !== 'race') {
        layers.getSubLayer(5).hide();
    }
}

function snowshoeLayers(layers) {
    "use strict";
    layers.getSubLayer(0).show();
    layers.getSubLayer(1).hide();
    layers.getSubLayer(2).hide();
    layers.getSubLayer(3).hide();
    layers.getSubLayer(4).show();// snow shoe trails
    layers.getSubLayer(5).show();
}

function main() {
    "use strict";
    var map, sql, mapboxAccessToken, trails, summerTiles, winterTiles, selectedLayer, longStyle, shortStyle, initialLayer, longData, shortData, logo, skiPlaces;

    longStyle = {"color": "#F11810", "weight": 5, "opacity": 0.65};
    shortStyle = {"color": "#FFE403", "weight": 5, "opacity": 0.65};

    //mapbox base layers
    mapboxAccessToken = 'pk.eyJ1Ijoid2lsbGNhZGVsbCIsImEiOiJKbjZwckU0In0.ET9f2IdpUPpsmZsOc_0T-w';

    summerTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/willcadell.20c8a20a/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
        zIndex: 0,
        maptiks_id: "Summer Mapbox Tiles"
    });

    winterTiles = L.tileLayer('https://{s}.tiles.mapbox.com/v4/willcadell.43a18a09/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
        zIndex: 0,
        maptiks_id: "Winter Mapbox Tiles"
    });

    //define starting season
    if (DEFAULT_MODE === 'singletrack') {
        initialLayer = summerTiles;
    } else {
        initialLayer = winterTiles;
    }

    // build simple map
    map = new L.Map('map', {
        center: [53.966, -122.88],
        zoom: 14,
        maxZoom: 19,
        minZoom: 12,
        layers: initialLayer,
        maptiks_id: "Otway Trail Map",
        attributionControl: false
    });

    sql = new cartodb.SQL({user: 'sparkgeo', format: 'geojson'});

    sql.execute("SELECT * FROM btb2016_10km")
        .done(function (data) {
            longData = L.geoJson(data, {style: longStyle});
        })
        .error(function (errors) {
            console.log("errors:" + errors);
        });

    sql.execute("SELECT * FROM btb2016_5km")
        .done(function (data) {
            shortData = L.geoJson(data, {style: shortStyle});
        })
        .error(function (errors) {
            console.log("errors:" + errors);
        });

    map.fitBounds([[53.9727081860345, -122.859095858743], [53.9576281860941, -122.899495685641]]);

    // cartodb data
    trails = cartodb.createLayer(map, 'https://sparkgeo.cartodb.com/api/v2/viz/5d02bb8c-0a03-11e5-a7d9-0e018d66dc29/viz.json', {
        mobile_layout: false,
        legends: false,
        cartodb_logo: false,
        zIndex: 999,
        maptiks_id: "CartoDB Data"
    }).addTo(map).done(function (layers) {
        if (getParamByName('race') === 'beat-the-bugs') {

            MODE = 'race';

            $("#layer-list").append(
                "<li class='selected' id='short'><i class='fa fa-bug' aria-hidden='true'></i> <span class='title'>Beat the Bugs:</span> 5km </li>" +
                "<li id='long'><i class='fa fa-bug' aria-hidden='true'></i> <span class='title'>Beat the Bugs:</span> 10km </li>"
            );

            map.addLayer(shortData);

            $('#long').click(function () {
                $(this).toggleClass('selected');
                if (map.hasLayer(longData)) {
                    map.removeLayer(longData);
                } else {
                    map.addLayer(longData);
                }
            });

            $('#short').click(function () {
                $(this).toggleClass('selected');
                if (map.hasLayer(shortData)) {
                    map.removeLayer(shortData);
                } else {
                    map.addLayer(shortData);
                }
            });
            layers.setInteraction(true);
            singletrackLayers(layers);

        } else {
                
            $("#layer-list").append(
                "<li id='singletrack' class='selected'><i class='map-icon-bicycling'></i> <span class='title'>Single Track</span></li>" +
                "<li id='nordic'><i class='map-icon-cross-country-skiing'></i> <span class='title'>Nordic Skiing</span></li>" +
                "<li id='snowshoe'><i class='map-icon-snow-shoeing'></i> <span class='title'>Snow Shoeing</span></li>"
            );

            skiPlaces = {
                sql: "SELECT * FROM otway_trail_places WHERE type = 'all'",
                cartocss: skiPlacesCartoCSS
            };

            layers.setInteraction(true);
            layers.createSubLayer(skiPlaces);

            if (DEFAULT_MODE === 'singletrack') {
                singletrackLayers(layers);
            } else {
                nordiclayers(layers);
            }

            createSelector(layers);
        }
    }).error(function (err) {
        console.log(err);
    });

    //geolocation
    new L.control.locate({
        icon: 'map-icon-crosshairs',
        locateOptions: {
            maxZoom: 16
        },
        keepCurrentZoomLevel: false,
        strings: {
            title: "Locate Me",  // title of the locate control
            popup: "You are within {distance} {unit} from this point",  // text to appear if user clicks on circle
            outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
        }
    }).addTo(map);

    //branding
    logo = L.control({position: 'bottomright'});

    logo.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'spk');
        var img_log = "<div class='spk'><img src='http://images.sparkgeo.com/poweredby_transparent_100w.png?src=otway'></img></div>";
        this._div.innerHTML = img_log;
        return this._div;
    };
    logo.addTo(map);

    L.control.attribution({
        position: 'bottomleft',
        prefix: "Warning: Multi use trails are used at your own risk! Maps are provided for your education & safety"
    }).addTo(map);

    //custom layer selector
    function createSelector(layers) {
        var $options, $li, layer;
        $options = $('#layer_selector li');
        $options.on('click', function (e) {
            $options.removeClass('selected');
            $li = $(e.target);
            $li.addClass('selected');
            layer = $li.attr('id');
            if (selectedLayer !== layer) {
                if (layer === 'nordic') {
                    nordicLayers(layers)
                    if (map.hasLayer(summerTiles)) {
                        map.removeLayer(summerTiles);
                        map.addLayer(winterTiles);
                    }
                }
                else if (layer === 'singletrack') {
                    singletrackLayers(layers)
                    if (map.hasLayer(winterTiles)) {
                        map.removeLayer(winterTiles);
                        map.addLayer(summerTiles);
                    }
                }
                else if (layer === 'snowshoe') {
                    snowshoeLayers(layers)
                    if (map.hasLayer(summerTiles)) {
                        map.removeLayer(summerTiles);
                        map.addLayer(winterTiles);
                    }
                }
            }
        });
    }

    $(document).ready(function () {
        $("button").click(function () {
            $(".togglelist").toggle();
        });
    });
}

window.onload = main;