import createUtil from "./createUtil.js";

import { showOutline, setRegionTypePanel, mainButtons, resetSelectionBtn, mapOutline, svg, selectedList } from "./documentElements-create.js";
import { zoom } from "../mapManipulations.js";
import { capitalizeFirst, idToInput, removeClassAll } from "../util/util.js";

let dragging = false;

mainButtons.addEventListener('click', e => {
    if ( e.target.tagName === "BUTTON" ) {
        updateBtnSelection( e.target );
    }
});

resetSelectionBtn.onclick = () => { deselectAll(); };

// Handle user selecting a new region type selector
setRegionTypePanel.addEventListener('click', e => {
    if ( e.target.tagName === "BUTTON" ) {
        const paths = svg.querySelectorAll('PATH.selected');
        if ( paths.length > 0 ) {
            for ( const path of paths ) {
                path.classList.remove( ...globalThis.regionTypes );
                path.classList.add( e.target.id.substring( 0, e.target.id.length - 4 ) );
            }
            createUtil.updateOutline();
            updateSelectionList();
            deselectAll();
        }
    }
});



svg.addEventListener('mousedown', mouse => {
    dragging = true;
    switch ( mouse.button ) {
        case 0:
            mouse.target.classList.toggle("selected");
            break;
        case 2:
            zoom( mouse, svg );
            break;
    }
});

svg.addEventListener('contextmenu', e => { e.preventDefault(); });

document.addEventListener('mouseup', e => {
    if ( dragging ) {
        dragging = false;
        if ( createUtil.getCenteredRegions().length > 0 ) {
            updateSelectionList();
            if ( showOutline.checked ) {
                createUtil.updateOutline();
                mapOutline.style.display = "block";
            }
        }
    }
});

/**
 * Reset selected regions list and add all currently selected regions
 */
function updateSelectionList() {
    selectedList.innerHTML = "";
    selectedList.style.display = "flex";
    for ( const type of globalThis.regionTypes.filter( t => t !== "invisible" ) ) {
        const sort = {};
        const regions = svg.querySelectorAll(`PATH.${type}`);
        if ( regions.length ) {
            // Create type header
            const h3 = document.createElement('H3');
            h3.textContent = capitalizeFirst( type );
            selectedList.appendChild(h3);
            // Add regions to its parent's list
            regions.forEach( pathElement => {
                let parentGroupId = pathElement.parentElement.parentElement.id;
                // If this parent doesnt yet have any selected regions, initialize its array
                sort[parentGroupId] = sort[parentGroupId] ? sort[parentGroupId].concat( pathElement.id ) : [pathElement.id];
            });
            // Iterate through selected regions and desplay them
            Object.entries( sort ).forEach( ([parentName, regionNames]) => {
                // Create header
                const h5 = document.createElement('H5');
                h5.textContent = `${idToInput( parentName )} (${regionNames.length})`;
                selectedList.appendChild( h5 );
                // Create div list section
                const div = document.createElement('DIV');
                div.classList.add("list-1");
                selectedList.appendChild( div );
                // Add each selected region to the list
                for ( const name of regionNames ) {
                    const p = document.createElement('P');
                    p.textContent = idToInput( name );
                    div.appendChild( p );
                };
            });
        }
    }
    
    // If no regions are selected, hide container
    if ( selectedList.innerHTML === "" ) selectedList.style.display = "none";
}

/**
 * Handles updating which modification button is selected
 * @param {HTMLButtonElement} btn
 */
function updateBtnSelection( btn ) {
    if ( btn === resetSelectionBtn ) return;
    const selected = mainButtons.querySelector('.selected');
    if ( selected ) selected.classList.remove("selected");
    btn.classList.add("selected");
    globalThis.option = btn.value;
    setRegionTypePanel.style.visibility = "hidden";
    switch ( btn.value ) {
        case "moving":
            break;
        case "setting":
            setRegionTypePanel.style.visibility = "visible";
            break;
        default:
            break;
    }
}

function addRegionEventListeners() {
    for ( const path of svg.querySelectorAll('PATH') ) {
        path.addEventListener('mouseover', mouse => {
            if ( mouse.button === 0 && dragging ) {
                mouse.target.classList.add("selected");
            }
        });
    }
}

function deselectAll() {
    removeClassAll( "selected", svg );
}

export default {
    addRegionEventListeners,
    updateBtnSelection
}