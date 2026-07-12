import APIClient from "./APIClient.js";
import { navBar } from "./documentElements.js";
import { FeatureCollection } from "./models/FeatureCollection.js"
import populateSVGfc from "./populateSVGfc.js";
import { zoom, unzoom } from "./mapManipulations.js";

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
const mapPreview = document.getElementById("map-preview");

const moveWestBtn = document.getElementById("move-west-btn");
const moveEastBtn = document.getElementById("move-east-btn");
const deleteBtn = document.getElementById("delete-btn");
const modificationButtons = [ moveWestBtn, moveEastBtn, deleteBtn ];

const map_name = document.getElementById("map_name");
const region_type = document.getElementById("region_type");
const region_name_key = document.getElementById("region_name_key");
const region_parent_name_key = document.getElementById("region_parent_name_key");

let selectedBtn;

/** @type {FeatureCollection} */
let featureCollection;

// Handles opening & closing the geojson file upload dropdown
fileDropdownHeader.addEventListener("click", e => {
    toggleDropdown( fileDropdownHeader, arrowSVG, dropdownBody );
});

// When a geojson file is added
fileInput.addEventListener("change", async e => {
    const file = e.target.files[0];
    if ( file ) {
        featureCollection = await APIClient.processMapfile( uploadForm ).then( async res => {
            const fc = new FeatureCollection( await res.json() );
            preview.innerHTML = JSON.stringify( fc.getProperties(), null, 2 );
            return fc;
        });
        populateSVGfc( featureCollection, mapPreview );
    }
});

mapPreview.addEventListener("click", e => {
    if ( e.target.tagName === "path" ) {
        let f = featureCollection.features[e.target.id];
        switch ( selectedBtn ) {
            case moveWestBtn:
                f.westify();
                break;
            case moveEastBtn:
                f.eastify();
                break;
            case deleteBtn:
                featureCollection.removeFeature( e.target.id );
                break;
        }
        populateSVGfc( featureCollection, mapPreview );
    }
});
mapPreview.addEventListener("contextmenu", e => {
    e.preventDefault();
    zoom( e, mapPreview );
});
mapPreview.addEventListener("keydown", key => {
    if ( key.key === "Escape" ) {
        unzoom( e, mapPreview );
    }
});

moveWestBtn.addEventListener("click", selectButton );
moveEastBtn.addEventListener("click", selectButton);
deleteBtn.addEventListener("click", selectButton);

function selectButton( e ) {
    const button = e.target;
    for ( const btn of modificationButtons ) {
        btn.classList.remove( "btn-selected" );
    }
    button.classList.add( "btn-selected" );
    selectedBtn = button;
}

uploadForm.addEventListener("submit", async e => {
    e.preventDefault();
    const data = {
        map_name : map_name.value,
        region_type : region_type.value,
        region_name_key : region_name_key.value,
        region_parent_name_key : region_parent_name_key.value,
        new_feature_collection : featureCollection
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