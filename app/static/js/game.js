import APIClient from './APIClient.js';
import format from './format.js';
import { gamemodeMap } from './gamemodes.js';

const query = window.location.search;
let parameters = new URLSearchParams( query );
const map_id = Number( parameters.get('mapId') );

const svg = document.querySelector('SVG');
const selectButton = document.getElementById('btn-select');
const cancelButton = document.getElementById('btn-cancel');
const gamemodePanel = document.getElementById('gamemodePanel');
const covering = document.getElementById('covering');

// Update header bar
await APIClient.getMapById( map_id ).then( returnedMap => {
    const navBar = document.getElementById('nav-bar');
    const nextLink = document.createElement('A');
    nextLink.href = '/game?mapId=' + map_id;
    nextLink.textContent = returnedMap.map_name;
    navBar.appendChild( nextLink );
    const arrow = document.createElement('STRONG');
    arrow.textContent = '>';
    navBar.appendChild( arrow );
}).catch( err => {
    console.error( err );
});

// Will store the names of all shapes for the current map
const shapeNames = new Set();

// Load shapes for the current map onto the screen
await APIClient.getShapesByMapId( map_id ).then( returnedShapes => {
    const polygonTemplate = document.getElementById('polygon-template').content;
    returnedShapes.forEach( shape => {
        const group = polygonTemplate.cloneNode( true ).querySelector('G');
        // Remove empty polygon element
        group.innerHTML = "";
        group.setAttribute('id', shape.shape_name.split(' ').join('_'));
        // Iterate through multipolygon
        shape.shape_points.coordinates.forEach( polygon => {
            const p = polygonTemplate.cloneNode( true ).querySelector('POLYGON');
            const points = polygon[0];
            // Convert points[i] from [0, 0] to "0,0"
            for ( let i = 0; i < points.length; i++ ) {
                points[i] = points[i].join(',');
            }
            p.setAttribute('points', points.join(' ') );
            group.appendChild( p );
        });
        svg.appendChild( group );
        shapeNames.add( shape.shape_name );
    });
}).catch( err => {
    console.error( err );
});

window.addEventListener('scroll', () => {
    // Update background covering
    covering.style.height = `calc(100% + ${window.scrollY}px)`;
    covering.style.top = `${document.querySelector('HEADER').offsetHeight - window.scrollY}px`;
});

let currentGamemode = null;

selectButton.addEventListener('click', () => {
    const gmInput = document.querySelector('input[name="gamemode"]:checked');
    // If a gamemode radio button has been selected
    if ( gmInput ) {
        currentGamemode = gmInput.value;
        covering.style.visibility = "hidden";
        gamemodePanel.style.visibility = "hidden";
        gamemodePanel.style.cursor = "default";
        gamemodeMap[currentGamemode]( Array.from( shapeNames ) );
    }
});

cancelButton.addEventListener('click', () => {
    // If no gamemode is selected, go back to previous page
    if ( !currentGamemode ) {
        document.location = '../';
    }
});