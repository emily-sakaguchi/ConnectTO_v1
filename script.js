/*--------------------------------------------------------------------
ConnectTO Suitability Tool
JavaScript
--------------------------------------------------------------------*/


//Initialize map
const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=vYYUHMMF2krizlVhi9JA', // style URL
    center: [-79.355, 43.715], 
    zoom: 10.3, 
    maxBounds: [
        [-180, 30], // Southwest
        [-25, 84]  // Northeast
    ],
    bearing: -17, // bearing in degrees
});

var mq = window.matchMedia( "(min-width: 420px)" );

if (mq.matches){
    map.setZoom(10.3); //set map zoom level for desktop size
} else {
    map.setZoom(8.5); //set map zoom level for mobile size
};

map.addControl(new maplibregl.NavigationControl());


/*--------------------------------------------------------------------
DATA
--------------------------------------------------------------------*/

let parks;
let ttcShelter;
let suitability;
let wayfinder;
let neighb;

// Fetch GeoJSON from github URL, convert response to JSON, and store response as variable 
fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/parksNeighb.geojson')
    .then(response => response.json())      // Store response as JSON format
    .then(response => {
        console.log(response);      // Check response in console
        parks = response;       
    });

fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/ttcNeighb.geojson')
    .then(response => response.json())      // Store response as JSON format
    .then(response => {
        console.log(response);      // Check response in console
        ttcShelter = response;       
    });

fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/wayfindNeighb.geojson')
    .then(response => response.json())      // Store response as JSON format
    .then(response => {
        console.log(response);      // Check response in console
        wayfinder = response;       
    });

fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/Suitability.geojson')
    .then(response => response.json())      // Store response as JSON format
    .then(response => {
        console.log(response);      // Check response in console
        suitability = response;       
    });

    fetch('https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/Neighbourhoods.geojson')
    .then(response => response.json())      // Store response as JSON format
    .then(response => {
        console.log(response);      // Check response in console
        neighb = response;       
    });


// Adding layers to map
map.on('load', () => {
    map.addSource('parks',{
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/parksNeighb.geojson'
    });

    // not filtered because data was cleaned manually to remove parks, community centres, and arenas with Wi-Fi
    map.addLayer({
        'id': 'parks',
        'type': 'circle',
        'source': 'parks',
        'paint': {
            'circle-radius':['interpolate', ['linear'], ['zoom'], 9, 1, 10.3, 2, 12, 3.5, 15, 4.5],
            'circle-color': '#01470a', // green
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1
        }
    });


    map.addSource('ttcShelter',{
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/ttcNeighb.geojson'
    });

// filtered in ArcPro so status is existing for all 
    map.addLayer({
        'id': 'ttcShelter',
        'type': 'circle',
        'source': 'ttcShelter',
        'paint': {
            'circle-radius':['interpolate', ['linear'], ['zoom'], 9, 1, 10.3, 2, 12, 3.5, 15, 4.5],
            'circle-color': '#ed2f2f', //red 
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1
        }
    });

    map.addSource('wayfinder',{
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/wayfindNeighb.geojson'
    });

// filtered in ArcPro so status is existing for all 
    map.addLayer({
        'id': 'wayfinder',
        'type': 'circle',
        'source': 'wayfinder',
        'paint': {
            'circle-radius':['interpolate', ['linear'], ['zoom'], 9, 1, 10.3, 2, 12, 3.5, 15, 4.5],
            'circle-color': '#066ad4', //blue
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1
        }
    });

    map.addSource('neighb',{
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/Neighbourhoods.geojson'
    });

    map.addLayer({
        'id': 'neighb',
        'type': 'fill',
        'source': 'neighb',
        'paint': {
            'fill-color':'transparent',
            'fill-opacity': 0.8,
            'fill-outline-color': 'black'
        }
    });

    map.addLayer({
        'id': 'neighbEN',
        'type': 'line',
        'source': 'neighb',
        'paint': {
            'line-width': 2,
            'line-opacity': 1,
            'line-color': '#05F1FC'
        },
        'filter': ['==', ['get', 'CLASSIFICATION'], 'Emerging Neighbourhood']
    });

    map.setLayoutProperty(
        'neighbEN',
        'visibility',
        'none'
    );

    map.addLayer({
        'id': 'neighbNIA',
        'type': 'line',
        'source': 'neighb',
        'paint': {
            'line-width':2,
            'line-opacity': 1,
            'line-color': 'black'
        },
        'filter': ['==', ['get', 'CLASSIFICATION'], 'Neighbourhood Improvement Area']
    });

    map.setLayoutProperty(
        'neighbNIA',
        'visibility',
        'none'
    );

    map.addSource('suitability', {
        type:'geojson',
        data:'https://raw.githubusercontent.com/emily-sakaguchi/ConnectTO_v1/main/data/Suitability.geojson'
    });

    map.addLayer({
        'id': 'suitability',
		'type': 'fill',
		'source': 'suitability',
		'paint': {
			'fill-color': [
				'step', 
				['get', 'V'],
				'grey', //colour for anything that falls outside the 1-10 range
				1, '#a50126', // red
				2, '#da362a', 
				3, '#f57b4a',
				4, '#fdbe6f',
				5, '#feeea1', //yellow
				6, '#eaf6a2',
				7, '#b7e175',
				8, '#74c465',
				9, '#229c53',
				10, '#006837' //green
            ],
            'fill-opacity': 0.9
			}
		}, 'parks','ttcShelter','wayfinder');

        map.addLayer({
            'id': 'suitability-hov',
            'type': 'fill',
            'source': 'suitability',
            'paint': {
                'fill-color': [
                    'step', 
                    ['get', 'V'],
                    'grey', //colour for anything that falls outside the 1-10 range
                    1, '#a50126', // red
                    2, '#da362a', 
                    3, '#f57b4a',
                    4, '#fdbe6f',
                    5, '#feeea1', //yellow
                    6, '#eaf6a2',
                    7, '#b7e175',
                    8, '#74c465',
                    9, '#229c53',
                    10, '#006837' //green
                ],
                'fill-outline-color': 'white',
                'fill-opacity': 1
                },
                'filter': ['==', ['get', 'S_Id'], ''] //Initial filter (returns nothing)
            }, 'parks','ttcShelter','wayfinder');
         
    }) 
    //end of map load event

