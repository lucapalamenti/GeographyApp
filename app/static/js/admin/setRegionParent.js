import { toggleDropdown } from "./admin.js";
import APIClient from "../APIClient.js";

const setParentDropdownHeader = document.querySelector("#set-parent-dropdown HEADER");
const setParentDropdownBody = document.getElementById("set-parent-dropdown-body");
const regionIdStart = document.getElementById("region-id-start");
const regionIdEnd = document.getElementById("region-id-end");
const parentRegionId = document.getElementById("parent-region-id");
const setParentButton = document.getElementById("set-parent-btn");

// Handles opening & closing the Set Region Parent dropdown
setParentDropdownHeader.addEventListener("click", e => {
    toggleDropdown( setParentDropdownHeader, setParentDropdownBody );
});

// Submits the Set Region Parent form
setParentButton.addEventListener("click", async e => {
    e.preventDefault();
    const start = Number( regionIdStart.value );
    const end = Number( regionIdEnd.value );
    const region_parent_id = Number( parentRegionId.value );
    await APIClient.setRegionParentId_range( start, end, region_parent_id );
});