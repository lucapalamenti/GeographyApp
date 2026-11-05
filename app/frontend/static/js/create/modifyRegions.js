import { stateButtonsPanel, modificationButtonsPanel, selectRegionsBtn, moveRegionsBtn, setRegionTypeBtn } from "./documentElements-create.js";

let selecting = false;
let setting = false;
let selectedRegions = [];

modificationButtonsPanel.addEventListener('click', e => {
    if ( e.target.tagName === "BUTTON" ) {
        for ( const button of modificationButtonsPanel.querySelectorAll('BUTTON') ) {
            button.classList.remove( "selected" );
        }
        e.target.classList.add("selected");
    }
});

selectRegionsBtn.addEventListener('click', e => {
    selecting = true;
    setting = false;
    stateButtonsPanel.style.visibility = "hidden";
});

moveRegionsBtn.addEventListener('click', e => {
    selecting = false;
    setting = false;
    stateButtonsPanel.style.visibility = "hidden";
});

setRegionTypeBtn.addEventListener('click', e => {
    selecting = false;
    setting = true;
    stateButtonsPanel.style.visibility = "visible";
});