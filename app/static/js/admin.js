import APIClient from "./APIClient.js";
import { navBar } from "./documentElements.js";
import { parse } from "./kml2geojson.js";

window.onload = () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Admin Panel";
    navBar.appendChild( pageName );
}

const fileDropdownHeader = document.querySelector("#file-dropdown HEADER");
const dropdownBody = document.getElementById("dropdown-body");
const arrowSVG = fileDropdownHeader.querySelector("SVG");
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input");
const preview = document.getElementById("preview");

const map_name = document.getElementById("map_name");
const region_type = document.getElementById("region_type");
const region_name_key = document.getElementById("region_name_key");
const region_parent_name_key = document.getElementById("region_parent_name_key");

// Handles opening & closing the geojson file upload dropdown
fileDropdownHeader.addEventListener("click", e => {
    toggleDropdown( fileDropdownHeader, arrowSVG, dropdownBody );
});

// When a geojson file is added
fileInput.addEventListener("change", async e => {
    const file = e.target.files[0];
    if ( file ) {

        const reader = new FileReader();
        reader.onload = () => {
            const fileString = reader.result;
            const parser = new DOMParser();
            const json = parse( parser.parseFromString( fileString, "text/xml" ) );
            console.log( json );
        };
        reader.readAsText(file);

        await APIClient.processMapfile( uploadForm ).then( async res => {
            const properties = await res.json();
            console.log( properties );
            
            // preview.innerHTML = JSON.stringify( properties, null, 2 );
        });
    }
});

uploadForm.addEventListener("submit", async e => {
    e.preventDefault();
    const data = {
        map_name : map_name.value,
        region_type : region_type.value,
        region_name_key : region_name_key.value,
        region_parent_name_key : region_parent_name_key.value
    }
    await APIClient.createTemplateMap( data ).then( async res => {
        console.log( res );
        
    });
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