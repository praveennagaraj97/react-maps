import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import React, { useEffect } from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
  getZipCode,
} from "use-places-autocomplete";
import "@reach/combobox/styles.css";
import Geocode from "react-geocode";

/**
 * @uses USE-PLACES-AUTOCOMPLETE
 * @how a React hook for Google Maps Places Autocomplete,
 * which helps you build an UI component with the feature of place autocomplete easily!
 * By leveraging the power of Google Maps Places API
 */

/**
 *
 * @param {coords} TO_RESTRICT_USER_FROM_SEARCHING_FAR_LOCATIONS
 * @requires DEFAULT_LOCATION/CURRENT_LOACTION
 */
export default function SearchLocation({
  coords,
  setSearchLocation,
  setSelectedAddress,
  setZipCode,
  selectedCoords,
  MAP_KEY,
}) {
  const {
    ready,
    value,
    suggestions: { data, status },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => coords.lat, lng: () => coords.lng },
      radius: (process.env.REACT_APP_SEARCH_DISTANCE || 200) * 1000,
    },
  });

  useEffect(() => {
    Geocode.setApiKey(MAP_KEY);

    if (selectedCoords) {
      const { lat, lng } = selectedCoords;
      Geocode.fromLatLng(lat, lng).then(
        (response) => {
          const address = response.results[0].formatted_address;
          setSelectedAddress(address);
          getZipCode(response.results[0])
            .then((zipCode) => {
              setZipCode(zipCode || "");
            })
            .catch((e) => {
              console.log(e);
            });
        },
        (error) => {
          console.error(error);
        }
      );
    } else {
      const { lat, lng } = coords;
      Geocode.fromLatLng(lat, lng).then(
        (response) => {
          const address = response.results[0].formatted_address;
          setSelectedAddress(address);
          getZipCode(response.results[0])
            .then((zipCode) => {
              setZipCode(zipCode || "");
            })
            .catch((e) => {
              console.log(e);
            });
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }, [coords, selectedCoords, setSelectedAddress, setZipCode, MAP_KEY]);

  /**
   * @handle selected address
   * @requires address/place_id
   */
  async function handleSelectedAddress(address) {
    setValue(address, false);
    clearSuggestions();

    setSelectedAddress(address);

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      const zipCode = await getZipCode(results[0]);

      setZipCode(zipCode || "");
      setSearchLocation({ lat, lng });
    } catch (e) {
      console.log(e);
      console.clear();
    }
  }

  return (
    <Combobox
      className="search"
      onSelect={(address) => handleSelectedAddress(address)}
    >
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        placeholder="Enter location"
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === "OK" &&
            data.map(({ place_id, description }) => {
              return <ComboboxOption key={place_id} value={description} />;
            })}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
}
