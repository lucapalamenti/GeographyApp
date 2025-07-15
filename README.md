# GeographyApp

## Recent Changes

### To Add
- New region states:
    - herring: clickable but wont show up as an answer
    - outside: not clickable and shows up a different color than disabled
- map_id should auto increment
- disabled regions should be listed below when creating a map
- Add sounds on input
- When finishing a game, display regions that you struggled with
- Add "Borders" table to database that tells you what regions a region borders
- Incorrect inputs shown at end for type and noMap gamemodes
- No map gamemode has no end
- Something to do with having to scroll up and down when deleting multiple maps at bottom
- Make the type gamemode list toggleable
- Add to database alternative spellings
- Drag map to move it
- Labels show off screen when clicking in Learn gamemode
- Add main menu button
- When creating map, you should be able to make sure certain diabled regions are always on screen
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

### Added
- Input box flashes a color depending on correctness of input
- Backup background image if the first one cant be found
- Hit ESC to cancel delete map
- rework how user interaction works for creating a map
- Add "region_type" attribute to mapRegion
- Ability to add "disabled/greyed out" regions to a map
- Display maps in center of screen instead of top left
- Changed storage of map_primary_color from a string 'R,G,B' to 3 separate integer values
- Type gamemode has the no map list
- Sort maps on home screen

- Admin can choose to print query statements to a file in the backend (really just for creating new default maps)

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