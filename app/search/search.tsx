import { useState, useEffect } from "react";
import { AdvancedMarker, APIProvider, Map, Pin } from '@vis.gl/react-google-maps';
import type { MapCameraChangedEvent } from '@vis.gl/react-google-maps';
import { Circle } from "../components/circle";


export function Search() {
  const [query, setQuery] = useState("");
  const [distance, setDistance] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [isMapReady, setIsMapReady] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const defaultAddress = import.meta.env.VITE_DEFAULT_ADDRESS || '';
  const mapId = import.meta.env.VITE_MAP_ID || '';
  const coreApiUrl = import.meta.env.VITE_CORE_API_URL || '';

  type MyLocation = { key: string, location: google.maps.LatLngLiteral }

  useEffect(() => {
    setShowAddressDialog(true);
    // Get the last used address from localStorage, or use defaultAddress if none exists
    const lastUsedAddress = localStorage.getItem('lastUsedAddress') || defaultAddress;
    setAddressInput(lastUsedAddress);
  }, []);

  const handleAddressSubmit = () => {
    if (addressInput.trim()) {
      const url = `${coreApiUrl}/getLatLngByAddress?address=${addressInput.trim().replace(/\s+/g, '+')}`;
      console.log(url);
      fetch(url)
        .then(response => response.json())
        .then(data => {
          setLocation({ 
            lat: data.lat, 
            lng: data.lng 
          });
          setMapCenter({
            lat: data.lat,
            lng: data.lng
          });
          setShowAddressDialog(false);
          setIsMapReady(true);
          // Save the new address to localStorage
          localStorage.setItem('lastUsedAddress', addressInput.trim());
        })
        .catch(error => {
          console.error('Error fetching location:', error);
        });
    }
  };

  const handleSearch = () => {
    setIsLoading(true);
    // TODO: Implement search functionality
    console.log(`Searching for ${query} within ${distance}km`);
  };  

  const handleMapsApiLoad = () => {
    console.log('Maps API has loaded');
    // Only initialize map if we have a location
    if (isMapReady) {
      setMapCenter(location);
    }
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
      {showAddressDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Enter Your Location</h2>
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter your address"
              className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800 mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddressSubmit();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddressDialog(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddressSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Set Location
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
        <div className="max-w-[500px] w-full space-y-6 px-4">
          <div className="fixed top-0 left-0 right-0 p-4 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-200">Location:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{addressInput || "Unset"}</span>
            </div>
            <button
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => setShowAddressDialog(true)}
            >
              Change
            </button>
          </div>
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
                  {isMapReady && <MyLocationMarker myLocation={{ key: 'Home', location: location }} />}
                </Map>
            </APIProvider>
          </div>
        </div>
      </div>
    </main>
  );
}
