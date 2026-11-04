import { modificationButtonsPanel, selectRegionsBtn, moveRegionsBtn } from "./documentElements-create.js";

let selecting = false;
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
});

moveRegionsBtn.addEventListener('click', e => {
    selecting = false;
});