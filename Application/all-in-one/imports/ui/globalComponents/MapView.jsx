import React from "react";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { Meteor } from "meteor/meteor";

const containerStyle = {
  width: "100%",
  height: "100%"
};

const center = {
  lat: -37.8136, // Melbourne CBD
  lng: 144.9631
};

export default function MapView() {
 
  const apiKey = Meteor.settings.public?.googleMapsApiKey;

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12}>
        {/* Add markers here later */}
      </GoogleMap>
    </LoadScript>
  );
}
