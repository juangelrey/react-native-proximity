# Proximity App 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app), just for fun.

## Requirements

---

## Instructions

### 1. Initialize the Expo Project & Install Dependencies

### 2. Obtain Location Permissions & Current Location

```txt
ProximityApp/
├─ App.js
├─ package.json
├─ .gitignore
├─ app.json
├─ assets/
│   └─ (images, icons, etc.)
├─ components/
│   ├─ MapViewComponent.js
│   └─ PlaceDetailModal.js
├─ utils/
│   └─ placesApi.js
└─ config/
    └─ apiKeys.js
```

### 3. Show a Map Centered on the User

### 4. Integrate an External Places API (Google Places)

### 5. Display Place Markers on the Map

### 6. Implement a Detail Modal for Tapped Markers

### Final Touches & Expansion Ideas

Now that the core functionality is in place, here are a few suggestions for taking this exercise further:

#### Let the User Choose Place Types

- Add a dropdown or segmented control at the top (e.g. “Cafés,” “Gas Stations,” “Restaurants,” “Parks”).

- Store a piece of state like selectedType; pass that into getNearbyPlaces({ …, type: selectedType }).
- Trigger a refetch when the type changes.

#### Pagination (“Load More”)

- Google’s Nearby Search can return up to 20 results per page and gives you a next_page_token.
- Implement logic in placesApi.js to accept pagetoken and fetch more results when the user presses “Load More” or scrolls near the edge of the map.

#### Improved Styling & Clustering

- Use custom marker icons (e.g. a coffee cup icon for cafes).
- Install react-native-maps-super-cluster (or similar) to cluster markers when zoomed out.
- Style the modal with images (if place.photos is returned from the API).

#### Error States & Empty States

- If no places are found within the given radius, show a message like “No cafés found within 1.5 km.”
- If the user denies location permission, guide them to enable it in settings.

#### Caching & Offline Behavior

- Consider caching the last‐fetched results so if the user temporarily loses internet, they still see pins.
- Use AsyncStorage or another local DB (e.g., WatermelonDB) to persist.

#### Advanced Map Features

- Draw a circle around the user’s location indicating search radius.
- Show a polyline from the user to a selected place.
- Animate the map to focus on a new region when the user picks a different type.

```

```
