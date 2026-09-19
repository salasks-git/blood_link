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

const SetLocationMap = ({ hospitalId, onLocationSaved, initialLocation, onChange, onAddressChange, pickerOnly }) => {
  const [position, setPosition] = useState(initialLocation || null); // { lat, lng }
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [placeName, setPlaceName] = useState(initialLocation ? 'Fetching address...' : 'No location selected');
  const mapRef = useRef();
  const skipReverseGeocode = useRef(false);

  // Extract readable "Place, City, State" from a Nominatim search result display_name
  const formatAddressFromDisplayName = (display_name) => {
    const parts = display_name.split(',').map(p => p.trim()).filter(p => p && !/^\d+$/.test(p));
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
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, showSuggestions]);

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name || suggestion.display_name.split(',')[0]);
    setShowSuggestions(false);
    const newPos = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    // Immediately derive address from suggestion — no reverse geocode needed
    const addr = formatAddressFromDisplayName(suggestion.display_name);
    skipReverseGeocode.current = true;
    setPlaceName(addr);
    if (onAddressChange) onAddressChange(addr);
    setPosition(newPos);
    if (onChange) onChange(newPos);
    if (mapRef.current) {
      mapRef.current.flyTo([newPos.lat, newPos.lng], 16, { duration: 1.5 });
    }
  };

  // Set initial location from prop (previously saved), or fall back to geolocation
  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
      return;
    }
    // Only auto-geolocate if no saved location provided
    if (!position && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          if (mapRef.current) {
            mapRef.current.flyTo([newPos.lat, newPos.lng], 16, { duration: 1.5 });
          }
        },
        () => {
          // Default to a generic location if permission denied
          setPosition({ lat: 10.5, lng: 76.2 });
        }
      );
    }
  }, []);

  // Reverse geocode whenever position changes (only for map clicks / locate me)
  useEffect(() => {
    if (!position) return;
    // Skip when address already resolved from suggestion/search result
    if (skipReverseGeocode.current) {
      skipReverseGeocode.current = false;
      return;
    }
    setPlaceName('Fetching address...');
    const timeoutId = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}&zoom=18&addressdetails=1&email=hello@lifelink.com`)
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          let addr;
          if (data && data.address) {
            const a = data.address;
            const place = a.amenity || a.tourism || a.leisure || a.building ||
                          a.road || a.neighbourhood || a.suburb || '';
            const city  = a.city || a.town || a.village || a.county || '';
            const state = a.state || '';
            const structured = [place, city, state].filter(Boolean);
            if (structured.length > 0) {
              addr = structured.join(', ');
            } else if (data.display_name) {
              addr = data.display_name.split(',').map(p => p.trim())
                .filter(p => p && !/^\d+$/.test(p) && p !== 'India')
                .slice(0, 3).join(', ');
            } else {
              addr = `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
            }
          } else if (data && data.display_name) {
            addr = data.display_name.split(',').map(p => p.trim())
              .filter(p => p && !/^\d+$/.test(p) && p !== 'India')
              .slice(0, 3).join(', ');
          } else {
            addr = `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`;
          }
          setPlaceName(addr);
          if (onAddressChange) onAddressChange(addr);
        })
        .catch(() => {
          // On failure keep whatever was shown, don't flash coordinates
        });
    }, 800);
    return () => clearTimeout(timeoutId);
  }, [position]);

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
        setPlaceName(addr);
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

  const handleSave = async () => {
    if (!position) return;
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(`${API}/api/hospital/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId,
          latitude: position.lat,
          longitude: position.lng,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (onLocationSaved) onLocationSaved();
      }
    } catch (err) {
      console.error('Failed to save location', err);
    } finally {
      setLoading(false);
    }
  };

  const center = useMemo(() => position || { lat: 40.7128, lng: -74.0060 }, [position]);

  return (
    <div className="bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
      <div className="flex items-center justify-between">
        {!pickerOnly && (
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface uppercase tracking-wider">Hospital Geolocation</h2>
            <p className="font-body-sm text-body-sm text-secondary">Click on the map to set your hospital's exact location for precise donor matching.</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mb-3 mt-4 gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 items-center relative">
          <div className="flex-grow flex items-center h-12 px-4 bg-surface-container-low border border-outline-variant rounded-l-xl focus-within:border-secondary focus-within:ring-1 focus-within:ring-secondary transition-all shadow-sm">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] mr-2">search</span>
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
              className="w-full bg-transparent outline-none font-body-md text-on-surface placeholder:text-on-surface-variant/70"
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
            className="h-12 px-6 bg-secondary text-white font-label-md uppercase rounded-r-xl shadow-sm hover:bg-secondary/90 transition-colors disabled:opacity-60 shrink-0 border border-secondary"
          >
            {searching ? '...' : 'Search'}
          </button>
        </form>
        <button
          onClick={handleGetLocation}
          className="h-12 px-5 bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:text-secondary hover:border-secondary hover:bg-secondary/5 font-label-md uppercase font-semibold flex items-center gap-2 rounded-xl shadow-sm transition-all shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">my_location</span>
          Locate Me
        </button>
      </div>
      {searchError && <p className="text-error text-xs mb-2">{searchError}</p>}
      
      {position && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-4 flex items-start gap-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">location_on</span>
          </div>
          <div className="flex flex-col justify-center min-h-[40px]">
            <span className="font-label-sm text-secondary uppercase font-bold tracking-wider mb-1">
              Selected Location
            </span>
            <span className="font-body-md text-on-surface line-clamp-2 leading-snug">{placeName}</span>
          </div>
        </div>
      )}
      
      <div className="w-full h-[320px] bg-surface-container rounded-xl overflow-hidden z-0 shadow-inner border border-surface-variant">
        {position ? (
          <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} ref={mapRef}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-secondary">
            Loading map...
          </div>
        )}
      </div>
      
      {!pickerOnly && (
        <button
          onClick={handleSave}
          disabled={!position || loading}
          className="w-full h-12 mt-2 bg-secondary text-white rounded-xl font-label-lg font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow hover:bg-secondary/90 transition-all disabled:opacity-60"
          type="button"
        >
          {loading ? <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span> : <span className="material-symbols-outlined text-[20px]">save</span>}
          {saved ? 'Location Saved!' : 'Save Location'}
        </button>
      )}
    </div>
  );
};

export default SetLocationMap;
