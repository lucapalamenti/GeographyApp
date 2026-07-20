import { toggleDropdown } from "./admin.js";
import APIClient from "../APIClient.js";

const genFilesDropdownHeader = document.querySelector("#generate-files-dropdown HEADER");
const genFilesDropdownBody = document.getElementById("generate-files-dropdown-body");

const genFilesAllDataBtn = document.getElementById("generate-files-all-btn");

// Handles opening & closing the geojson file upload dropdown
genFilesDropdownHeader.addEventListener("click", e => {
    toggleDropdown( genFilesDropdownHeader, genFilesDropdownBody );
});

genFilesAllDataBtn.addEventListener("click", e => {
    e.preventDefault();
});