/*--------------------------------------------------------------------
HOVER EVENT    
- if a suitability polygon is under the mouse hover, it will turn opaque and get a white outline to create a highighting effect
 --------------------------------------------------------------------*/
       
 map.on('mousemove', 'suitability', (e) => {
        
    if (e.features.length > 0) { //determines if there is a feature under the mouse
        map.setFilter('suitability-hov', ['==', ['get', 'S_Id'], e.features[0].properties.S_Id]); //applies the empty filter created
    }    
});
 
map.on('mouseleave', 'suitability-hov', () => { //removes the highlight when the mouse moves away
    map.setFilter("suitability-hov",['==', ['get', 'S_Id'], '']);   
});

/*--------------------------------------------------------------------
POP-UP ON CLICK EVENT
- When the cursor moves over the map, it changes from the default hand to a pointer
- When the cursor clicks on a feature, the name and classification will appear in a pop-up
--------------------------------------------------------------------*/

//Neighbourhoods pop-up
map.on('mouseenter', 'suitability', () => {
    map.getCanvas().style.cursor = 'pointer'; //Switches cursor to pointer when mouse is over the neighbourhood-fill layer
});

map.on('mouseleave', 'suitability', () => {
    map.getCanvas().style.cursor = ''; //Switches cursor back when mouse leaves neighbourhood-fill layer
});

map.on('click', 'suitability', (e) => {
    new maplibregl.Popup() //Declares a new popup on each click
        .setLngLat(e.lngLat) //Coordinates of the mouse click to determine the coordinates of the pop-up
        //Text for the pop-up:
        .setHTML("<b>Suitability score:</b> " + e.features[0].properties.V)
        .addTo(map); //Adds the popup to the map
});

if (mq.matches){
    map.on('click', 'neighb', (e) => {
        new maplibregl.Popup() //Declares a new popup on each click
            .setLngLat([-79.020, 43.691]) //Coordinates of the mouse click to determine the coordinates of the pop-up
            //Text for the pop-up:
            .setHTML("<b>Neighbourhood name:</b> " + e.features[0].properties.AREA_NAME + "<br>" +// shows neighbourhood name
                "<b>Improvement status:</b> " + e.features[0].properties.CLASSIFICATION
                //shows neighbourhood improvement status
                )
            .addTo(map); //Adds the popup to the map
    });
};

const table = document.getElementById("results-table");
const tableBody = table.querySelector("tbody");

let selected = 0;

