# Mobile app ui mock 

# General rules
Colour palette:
* #ff9e45 orange
* #e0dfdd gray
* #96bbd6 light blue
* #8191a1 dark gray
* #455666 darkest gray blueish

Footer: Houses these tabs: Home page (House icon), Scroll (sparkle icon), Calendar (Calendar icon), Network (People icon), Courses (Graduation hat icon)

## Pages
### Homepage
Header: left side has text that writes "Home", right side has user profile picture

Content: the content is divided in three rows, first one is "Conitnue with...", which will house ongoing courses that are yet to be finished. Second row is "Most Popular", which houses the most popular/highest rated courses. THe third row is "Recommended for you"
Each row houses cards that scroll horizontally, Card example is shown in @card.jpg

### Scroll page
Header: transparent, right side has user profile picture with drop shadow

Content: TikTok type scrolling, where a larger card, containing more information to show about the course. Content relevant: Course name, Country Flag, Country, Subject (history, art, philosophy...), Course image and a short description. Design idea: @scrollcard.png

Scrolling left on the tab/reel tells "recommend less like this", swipping right opens the details to the course. Scrolling down goes to the next reel

### Calendar/Events
Header: left side has text that writes "Events", right side has user profile picture

Content: From top to bottom: Location: my location/location select, Calendar, List of events on selected day.

List of events example: @events.jpg

### Network
Header: left side has text that writes "Network" right side has user profile picture

From Top to bottom:
switch button select from Network/Leaderboards

My friends:
label for this field has far left written "my friends" far right "search"
which has a horizontal scroll that has profile pictures and names of friends, far left one is "Find friends" button,

My feed:
Card that shows friends most recent complete courses

Weekly challenge:
Card that shows weekly challenge progress
example: "Complete 3 italy courses, get free pizza"

Suggested friends:
cards with suggested friends, horizontal scroll, limit to 10


### Courses
courses is a complicated topic that will be revised in more detail later, for now we need basic mock/look

Header: left side has text that writes "Courses" right side has user profile picture
From Top to bottom:
switch button select from Map/List
List has button select from Countries/Fields (as defined before, subjects)

Map of the world, that uses a customizable color scheme and support for custom waypoints and pins which have icons/images support, once you click on a country it loads its waypoints, grouped up if there are many, click a group then zooms into the group, evnetually getting to singled out waypoints, which when clicked refer to the related courses, waypoints are yet to be decided if they are going to be town/zip code/etc based, for now make it town based. By clicking a waypoint, for example Zagreb, you are shown a list of all courses related to that town/place