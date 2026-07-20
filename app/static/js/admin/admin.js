import { navBar } from "../documentElements.js";

window.onload = () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Admin Panel";
    navBar.appendChild( pageName );
}

/**
 * Handles opening & closing dropdown menus
 * @param {HTMLElement} header 
 * @param {HTMLElement} body 
 */
const toggleDropdown = ( header, body ) => {
    header.classList.toggle( "dropdown-open" );
    header.querySelector( "SVG" ).classList.toggle( "rotate-90" );
    body.toggleAttribute( "hidden" );
};

export {
    toggleDropdown
}