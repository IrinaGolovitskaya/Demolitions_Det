# Residential Demolitions and Condition of Neighborhoods in Detroit, MI

Declining cities are facing the problems of vacancies and ultimately abandonment. Not having resources for reconstructions and repairs, cities are concentrated mostly on demolitions. The map explores how the amount of vacancies and planned demolitions changed over time, and who was most affected by that. 

The map is focused on vacant and demolished residential properties in Detroit (within the city limits).
It shows the dynamics of vacant houses and demolitions from 2013 till current time. 
As many American cities face the crisis of adequate housing supply and affordability of housing, it is important to examine the housing dynamics in different housing markets (the example of Detroit is the example of rapidly declining city).


## Data Sources

Census Blocks TIGER/Shaperfile obtained from [US Census](https://www.census.gov/geographies/mapping-files/2010/geo/tiger-line-file.html).
Since the latest changes in boundaries of Census Blocks were made in 2010, I didn't have to worry about inconsistencies. 

Housing Units Estimates obtained from [US Census](https://data.census.gov/map?g=050XX00US26163$1400000&tid=DECENNIALPL2020.P1&layer=VT_2020_140_00_PY_D1&mode=thematic&loc=42.3350,-82.9896,z10.4068). I used only total housing units, but these sets
have plenty of data that might be interesting in examining the dynamics of abandonment too.

The Neighborhoods' boundaries obtained from [The City of Detroit Open Data Portal](https://data.detroitmi.gov/datasets/neighborhoods/explore). There are many neighborhoods' boundaries, 
the overview of them you can see on the [Data Driven Detroit Portal](https://datadrivendetroit.org/neighborhood-portal/). 

## Working process

Color palette is created via [Coolors.co](https://coolors.co/) utilizing the photo from [“100 abandoned houses”](https://www.100abandonedhouses.com) project.

I am using Stadia.AlidadeSmooth as a basemap obtained from [Leaflet-providers](https://leaflet-extras.github.io/leaflet-providers/preview/) 