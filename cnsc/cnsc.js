//maptiks.trackcode = "67f8ce06-141e-4352-b619-1d8fd4537368";
var skiTrails;
var grooming;
var groomedTrails;
var map;

var trail_layer_defn = {
    user_name: "sparkgeo",
    type: "cartodb",
    sublayers: [{
        sql: "SELECT * FROM otway_ski_trails_2",
        cartocss: "#layer::blaze {line-width: 14;line-color:#FFFFFF;line-opacity: 0.9;line-join: round;line-cap: round;[floodlit=true]{::case {line-width: 10;line-color:#FFE403;line-opacity: 0.2;}}}#layer {line-width: 2.5; line-opacity: 0.9; [difficulty='black'] {line-color: #000000;[direction = 1]{marker-line-width: 0;marker-opacity: 0.9;marker-type:arrow;marker-placement:line;marker-line-color: #000000;marker-fill: #000000;}}[difficulty='blue'] {line-color: #1F78B4;[direction = 1]{marker-line-width: 0;marker-opacity: 0.9;marker-type:arrow; marker-placement:line;marker-line-color: #1f78b4;marker-fill: #1F78B4;} } [difficulty='green'] {line-color: #33A02C;[direction = 1]{marker-line-width: 0;marker-opacity: 0.9;marker-type:arrow; marker-placement:line;marker-line-color: #33a02c;marker-fill: #33a02c;} }}#layer::labels {text-name: [name];text-face-name: 'Lato Bold';text-min-distance: 200;text-size: 16;text-fill: #ffffff;text-label-position-tolerance: 10;text-halo-radius: 3;text-halo-fill: #ffffff;text-dy: 0;text-allow-overlap: false;text-placement: line;text-placement-type: simple;text-min-padding: 50;[difficulty='green'] {text-halo-fill: #33A02C;}[difficulty='blue'] {text-halo-fill: #1F78B4;}[difficulty='black'] {text-halo-fill: #000000;}}"
    }, {
        sql: "SELECT * FROM ski_junctions",
        cartocss: "#ski_junctions {marker-width: 10;marker-fill: #000000; marker-transform: 'rotate(180,0,0)';marker-placement: point; marker-allow-overlap: true;marker-file: url(http://com.cartodb.users-assets.production.s3.amazonaws.com/maki-icons/triangle-18.svg);[zoom = 14]{marker-width: 20; }[zoom > 15]{marker-width: 30; #ski_junctions::labels {text-name: [name];text-face-name: 'Lato Bold';text-size: 12;text-fill: #ffffff;text-label-position-tolerance: 0;text-halo-radius: 2;text-halo-fill: #000000;text-dy: 0;text-allow-overlap: true;text-placement: point;text-placement-type: dummy;}}[zoom > 17]{marker-width: 70; #ski_junctions::labels {text-size: 16;text-wrap-width: 25;}}}"
    }, {
        sql: "SELECT * FROM snowshoe2016",
        cartocss: "#snowshoe2016::blaze {line-width: 14; line-color:#FFFFFF; line-opacity: 0.9; line-join: round; line-cap: round;} #snowshoe2016 {line-width: 3;line-opacity: 1;[name = 'purple']{line-color: #A256B3;}[name = 'green']{line-color: #009629;}[name = 'blue']{line-color: #006BC0;}[name = 'red']{line-color: #FE0000;}[name = 'green-red-blue']{line-color: #009629;line-width: 3; ::bluedash {line-color: #006BC0;line-width: 3;line-dasharray: 40, 20;} ::reddash {line-color: #FE0000;line-width: 3;line-dasharray: 20, 40;}}}"
    }, {
        sql: "SELECT * FROM snowshoeplaces",
        cartocss: "#snowshoeplaces {marker-width: 10;marker-fill: #000000;marker-transform: 'rotate(180,0,0)'; marker-placement: point;marker-allow-overlap: true;marker-file: url(http://com.cartodb.users-assets.production.s3.amazonaws.com/maki-icons/triangle-18.svg);[zoom = 14]{marker-width: 20;}[zoom > 15]{marker-width: 30;#snowshoeplaces::labels {text-name: [name];text-face-name: 'Lato Bold';text-size: 12;text-fill: #ffffff;text-label-position-tolerance: 0;text-halo-radius: 2;text-halo-fill: #000000;text-dy: 0;text-allow-overlap: true;text-placement: point;text-placement-type: dummy;}} [zoom > 17]{marker-width: 70;#snowshoeplaces::labels {text-size: 16;text-wrap-width: 25;}}}"
    }]
};

