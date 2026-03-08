import { navBar } from "./documentElements.js";

window.onload = () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Admin Panel";
    navBar.appendChild( pageName );
}