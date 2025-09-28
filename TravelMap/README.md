# Travel Map Web

[https://https://davidrrice.github.io/TravelMap/](https://https://davidrrice.github.io/TravelMap/)

An interactive webpage to visualize countries and U.S. states from simple text files.  
Upload one or more `.txt` lists of ISO-3 codes or country names (and optional U.S. states) and generate a customized world map.

## Features
- Multiple lists → each gets its own color (with overlaps hatched).
- Reorder lists and adjust colors interactively.
- Choose projection (Mercator or Robinson).
- Optionally zoom to selected countries or exclude outlying territories.
- Export the map as **SVG, PNG, or JPG**.
- Hover over the legend to highlight corresponding countries/states.

## How to use
1. Prepare `.txt` files with one ISO-3 code or country name per line.  
   Example:
   USA
   FRA
   JPN

2. Upload your files (e.g. `Visited.txt`, `Planned.txt`).  
3. Reorder or recolor in the control panel.  
4. Click **Render** to see your map.

## Credits
- World map data: [Natural Earth](https://www.naturalearthdata.com/).  
- U.S. states: [us-atlas](https://github.com/topojson/us-atlas).  
