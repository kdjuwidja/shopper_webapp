import { useState } from "react";
import { AdvancedMarker, APIProvider, Map, Pin } from '@vis.gl/react-google-maps';
import type { MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { Circle } from "../components/circle";


export function Search() {
  const [query, setQuery] = useState("");
  const [distance, setDistance] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const defaultAddress = import.meta.env.VITE_DEFAULT_ADDRESS || '';
  const mapId = import.meta.env.VITE_MAP_ID || '';
  const coreApiUrl = import.meta.env.VITE_CORE_API_URL || '';

  type MyLocation = { key: string, location: google.maps.LatLngLiteral }

  const handleSearch = () => {
    setIsLoading(true);
    // TODO: Implement search functionality
    console.log(`Searching for ${query} within ${distance}km`);
  };  

  const initializeMap = () => { 
    // Fetch the default location using the default address
    const url = `${coreApiUrl}/getLatLngByAddress?address=${defaultAddress}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        //set both the location of the user and the cetner of the map to the location of the default address
        setLocation({ 
          lat: data.lat, 
          lng: data.lng 
        });
        setMapCenter({
          lat: data.lat,
          lng: data.lng
        });
      })
      .catch(error => {
        console.error('Error fetching default location:', error);
      });
  };

  const handleMapsApiLoad = () => {
    console.log('Maps API has loaded');
    initializeMap();    
  };

  const MyLocationMarker = (props: {myLocation: MyLocation}) => {
    return (
      <>
        <Circle
          radius={distance * 1000}
          center={props.myLocation.location}
          strokeColor={'#0c4cb3'}
          strokeOpacity={1}
          strokeWeight={3}
          fillColor={'#3b82f6'}
          fillOpacity={0.3}
        />
        <AdvancedMarker
          key={props.myLocation.key}
          position={props.myLocation.location}>
            <Pin background={'#FBBC04'} glyphColor={'#000'} borderColor={'#000'} />
        </AdvancedMarker>
      </>
    )
  }

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
        <div className="max-w-[500px] w-full space-y-6 px-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-700 dark:text-gray-200">I want to buy</span>          
          </div>
          <div className="flex items-center gap-3">
            <textarea
                placeholder="Enter product names, separated by commas"
                className="flex-1 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={3}
              />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-700 dark:text-gray-200">within</span>
            <input
              type="number"
              value={distance}
              min={1}
              className="w-20 rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
              onChange={(e) => {
                const newDistance = Number(e.target.value);
                setDistance(newDistance);
              }}
            />
            <span className="text-gray-700 dark:text-gray-200">km</span>
            <br />
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
              onClick={handleSearch}
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Find products"}
            </button>
          </div>
          <div className="fixed bottom-0 left-0 right-0 h-[60vh]">
            <APIProvider apiKey={apiKey} onLoad={handleMapsApiLoad}>
              <Map
                defaultZoom={13}
                defaultCenter={mapCenter}
                center={mapCenter}
                mapId={mapId}
                onCameraChanged={(ev: MapCameraChangedEvent) => {
                  setMapCenter(ev.detail.center);
                }}>
                  <MyLocationMarker myLocation={{ key: 'Home', location: location }} />
                </Map>
            </APIProvider>
          </div>
        </div>
      </div>
    </main>
  );
}
