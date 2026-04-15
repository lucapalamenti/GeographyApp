import APIClient from "./APIClient.js";
import { navBar } from "./documentElements.js";

window.onload = () => {
    const pageName = document.createElement("P");
    pageName.textContent = "Admin Panel";
    navBar.appendChild( pageName );
}

const uploadThumbnail = document.getElementById("upload-file-form");
const fileStream = document.getElementById("file-stream");

uploadThumbnail.addEventListener("change", e => {
    const file = e.target.files[0];
    if ( file ) {
        const reader = new FileReader();
        reader.onload = function( event ) {
            try {
                const json = JSON.parse( event.target.result );
                fileStream.innerHTML = JSON.stringify( json["features"][0]["properties"], null, 2 );
            } catch ( err ) {
                console.error( "Invalid JSON file!", err );
            }
        };
        reader.readAsText( file );
    }
});

uploadThumbnail.addEventListener("submit", async e => {
    e.preventDefault();
    await APIClient.uploadFile( e.target ).then( async res => {
        console.log( await res );
    });
    // console.log( (await response) );
});
