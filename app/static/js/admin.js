import APIClient from "./APIClient.js";
import { navBar } from "./documentElements.js";

window.onload = () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Admin Panel";
    navBar.appendChild( pageName );
}

const uploadThumbnail = document.getElementById("upload-file-form");
uploadThumbnail.addEventListener("submit", async e => {
    e.preventDefault();
    const response = await APIClient.uploadThumbnail( e.target );
});