map.on('click', 'suitability', (e) => {   
    selected_cell = e.features[0];
    selected = selected_cell.properties.S_Id;
    filteredParks = (parks.features.filter((park) => 
        park.properties.S_Id === selected
    ));
    filteredTtc = (ttcShelter.features.filter((ttc) => 
        ttc.properties.S_Id === selected
    ));
    filteredWayfinder = (wayfinder.features.filter((wayfind) => 
        wayfind.properties.S_Id === selected
    ));

    // Clear table rows
    tableBody.innerHTML = "";

    if (filteredParks == 0 && filteredTtc == 0 && filteredWayfinder == 0) {
        const row = tableBody.insertRow();
        row.insertCell().textContent = "There are no eligible locations in the selected area.";
        row.insertCell().textContent = " ";
        row.insertCell().textContent = " ";
        row.insertCell().textContent = " ";
        row.insertCell().textContent = " ";
    }

    // Add data rows 

    if (document.getElementById('parksCheck').checked) {
        filteredParks.forEach(parkFeature => {
            const park = parkFeature.properties; // Access the properties
            const row = tableBody.insertRow();
            row.insertCell().textContent = "Parks and recreation facility";
            row.insertCell().textContent = park.name;
            row.insertCell().textContent = park.ADDRESS7; // Use 'ADDRESS7'
            row.insertCell().textContent = park.CLASSIF9; // 
            row.insertCell().textContent = park.V;
        });
    }

    if (document.getElementById('ttcShelterCheck').checked) {

        filteredTtc.forEach(ttcFeature => {
            const ttc = ttcFeature.properties; // Access the properties
            const row = tableBody.insertRow();
            row.insertCell().textContent = "Transit shelter";
            row.insertCell().textContent = ttc.ID3;
            row.insertCell().textContent = ttc.ADDRESS4 + " " + ttc.ADDRESS5; // Use 'ADDRESS7'
            row.insertCell().textContent = ttc.CLASSIF9; // 
            row.insertCell().textContent = ttc.V;
        });
    }

    if (document.getElementById('wayfinderCheck').checked) {
        filteredWayfinder.forEach(wayfindFeature => {
            const wayfind = wayfindFeature.properties; // Access the properties
            const row = tableBody.insertRow();
            row.insertCell().textContent = "Wayfinding structure";
            row.insertCell().textContent = wayfind.ID3;
            row.insertCell().textContent = wayfind.ADDRESS4 + " "+ wayfind.ADDRESS5; // Use 'ADDRESS7'
            row.insertCell().textContent = wayfind.CLASSIF9; // 
            row.insertCell().textContent = wayfind.V;
        });
    }

    console.log(filteredParks)
    console.log(filteredTtc)
    console.log(filteredWayfinder)
});



/*--------------------------------------------------------------------
COLLAPSE MENU
- code collapses the menu of interctive features  to help users focus on the map
--------------------------------------------------------------------*/
var coll = document.getElementsByClassName("collapsible"); //"collapsible" the id set in the html to contain all the interactive features
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() { //when users click the button, it will expand
    this.classList.toggle("active-collapse"); 
    var content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none"; //hides the menu
    } else {
      content.style.display = "block"; //shows the menu
    }
  });
}
/*--------------------------------------------------------------------
FILTER CHECKBOXES
- Allows layers to be checked and unchecked for display
--------------------------------------------------------------------*/

// Parks and rec
document.getElementById('parksCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'parks',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

// bus shelters
document.getElementById('ttcShelterCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'ttcShelter',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

// Wayfinders and information pillars
document.getElementById('wayfinderCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'wayfinder',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

// Neighbourhood layer (all)
document.getElementById('neighbCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'neighb',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

// Neighbourhood layer (EN)
document.getElementById('neighbENCheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'neighbEN',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

// Neighbourhood layer (NIA)
document.getElementById('neighbNIACheck').addEventListener('change', (e) => {
    map.setLayoutProperty(
        'neighbNIA',
        'visibility',
        e.target.checked ? 'visible' : 'none'
    );
});

// Suitability legend
let legendCheck = document.getElementById('legendCheck');

legendCheck.addEventListener('click', () => {
    if (legendCheck.checked) {
        legendCheck.checked = true; //when checked (true), the legend block is visible
        suitabilityLegend.style.display = 'block';
    }
    else {
        suitabilityLegend.style.display = "none"; 
        legendCheck.checked = false; //when unchecked (false), the legend block is not displayed
    }
});


/*--------------------------------------------------------------------
RETURN BUTTON
- returns map to original extent
--------------------------------------------------------------------*/

//Event listener to return map view to full screen on button click
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({
        center: [-79.355, 43.715],
        essential: true,
        bearing: -17, // bearing in degrees
    });
    if (mq.matches){
        map.setZoom(10.3); //set map zoom level for desktop size
    } else {
        map.setZoom(8.5); //set map zoom level for mobile size
    };
});