function getParamByName(name) {
    "use strict";
    var results, regex;
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function nordicLayers() {
    "use strict";
    skiTrails.getSubLayer(0).show();
    skiTrails.getSubLayer(1).show();
    skiTrails.getSubLayer(2).hide();
    skiTrails.getSubLayer(3).hide();
    removeGroomers();
}

function snowshoeLayers(layer) {
    "use strict";
    skiTrails.getSubLayer(0).hide();
    skiTrails.getSubLayer(1).hide();
    skiTrails.getSubLayer(2).show();
    skiTrails.getSubLayer(3).show();
    removeGroomers();
}

function groomingLayers() {
    "use strict";
    skiTrails.getSubLayer(0).hide();
    skiTrails.getSubLayer(1).hide();
    skiTrails.getSubLayer(2).hide();
    skiTrails.getSubLayer(3).hide();
    groomedTrails.addTo(map);
    grooming.addTo(map);
}

function removeGroomers(){
    map.removeLayer(groomedTrails);
    map.removeLayer(grooming);
}

//custom layer selector
function createSelector() {
    "use strict";
    var $options, $li, layer;
    $options = $('#layer_selector li');
    $options.on('click', function (e) {
        $options.removeClass('selected');
        $li = $(e.target);
        $li.addClass('selected');
        layer = $li.attr('id');
        if (layer === 'nordic') {
            nordicLayers();
        } else if (layer === 'grooming') {
            groomingLayers();
        } else if (layer === 'snowshoe') {
            snowshoeLayers();
        }

    });
}

function main() {
    "use strict";
    var trails, logo;

    var winterTiles = L.tileLayer("https://api.mapbox.com/styles/v1/willcadell/civfwj6lt001e2jotmoh8vo7u/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoid2lsbGNhZGVsbCIsImEiOiJKbjZwckU0In0.ET9f2IdpUPpsmZsOc_0T-w", {
        attribution: "<a href='http://www.mapbox.com/about/maps/' target='_blank'>Terms &amp; Feedback</a>",
        zIndex: 0,
        maptiks_id: "Winter Mapbox Tiles"
    });

    grooming = L.tileLayer("//tiles{s}.skitrails.info/grooming/caledonia/{z}/{x}/{y}.png", { maxZoom: 18 });
    groomedTrails = L.tileLayer("//tiles{s}.skitrails.info/map/<shortname>/{z}/{x}/{y}.png", { maxZoom: 18 });

    map = new L.Map("map", {
        center: [53.966, -122.88],
        zoom: 14,
        maxZoom: 19,
        minZoom: 12,
        layers: winterTiles,
        maptiks_id: "Otway Trail Map",
        attributionControl: false
    });

    map.fitBounds([[53.9727081860345, -122.859095858743], [53.9576281860941, -122.899495685641]]);
   cartodb.createLayer(map, trail_layer_defn, {https: true})
       .addTo(map)
       .done(function(layer) {
            skiTrails = layer;
            $("#layer-list").append(
                "<li id='nordic' class='selected'><i class='map-icon-cross-country-skiing'></i> <span class='title'>Nordic Skiing</span></li>" +
                "<li id='snowshoe'><i class='map-icon-snow-shoeing'></i> <span class='title'>Snow Shoeing</span></li>" +
                "<li id='grooming'><i class='map-icon-snow'></i> <span class='title'>Grooming</span></li>"
            );
            nordicLayers();
            createSelector(layer);
       })
       .error(function (err) {
           console.log(err);
       });

    //geolocation
    new L.control.locate({
        icon: "map-icon-crosshairs",
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
        var img_log = "<div class='spk'><img src='http://images.sparkgeo.com/poweredby_transparent_100w.png?src=trails'></img></div>";
        this._div.innerHTML = img_log;
        return this._div;
    };
    logo.addTo(map);

    L.control.attribution({
        position: 'bottomleft',
        prefix: "Warning: Multi use trails are used at your own risk! Maps are provided for your education & safety"
    }).addTo(map);

    $(document).ready(function () {
        $("button").click(function () {
            $(".togglelist").toggle();
        });
    });
}

window.onload = main;