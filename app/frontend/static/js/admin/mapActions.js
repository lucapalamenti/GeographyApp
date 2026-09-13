import { toggleDropdown } from "./admin.js";
import APIClient from "../APIClient.js";

const mapActionsDropdownHeader = document.querySelector("#map-actions-dropdown HEADER");
const mapActionsDropdownBody = document.getElementById("map-actions-dropdown-body");

const mapId = document.getElementById("map-id");

const deleteMapTemplateBtn = document.getElementById("delete-map-template-btn");

// Handles opening & closing the Set Region Parent dropdown
mapActionsDropdownHeader.addEventListener("click", e => {
    toggleDropdown( mapActionsDropdownHeader, mapActionsDropdownBody );
});

// Does the Set Parent
deleteMapTemplateBtn.addEventListener("click", async e => {
    e.preventDefault();
    await action( APIClient.deleteMap );
});

/**
 * 
 * @param {(number) => Promise<>} method 
 */
async function action( method ) {
    return await method( mapId.value );
}