import APIClient from "./APIClient.js";
import { navBar } from "./documentElements.js";

window.onload = () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Admin Panel";
    navBar.appendChild( pageName );
}

const geojsonDropdownHeader = document.querySelector("#geojson-dropdown HEADER");
const geojsonDropdownBody = document.getElementById("geojson-dropdown-body");
const geojsonArrowSVG = document.querySelector("#geojson-dropdown SVG");
const geojsonForm = document.getElementById("geojson-form");
const geojsonFileInput = document.getElementById("geojson-file-input");
const geojsonPreview = document.getElementById("geojson-preview");

// Handles opening & closing the geojson file upload dropdown
geojsonDropdownHeader.addEventListener("click", e => {
    toggleDropdown( geojsonDropdownHeader, geojsonArrowSVG, geojsonDropdownBody );
});

// When a geojson file is added
geojsonFileInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if ( file ) {
        const reader = new FileReader();
        reader.onload = ( event ) => {
            try {
                const json = JSON.parse( event.target.result );
                geojsonPreview.innerHTML = JSON.stringify( json["features"][0]["properties"], null, 2 );
            } catch ( err ) {
                console.error( "Invalid JSON file!", err );
            }
        };
        reader.readAsText( file );
    }
});

geojsonForm.addEventListener("submit", async e => {
    e.preventDefault();
    await APIClient.uploadFile_geojson( e.target ).then( async res => {
        console.log( await res.json() );
    });
    // console.log( (await response) );
});

const kmlDropdownHeader = document.querySelector("#kml-dropdown HEADER");
const kmlDropdownBody = document.getElementById("kml-dropdown-body");
const kmlArrowSVG = document.querySelector("#kml-dropdown SVG");
const kmlForm = document.getElementById("kml-form");
const kmlFileInput = document.getElementById("kml-file-input");
const kmlPreview = document.getElementById("kml-preview");

// Handles opening & closing the kml file upload dropdown
kmlDropdownHeader.addEventListener("click", e => {
    toggleDropdown( kmlDropdownHeader, kmlArrowSVG, kmlDropdownBody );
});

// When a kml file is added
kmlFileInput.addEventListener("change", async e => {
    const file = e.target.files[0];
    if ( file ) {
        const reader = new FileReader();
        reader.onload = async ( event ) => {
            try {
                const contents = JSON.stringify( event.target.result );
                const kmlFeatureCollection = await APIClient.kml2geojson( contents );
                // const dom = new DOMParser().parseFromString( event.target.result, 'text/xml' );
                // const geojsonFeatureCollection = kml(dom);
                // kmlPreview.innerHTML = JSON.stringify( geojsonFeatureCollection["features"][0]["properties"], null, 2 );
            } catch ( err ) {
                console.error( "Invalid JSON file!", err );
            }
        };
        reader.readAsText( file );
    }
});

kmlForm.addEventListener("submit", async e => {
    e.preventDefault();
    await APIClient.uploadFile_kml( e.target ).then( async res => {
        console.log( await res.json() );
    });
    // console.log( (await response) );
});

/**
 * 
 * @param {HTMLElement} header 
 * @param {HTMLElement} svg 
 * @param {HTMLElement} body 
 */
function toggleDropdown( header, svg, body ) {
    header.classList.toggle( "dropdown-open" )
    svg.classList.toggle( "rotate-90" );
    body.toggleAttribute( "hidden" );
}