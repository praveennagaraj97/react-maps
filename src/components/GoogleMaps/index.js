import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

import "./style.css";
import SearchLocation from "./SearchLocation";

/**
 * @add google-map-libraries
 * @reason to specify libraries out of component is to avoid re-renders
 */
const libraries = ["places"];

/**
 * @default MAP_DISPLAY_STYLES
 */
const mapContainerStyle = {
  width: "80vw",
  height: "80vh",
};

/**
 * @additional options passed to Google Maps
 */
const options = {
  disableDefaultUI: true,
};

export default function GoogleMapsComponent() {
  const [coords, setCoors] = useState({ lat: 0, lng: 0 });
  const [selectedCoord, setSelectedCoord] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [pinCode, setPinCode] = useState("");

  /**
   * @hook to initialize google map -
   * @provides isLoaded, loadError and url
   * @isLoaded @returns true/false
   * @loadError @returns error when map fails to load
   * @url @returns url which will be added to html as script tag.
   */
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GMAPS,
    libraries,
  });

  /**
   * @use get Current location of user
   */
  useEffect(() => {
    let isCancelled = false;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isCancelled) {
            const coordinates = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            setCoors(coordinates);
            setSelectedCoord(coordinates);
          }
        },
        (err) => {
          console.log(err);
          alert(err.message);
        }
      );
    } else {
      alert("Sorry Browser doesn't support location service.");
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  if (loadError) return <p>Something went wrong</p>;
  if (!isLoaded) return <p>Loading ...</p>;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <SearchLocation
          coords={coords}
          setSearchLocation={setSelectedCoord}
          setSelectedAddress={setSelectedAddress}
          setZipCode={setPinCode}
          selectedCoords={selectedCoord}
        />
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={16}
          center={selectedCoord || coords}
          options={options}
          onClick={(e) =>
            setCoors({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            })
          }
        >
          <Marker
            position={selectedCoord ? selectedCoord : coords}
            draggable={true}
            animation="BOUNCE"
            icon={{
              url:
                "https://firebasestorage.googleapis.com/v0/b/lounshop.appspot.com/o/googleMapsMarker.webp?alt=media&token=e0a47a68-354c-43cf-895e-3ad97441225c",
              scaledSize: new window.google.maps.Size(40, 40),
            }}
            onDragStart={() => {
              setSelectedCoord(null);
            }}
            onDragEnd={(e) => {
              const coordinates = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              };

              setSelectedCoord(coordinates);
            }}
          ></Marker>

          {selectedCoord && (
            <InfoWindow position={selectedCoord} options={{}}>
              <div>{!selectedAddress ? "You" : selectedAddress}</div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
      <p>
        Address : {selectedAddress}
        <br />
        zipCode : {pinCode}
      </p>
    </>
  );
}
