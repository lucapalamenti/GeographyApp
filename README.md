# GeographyApp

## To Add
- use <path> elements instead of <polygon>
- Add "Borders" table to database that tells you what regions a region borders
- Something to do with having to scroll up and down when deleting multiple maps at bottom
- Add to database alternative spellings
- Drag map to move it
- Red circle around highlighted area after 5 seconds if the user cant find whats highlighted
- Labels show off screen when clicking in Learn gamemode
- Settings to add:
    - Toggle "auto enter" after every keystroke
    - Toggle input flashing
    - Change level of detail in outlines (requires multiple datasets)
    - Toggle allowing alternate spellings
    - Disabled sounds
    - Multiple color schemes
- Gamemodes:
    - add "modifiers" to some gamemodes. ex: 
        - "type":
            - "select all" so you dont have to specify parent region
            - remove parent from dropdown when you have typed all its child regions
            - if you type the wrong answer flash the region that you typed
        - "type (hard)":
            - Only 1 guess per prompt instead of 3
            - Show first letter after first incorrect answer
            - timed mode (~5 seconds per prompt)
            - skip to next: press space or enter to go to next prompt (just say the name out loud)
    - "Borders": Name all surrounding regions
    - "Outline": Name region based on outline and surrounding regions
    - "Outline (Hard)": Name region based only on outline
    - travle but countyle
    - "Drag & Drop": drag and drop county outline onto a blank map
- Interactive map (type a name and all counties with name show up), option for similar sounding names with different spellings
- Ability to edit existing maps to add/remove regions
- Select a thumbnail for a created map
- Add an admin page for things like editing non custom maps
- When using a map with different region types as a template, all regions are displayed the same as "enabled" regions, and "outside" regions are not displayed in the viewport
- create session storage
    - sorting & filtering maps selection
- Other Physical features like rivers & lakes
- Throttling & Debouncing
- If enter is pressed with no parent selected, flash the parent dropdown
- Ability to take a new .kml file from USCensusBureau and have it replace existing data
    - Consider using Python for this
- "Outside" regions look like "disabled" regions when reviewing map
- Add a timed leaderboard for all gamemodes
- duplicate "unknown" regions show up multiple times in no list gamemode
- account creation
- logging in/out capabilities
- admin users vs standard users
- standard users have limited number of custom maps
- save leaderboard scores to an account
- "see if you can beat the developer's time"
- polygon new hampshire is missing a point
- for type hard invisible since the outlines dont work well, bring the html G element to the bottom of the SVG so its outlines are layered on top
- sort by "creation date"
- ending game while region is still disapearing in click disapear gamemode, the region continues to fade slowly

- Unsure if I want to add
    - "mark as correct" option for type (hard) if you mistype
    - In click (disappear) gamemode, when you get a region that there are multiple of (meaning there are at least 2 parents) disable the regions with the same name that you've already clicked on
    - When taking more than 3 attempts in type (hard) gamemode, instead of just displaying the label is skipping it, make the user type the correct answer
    - Make the type gamemode list toggleable

# Changelog

## Ongoing

### Frontend
- Reworked region display mechanism
    - <polygon> SVG elements have been replaced with <path> elements
    - Multiple <polygon> elements can be represented as one <path> element
    - <path> elements can have holes while <polygon> elements cannot
- All region types will darken when hovered over. Using the css filter attribute instead of changing the color of every region type

### Backend/Technical

### Bug Fixes
- Region outlines in invisible outline gamemodes don't display properly, so they have been removed altogether
- List of map regions not printing in alphabetical order
- Gamemodes that prompt regions in order never select the region that's last alphabetically as the first prompt

## Beta 1.2.260121

### Frontend
- There are now sounds on input
- Show prompt number next to number correct tally in some gamemodes
- Instead of a zoom slider, right click multiple times to zoom further
- New Gamemodes:
    - Type (Invisible): Same as Type, but no outlines are given
    - Type (Hard) (Invisible): Same as Type (Hard), but no outlines are given
    - Type (Hard) (Invisibler): Same as Type (Hard) (Invisible), but the outlines disappear
- Default county maps now have surrounding "outside" regions

### Backend/Technical
- HTTP request payloads are now wrapped in a "Chunk" object before being send to the backend. If the payload is larger than 100kb then it is broken up and sent as multiple Chunks.
A Chunk contains:
    - a fragment of the payload
    - a payload ID so fragments from the same payload can find eachother in the backend
    - a chunk ID for its index within the group of fragments
Once all Chunks are sent, a Sentinel Chunk is sent to tell the backend how many Chunks it should've received for a given payload. The backend will then piece these fragments together to recreate the full payload.
- All API routes expecting a payload must use the new PayloadManager's Chunk middleware to interpret the incoming chunks
- Coordinate points now stored as POLYGON objects instead of MULTIPOLYGON objects to allow for polygon specific data like "is_enclave" and "enclave_of_region_id"

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

## Questions

- Is it good practice to have a single primary key for an SQL table?

- How is the max payload determined? Can I change it? Should I change it?

- When should I compress data being sent over HTTP requests? Compressing takes more time & doesn't allow you to send more data

- benefits to using typescript over javascript
- python over javscript for for api calls

- For an application that is intended to be mobile compatible, if the page needs to have significantly different html, does it make more sense to have a separate files like mainPC.html & mainMobile.html or all in 1 file

- in order to use SVG elements like <polygon> etc, i have to clone them from a template. is there a better way to do this?