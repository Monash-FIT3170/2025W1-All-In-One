import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%"
};

// Example: Melbourne CBD
const center = {
  lat: -37.8136,
  lng: 144.9631
};

export default function MapView() {
  return (
    <LoadScript googleMapsApiKey="AIzaSyB8eZSiUs5xRaFniKewl4XxILzbOm1w7Co">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        {/* You can add markers or overlays here later */}
      </GoogleMap>
    </LoadScript>
  );
}
