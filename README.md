# GeographyApp

## To Add
- Add "Borders" table to database that tells you what regions a region borders
- Something to do with having to scroll up and down when deleting multiple maps at bottom
- Make the type gamemode list toggleable
- Add to database alternative spellings
- Drag map to move it
- Labels show off screen when clicking in Learn gamemode
- Settings to add:
    - Toggle "auto enter" after every keystroke
    - Toggle input flashing
    - Change level of detail in outlines (requires multiple datasets)
    - Toggle allowing alternate spellings
    - Disabled sounds
- Show number of Correct regions separate from the counter in the top right (change that to something like "question number")
- When taking more than 3 attempts in type (hard) gamemode, instead of just displaying the label is skipping it, make the user type the correct answer
- Gamemodes:
    - "Borders": Name all surrounding regions
    - "Outline": Name region based on outline and surrounding regions
    - "Outline (Hard)": Name region based only on outline
    - "undisabled": only available on maps that have disabled regions, where all disabled regions are switched to the "herring" state
- Change Zoom levels
- In click (disappear) gamemode, when you get a region that there are multiple of (meaning there are at least 2 parents) disable the regions with the same name that you've already clicked on
- Interactive map (type a name and all counties with name show up), option for similar sounding names with different spellings
- Ability to edit existing maps to add/remove regions
- "mark as correct" option for type (hard) if you mistype
- Select a thumbnail for a created map
- Add an admin page for things like editing non custom maps
- Multiple color schemes
- When using a map with different region types as a template, all regions are displayed the same as "enabeld" regions, and "outside" regions are not displayed in the viewport
- right click multiple times to zoom further
- create session storage for sorting & filtering maps selection

# Changelog

## Ongoing

### Frontend
- There are now sounds on input

### Backend/Technical

### Bug Fixes

## Beta 1.1.250825

### Frontend
- Input box flashes a color depending on correctness of input
- In type gamemode, if region is typed multiple times, it will subtly flash that region
- Backup background image if the first one cant be found
- Hit ESC to cancel delete map
- rework how user interaction works for creating a map
- New mapRegion types:
    - "disabled": grey, unclickable regions. These regions will ALWAYS be visible when playing
    - "herring": clickable regions, but are not included as prompts
    - "outside": grey, unclickable regions. Do not have to be visible when playing
- Maps are centered instead of top-left adjusted
- Type gamemode has the no map list
- Maps on home screen can be filtered and sorted
- Delete ALL custom maps button
- All gamemodes have an "end game" button
- "Review map" button after finishing a game allows you see final state of the map and list
- When creating a map, a rectangle outline of what will be included in the viewport can be toggled using the "Show Outline" checkbox
- Regions of all selected types are listed when creating a map
- "Creating Map" screen appears when clicking the "create" map button. Stops user from interacting with screen during this time
- The select region type buttons now show a tooltip with their name
- Gamemodes that show the list after completion will now fill in the list with missed regions

### Backend/Technical
- changed mapRegion_state to mapRegion_type
- Changed storage of map_primary_color from a string 'R,G,B' to 3 separate integer values
- Admin can choose to print query statements to a file in the backend (really just for creating new default maps)
- Reworked svg element IDs. Regions with the same parent are now nested in a parent G element. Parent G elements are further split into groups of regions withthe same mapRegion_type

### Bug Fixes
- When hovering over a county in create mode only that polygon is shaded
- When dragging from one element into another (both within the same parent) in the learn gamemode, if the parent region is also the name of a region (ex: washington state and washington county) then the entire parent region gets highlighted
- List gamemodes display parent regions without regions of type "enabled" in list, even though they have no regions to type
- If game ends within 2 seconds of clicking a region, the region stays clickable when reviewing map