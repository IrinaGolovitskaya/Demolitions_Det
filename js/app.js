// map options
const options = {
    scrollWheelZoom: true,
    zoomControl: false,
    dragging: true,
    center: [42.35, -83.1],
    zoom: 11,
    animate: false,
};

// create the Leaflet map
const map = L.map("map", options);

// request tiles and add to map
const tiles = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
    maxZoom: 20,
    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

// L.control.zoom({
//     position: 'bottomleft'
// }).addTo(map);



// AJAX request for GeoJSON data
fetch("data/Detroit_Census_Blocks_2010.json")
    .then(function (response) {
        console.log(response);
        return response.json();
    })
    .then(function (tracts) {
        console.log(tracts);

        Papa.parse("data/ACSDP5Y.DP05-Data2014-2021.csv", {
            download: true,
            header: true,
            complete: function (data) {
                // Create function to join data and tracts
                processData(tracts, data);
            },
        }); // end of Papa.parse()
        return fetch(
            "data/Neighborhoods_bound.json"
        );
    })
    .then(function (response) {
        return response.json();
    })
    .then(function (neighborhoods) {
        drawNeighborhoods(neighborhoods);
    })
    .catch(function (error) {
        console.log(`Ruh roh! An error has occurred`, error);
    });

function processData(tracts, data) {
    // loop through all the tracts
    for (let i of tracts.features) {
        // for each of the CSV data rows
        for (let j of data.data) {
            const tractnumbers = j.NAME;

            // if the county fips code and data fips code match
            if (i.properties.TRACTCE10.slice(0, -2) === tractnumbers) {
                // Add a new property to hold the unemployment rates
                i.properties = j;

                // no need to keep looping, break from inner loop
                break;
            }
        }

        console.log("after: ", tracts);
    }

    // empty array to store all the data values
    const rates = [];

    // iterate through all the counties
    tracts.features.forEach(function (tract) {
        // iterate through all the props of each county
        for (const prop in tract.properties) {
            // if the attribute is a number and not one of the fips codes or name
            if (
                prop != "GEO_ID" &&
                prop != "NAME"
            ) {
                // push that attribute value into the array
                rates.push(Number(tract.properties[prop]));

            }
        }
    }
    );

    // verify the result!
    console.log(rates);

    var breaks = chroma.limits(rates, "q", 6);

    // create color generator function
    var colorize = chroma
        .scale(['E9E1DE', 'A3A6A6'])
        .classes(breaks)
        .mode("lab");

    console.log(colorize); // function (a){var b;return b=s(u(a)),m&&b[m]?b[m]():b}

    var color = colorize(20);
    console.log(color); // a {_rgb: Array[4]}

    drawMap(tracts, colorize);

    drawLegend(breaks, colorize);
} // end processData()

function drawMap(tracts, colorize) {
    // create Leaflet object with geometry data and add to map
    const dataLayer = L.geoJson(tracts, {
        style: function (feature) {
            return {
                color: "black",
                weight: 0,
                fillOpacity: 1,
                fillColor: "#1f78b4",
            };
        },


    }).addTo(map);

    // first set the zoom/center to the dataLayer's extent with padding
    // map.fitBounds(dataLayer.getBounds(), {
    //     padding: [50, 50],
    // });

    createSliderUI(dataLayer, colorize);

    updateMap(dataLayer, colorize, "2014");
} // end drawMap()

function updateMap(dataLayer, colorize, currentYear) {
    dataLayer.eachLayer(function (layer) {
        const props = layer.feature.properties;

        // set the fill color of layer based on its normalized data value
        layer.setStyle({
            fillColor: colorize(Number(props[currentYear])),
            interactive: false,
        });



    })
        .bringToBack();
} // end updateMap()

function drawLegend(breaks, colorize) {
    // create a Leaflet control for the legend
    const legendControl = L.control({
        position: "topright",
    });

    // when the control is added to the map
    legendControl.onAdd = function (map) {
        // create a new division element with class of 'legend' and return
        const legend = L.DomUtil.create("div", "legend");
        return legend;
    };

    // add the legend control to the map
    legendControl.addTo(map);

    // select div and create legend title
    const legend = document.querySelector(".legend");
    legend.innerHTML = "<h3><span>2014</span> Housing units</h3><ul>";

    // loop through the break values
    for (let i = 0; i < breaks.length - 1; i++) {
        // determine color value
        const color = colorize(breaks[i], breaks);

        // create legend item
        const classRange = `<li><span style="background:${color}"></span>
${breaks[i].toLocaleString()} &mdash;
${breaks[i + 1].toLocaleString()} </li>`;

        // append to legend unordered list item
        legend.innerHTML += classRange;
    }
    // close legend unordered list
    legend.innerHTML +=
        "<li><span style='background:#ccc'></span>No data</ul>";
} // end drawLegend()

function createSliderUI(dataLayer, colorize) {
    // create Leaflet control for the slider
    const sliderControl = L.control({ position: "bottomright" });

    // when added to the map
    sliderControl.onAdd = function (map) {
        // select an existing DOM element with an id of "ui-controls"
        const slider = L.DomUtil.get("ui-controls");

        // disable scrolling of map while using controls
        L.DomEvent.disableScrollPropagation(slider);

        // disable click events while using controls
        L.DomEvent.disableClickPropagation(slider);

        // return the slider from the onAdd method
        return slider;
    };

    // add the control to the map
    sliderControl.addTo(map);

    // select the form element
    const slider = document.querySelector(".year-slider");

    // listen for changes on input element
    slider.addEventListener("input", function (e) {
        // get the value of the selected option
        const currentYear = e.target.value;
        // update the map with current timestamp
        updateMap(dataLayer, colorize, currentYear);
        // update timestamp in legend heading
        document.querySelector(".legend h3 span").innerHTML = currentYear;
    });
} // end createSliderUI()



function drawNeighborhoods(neighborhoods) {
    // const bounds = L.latLngBounds();
    const stateOutline = L.geoJson(neighborhoods, {
        style: function (feature) {
            return {
                color: "#000",
                weight: 1,
                opacity: 0.75,
                fillOpacity: 0,
                interactive: true,
            };
        },
        onEachFeature: function (feature, layer) {
            const name = feature.properties.name;

        },


        onEachFeature: function (feature, layer) {
            // when mousing over a layer
            layer.on("mouseover", function () {
                // change the stroke color and bring that element to the front
                layer
                    .setStyle({
                        color: "#032C2B",
                        weight: 3,
                    })
                    .bringToFront();
            });

            // on mousing off layer
            layer.on("mouseout", function () {
                // reset the layer style to its original stroke color
                layer.setStyle({
                    color: "black",
                    weight: 1,
                });
            });


            let tooltipInfo = "No data available";


            tooltipInfo = `<b>${feature.properties.name}</b></br>`;


            // bind a tooltip to layer with county-specific information
            layer.bindTooltip(tooltipInfo, {
                // sticky property so tooltip follows the mouse
                sticky: true,
            });


        },


    })
        .addTo(map)
        .bringToFront();
    // console.log(bounds);


    // map.fitBounds(bounds, {
    //   padding: [50, 50],
    //   animate: false,
    // });
}


//HEATMAP DEMOLITIONS

fetch('data/Completed_Residential_Demolitions.geojson')

    .then(function (response) {
        console.log(response);
        return response.json();
    })
    .then(function (demolitions) {
        console.log(demolitions);

        const heatLayer = L.heatLayer(demolitions, { radius: 25 })
            .addTo(map);
    })



