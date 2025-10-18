import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { Meteor } from "meteor/meteor";
import { useNavigate } from "react-router-dom";

const containerStyle = {
  width: "100%",
  height: "100%"
};

const defaultCenter = {
  lat: -37.8136,
  lng: 144.9631
};

export default function MapView({ properties = [] }) {
  const apiKey = Meteor.settings.public?.googleMapsApiKey;
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [scriptError, setScriptError] = useState(false);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const geocodeCacheRef = useRef(new Map());
  const markerHoverTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const propertiesWithAddresses = useMemo(
    () =>
      properties
        .filter((property) => property?.location && property.location.trim().length > 0)
        .map((property) => ({
          id: property.id,
          address: property.location,
          label: property.location
        })),
    [properties]
  );

  useEffect(() => {
    if (!isScriptLoaded) {
      setMarkers([]);
      setHoveredMarkerId(null);
      return;
    }

    if (!propertiesWithAddresses.length) {
      setMarkers([]);
      setHoveredMarkerId(null);
      return;
    }

    let cancelled = false;
    const geocoder = new window.google.maps.Geocoder();

    const geocodeSequentially = async () => {
      // Geocode one address at a time to avoid triggering Google rate limits.
      const nextMarkers = [];

      for (const property of propertiesWithAddresses) {
        if (cancelled) break;

        const cachedPosition = geocodeCacheRef.current.get(property.address);
        if (cachedPosition) {
          nextMarkers.push({
            id: property.id,
            label: property.label,
            position: cachedPosition
          });
          continue;
        }

        const position = await new Promise((resolve) => {
          geocoder.geocode({ address: property.address }, (results, status) => {
            if (status === "OK" && results[0]?.geometry?.location) {
              resolve(results[0].geometry.location.toJSON());
            } else {
              resolve(null);
            }
          });
        });

        if (!position) continue;

        geocodeCacheRef.current.set(property.address, position);
        nextMarkers.push({
          id: property.id,
          label: property.label,
          position
        });
      }

      if (!cancelled) {
        setMarkers(nextMarkers);
      }
    };

    geocodeSequentially();

    return () => {
      cancelled = true;
    };
  }, [isScriptLoaded, propertiesWithAddresses]);

  useEffect(() => {
    return () => {
      if (markerHoverTimeoutRef.current) {
        clearTimeout(markerHoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstance || !window.google) return;

    if (!markers.length) {
      mapInstance.setCenter(defaultCenter);
      mapInstance.setZoom(12);
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    markers.forEach((marker) => bounds.extend(marker.position));
    mapInstance.fitBounds(bounds);
  }, [mapInstance, markers]);

  const handleMapLoad = useCallback((map) => {
    setMapInstance(map);
  }, []);

  const handleScriptLoad = useCallback(() => {
    setIsScriptLoaded(true);
    setScriptError(false);
  }, []);

  const handleScriptError = useCallback(() => {
    setIsScriptLoaded(false);
    setScriptError(true);
  }, []);

  const infoWindowOptions = useMemo(() => {
    if (!isScriptLoaded || !window.google) return undefined;
    return {
      pixelOffset: new window.google.maps.Size(0, -30)
    };
  }, [isScriptLoaded]);

  const handleMarkerMouseOver = useCallback((markerId) => {
    if (markerHoverTimeoutRef.current) {
      clearTimeout(markerHoverTimeoutRef.current);
      markerHoverTimeoutRef.current = null;
    }
    setHoveredMarkerId(markerId);
  }, []);

  const handleMarkerMouseOut = useCallback(() => {
    if (markerHoverTimeoutRef.current) {
      clearTimeout(markerHoverTimeoutRef.current);
    }
    markerHoverTimeoutRef.current = setTimeout(() => {
      setHoveredMarkerId(null);
    }, 150);
  }, []);

  const handleInfoWindowMouseEnter = useCallback(() => {
    if (markerHoverTimeoutRef.current) {
      clearTimeout(markerHoverTimeoutRef.current);
      markerHoverTimeoutRef.current = null;
    }
  }, []);

  const handleInfoWindowMouseLeave = useCallback(() => {
    if (markerHoverTimeoutRef.current) {
      clearTimeout(markerHoverTimeoutRef.current);
    }
    markerHoverTimeoutRef.current = setTimeout(() => {
      setHoveredMarkerId(null);
    }, 150);
  }, []);

  const handleInfoWindowClick = useCallback(
    (markerId) => {
      setHoveredMarkerId(null);
      navigate(`/GuestDetailedPropListing/${markerId}`);
    },
    [navigate]
  );

  const handleInfoWindowKeyDown = useCallback(
    (event, markerId) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleInfoWindowClick(markerId);
      }
    },
    [handleInfoWindowClick]
  );

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-600">
        Unable to load map: missing Google Maps API key.
      </div>
    );
  }

  if (scriptError) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-600">
        Unable to load the map right now. Please try again later.
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} onLoad={handleScriptLoad} onError={handleScriptError}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={handleMapLoad}
      >
        {markers.map((marker) => (
          <MarkerF
            key={marker.id}
            position={marker.position}
            title={marker.label}
            onMouseOver={() => handleMarkerMouseOver(marker.id)}
            onMouseOut={handleMarkerMouseOut}
          >
            {hoveredMarkerId === marker.id && (
              <InfoWindowF
                position={marker.position}
                options={infoWindowOptions}
                onCloseClick={() => setHoveredMarkerId(null)}
              >
                <div
                  className="rounded bg-white px-2 py-1 text-sm text-gray-800 shadow"
                  onMouseEnter={handleInfoWindowMouseEnter}
                  onMouseLeave={handleInfoWindowMouseLeave}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleInfoWindowClick(marker.id)}
                  onKeyDown={(event) => handleInfoWindowKeyDown(event, marker.id)}
                  style={{ cursor: "pointer" }}
                >
                  {marker.label}
                </div>
              </InfoWindowF>
            )}
          </MarkerF>
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
