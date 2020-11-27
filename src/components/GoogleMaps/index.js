import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const libraries = ["places"];
const mapContainerStyle = {
  width: "80vw",
  height: "80vh",
};

const options = {
  disableDefaultUI: true,
};

/**
 * @reason to specify libraries out of component is to avoid re-renders
 */
export default function GoogleMapsComponent() {
  const [coords, setCoors] = useState({ lat: 0, lng: 0 });

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
            setCoors({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
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

  if (!isLoaded) return <p>Loading ...</p>;

  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={16}
        center={coords}
        options={options}
        onClick={(e) =>
          setCoors({
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          })
        }
      >
        <Marker
          position={coords}
          draggable={true}
          animation="BOUNCE"
          onDrag={(e) =>
            setCoors({
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            })
          }
        ></Marker>
      </GoogleMap>
    </div>
  );
}
