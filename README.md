# GeographyApp

### To Add
- disabled regions should be listed below when creating a map
- add a tooltip for the mapRegion_states buttons
- Add sounds on input
- When finishing a game, display regions that you struggled with under the "game finished" box
- Add "Borders" table to database that tells you what regions a region borders
- Incorrect inputs shown at end for type and noMap gamemodes
- "review map" button after finishing a game
- No map gamemode has no end
- Something to do with having to scroll up and down when deleting multiple maps at bottom
- Make the type gamemode list toggleable
- Add to database alternative spellings
- Drag map to move it
- Labels show off screen when clicking in Learn gamemode
- Add main menu button
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

### Frontend changes
- Input box flashes a color depending on correctness of input
- In type gamemode, if region is typed multiple times, it will subtly flash that region
- Backup background image if the first one cant be found
- Hit ESC to cancel delete map
- rework how user interaction works for creating a map
- New mapRegion types:
    - "disabled": grey, unclickable regions. These regions will ALWAYS be visible when playing
    - "herring": clickable regions, but are not included as answers
    - "outside": grey, unclickable regions. Do not have to be visible when playing
- Display maps in center of screen instead of top left
- Type gamemode has the no map list
- Sort maps on home screen
- Delete ALL custom maps button
- All gamemodes have an "end game" button
- "review map" button after finishing a game

### Backend/Technical changes
- changed mapRegion_state to mapRegion_type
- Changed storage of map_primary_color from a string 'R,G,B' to 3 separate integer values
- Admin can choose to print query statements to a file in the backend (really just for creating new default maps)
- Reworked svg element IDs. Regions with the same parent are now nested in a parent G element. Parent G elements are further split into groups of regions withthe same mapRegion_type

### Bugs Fixed
- When hovering over a county in create mode only that polygon is shaded

## Things I need to remember

### Caldwell
1. Kentucky
2. Missouri
3. North Carolina
4. Texas
5. Louisiana

### Crawford
1. Arkansas
2. Georgia
3. Illinois
4. Iowa
5. kansas
6. Michigan
7. Missouri
9. Ohio
10. Pennsylvania
11. Wisconsin