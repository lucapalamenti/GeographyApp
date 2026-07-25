import { toggleDropdown } from "./admin.js";
import APIClient from "../APIClient.js";

const regionActionsDropdownHeader = document.querySelector("#region-actions-dropdown HEADER");
const regionActionsDropdownBody = document.getElementById("region-actions-dropdown-body");

const regionIdStart = document.getElementById("region-id-start");
const regionIdEnd = document.getElementById("region-id-end");
const parentRegionId = document.getElementById("parent-region-id");

const setParentButton = document.getElementById("set-parent-btn");
const deleteRegionButton = document.getElementById("delete-region-btn");

// Handles opening & closing the Set Region Parent dropdown
regionActionsDropdownHeader.addEventListener("click", e => {
    toggleDropdown( regionActionsDropdownHeader, regionActionsDropdownBody );
});

// Does the Set Parent
setParentButton.addEventListener("click", async e => {
    e.preventDefault();
    const start = regionIdStart.value;
    const end = regionIdEnd.value;
    const region_parent_id = parentRegionId.value;
    await APIClient.setRegionParentId_range( start, end, region_parent_id );
});

// Submits the Set Region Parent form
deleteRegionButton.addEventListener("click", async e => {
    e.preventDefault();
    const start = regionIdStart.value;
    const end = regionIdEnd.value ? regionIdEnd.value : undefined;
    await APIClient.deleteRegion_range( start, end );
});

function action() {
    
}