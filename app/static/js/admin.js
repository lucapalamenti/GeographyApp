import APIClient from "./APIClient.js";
import { navBar } from "./documentElements.js";

window.onload = () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Admin Panel";
    navBar.appendChild( pageName );
}

const uploadFile = document.getElementById("upload-file-form");
uploadFile.addEventListener("submit", async e => {
    e.preventDefault();
    const response = await APIClient.uploadFile( e.target );
    console.log( response.status );
});