import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const API = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}`;

const LocationMarker = ({ position, setPosition, onChange }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (onChange) onChange(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
};


const SetLocationMap = ({ userId, onLocationSaved, initialLocation, onChange, onAddressChange, pickerOnly }) => {
  const [position, setPosition] = useState(initialLocation || { lat: 40.7128, lng: -74.0060 }); // Default location
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('Fetching address...');
  const mapRef = useRef();
  const skipReverseGeocode = useRef(false);

  // Extract readable "Place, City, State" from a Nominatim search result display_name
  const formatAddressFromDisplayName = (display_name) => {
    const parts = display_name.split(',').map(p => p.trim()).filter(p => p && !/^\d+$/.test(p));
    // Take first 3 meaningful parts
    return parts.slice(0, 3).join(', ');
  };

  // Debounced autocomplete for search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 2 && showSuggestions) {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Kerala')}&limit=5`);
          const data = await res.json();
          setSuggestions(data || []);
        } catch (err) {
          console.error('Failed to fetch suggestions', err);
        }
      } else if (searchQuery.trim().length <= 2) {
        setSuggestions([]);
      }
    }, 800); // 800ms debounce to respect Nominatim limits

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, showSuggestions]);

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name || suggestion.display_name.split(',')[0]);
    setShowSuggestions(false);
    const newPos = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    // Immediately derive address from suggestion data — no reverse geocode needed
    const addr = formatAddressFromDisplayName(suggestion.display_name);
    skipReverseGeocode.current = true;
    setSelectedAddress(addr);
    if (onAddressChange) onAddressChange(addr);
    setPosition(newPos);
    if (onChange) onChange(newPos);
    if (mapRef.current) {
      mapRef.current.flyTo([newPos.lat, newPos.lng], 16, { duration: 1.5 });
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          if (mapRef.current) {
            mapRef.current.flyTo([newPos.lat, newPos.lng], 16, { duration: 1.5 });
          }
        },
        (err) => {
          console.warn("Geolocation permission denied or unavailable.", err);
          alert("Could not get your location. Please check your browser permissions.");
        }
      );
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Kerala')}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const newPos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        // Use address from search result immediately
        const addr = formatAddressFromDisplayName(data[0].display_name);
        skipReverseGeocode.current = true;
        setSelectedAddress(addr);
        if (onAddressChange) onAddressChange(addr);
        setPosition(newPos);
        if (onChange) onChange(newPos);
        setShowSuggestions(false);
        if (mapRef.current) {
          mapRef.current.flyTo([newPos.lat, newPos.lng], 16, { duration: 1.5 });
        }
      } else {
        setSearchError('Address not found. Please try another search.');
      }
    } catch (err) {
      console.error(err);
      setSearchError('Failed to search address.');
    } finally {
      setSearching(false);
    }
  };

  // Try to get current browser location on mount quietly, only if no initialLocation
  useEffect(() => {
    if (!initialLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          if (onChange) onChange(newPos);
          if (mapRef.current) {
            mapRef.current.flyTo([newPos.lat, newPos.lng], 16, { duration: 1.5 });
          }
        },
        () => {}
      );
    }
  }, [initialLocation]);

  // Reverse geocode whenever position changes (only for map clicks / locate me)
  useEffect(() => {
    if (!position) return;
    // Skip when address already resolved from suggestion/search result
    if (skipReverseGeocode.current) {
      skipReverseGeocode.current = false;
      return;
    }
    setSelectedAddress('Fetching address...');
    const { lat, lng } = position;
    const timeoutId = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&email=hello@lifelink.com`)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          let addr;
          if (data && data.address) {
            const a = data.address;
            // Build: "Place/Road, City, State" from structured fields
            const place = a.amenity || a.tourism || a.leisure || a.building ||
                          a.road || a.neighbourhood || a.suburb || '';
            const city  = a.city || a.town || a.village || a.county || '';
            const state = a.state || '';
            const structured = [place, city, state].filter(Boolean);
            if (structured.length > 0) {
              addr = structured.join(', ');
            } else if (data.display_name) {
              // Fallback: strip postcodes/country, take first 3 meaningful parts
              addr = data.display_name.split(',').map(p => p.trim())
                .filter(p => p && !/^\d+$/.test(p) && p !== 'India')
                .slice(0, 3).join(', ');
            } else {
              addr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }
          } else if (data && data.display_name) {
            addr = data.display_name.split(',').map(p => p.trim())
              .filter(p => p && !/^\d+$/.test(p) && p !== 'India')
              .slice(0, 3).join(', ');
          } else {
            addr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          }
          setSelectedAddress(addr);
          if (onAddressChange) onAddressChange(addr);
        })
        .catch(() => {
          // On failure keep whatever was shown, don't flash coordinates
        });
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [position]);

  const handleSave = async () => {
    if (!position) return;
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(`${API}/api/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          latitude: position.lat,
          longitude: position.lng,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (onLocationSaved) onLocationSaved(position);
      }
    } catch (err) {
      console.error('Failed to save location', err);
    } finally {
      setLoading(false);
    }
  };

  const center = useMemo(() => position || { lat: 40.7128, lng: -74.0060 }, [position]);

  return (
    <div className="bg-surface-container-lowest rounded-DEFAULT p-space-md shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between mb-1">
        <div className="flex flex-col">
          <h3 className="font-title-md text-title-md text-on-surface font-semibold">Your Location</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Search or drag the pin</p>
        </div>
        <button
          onClick={handleGetLocation}
          className="text-primary font-label-sm text-label-sm uppercase font-semibold flex items-center gap-1 hover:bg-surface-container-high px-2 py-1 rounded-md transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">my_location</span>
          Locate Me
        </button>
      </div>

      {/* Address Search */}
      <div className="flex flex-col gap-2 mb-2">
        <form onSubmit={handleSearch} className="flex items-center gap-2 relative">
          <div className="flex-grow flex items-center h-10 px-3 rounded-md bg-surface-container border border-surface-variant focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-secondary text-[18px] mr-2">search</span>
            <input 
              type="text"
              placeholder="Search address or city..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full bg-transparent outline-none font-body-sm text-on-surface placeholder:text-on-surface-variant/70"
            />
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-11 left-0 right-[88px] bg-surface rounded-lg shadow-lg border border-surface-variant overflow-hidden z-[1000] max-h-60 overflow-y-auto">
              {suggestions.map((s, idx) => {
                const parts = s.display_name.split(',');
                const mainText = parts[0];
                const subText = parts.slice(1).join(',').trim();
                return (
                  <li 
                    key={idx} 
                    className="px-4 py-2.5 flex items-start gap-3 border-b border-surface-container-highest last:border-b-0 hover:bg-surface-container-highest cursor-pointer transition-colors"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectSuggestion(s);
                    }}
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px] mt-0.5">location_on</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-md text-label-md text-on-surface truncate">{mainText}</span>
                      <span className="font-body-xs text-body-xs text-on-surface-variant truncate">{subText}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button 
            type="submit" 
            disabled={searching}
            className="h-10 px-4 bg-primary-container text-on-primary font-label-sm uppercase rounded-md hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60 shrink-0"
          >
            {searching ? '...' : 'Search'}
          </button>
        </form>
        {searchError && <p className="text-error text-xs">{searchError}</p>}
      </div>
      
      <div className="w-full h-[250px] bg-surface-container rounded-sm overflow-hidden z-0">
        {position ? (
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} onChange={onChange} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary font-label-sm">
            Loading map...
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 mt-2">
        {/* Selected Location Info Box */}
        <div className="flex items-center gap-3 p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider font-bold mb-0.5">Selected Location</span>
            <span className="font-title-sm text-title-sm text-on-surface truncate">{selectedAddress}</span>
            <span className="font-body-xs text-body-xs text-on-surface-variant font-mono mt-0.5">
              {position?.lat?.toFixed(5)}, {position?.lng?.toFixed(5)}
            </span>
          </div>
        </div>

        {!pickerOnly && (
          <button
            onClick={handleSave}
            disabled={!position || loading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-on-primary rounded-full font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-60"
            type="button"
          >
            {loading ? <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
            {saved ? 'Location Saved!' : 'Save Selected Location'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SetLocationMap;
