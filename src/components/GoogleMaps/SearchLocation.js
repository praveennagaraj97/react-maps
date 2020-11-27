import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxPopover,
} from "@reach/combobox";
import React from "react";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import "@reach/combobox/styles.css";

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
        {status === "OK" &&
          data.map(({ place_id, description }) => {
            return <ComboboxOption key={place_id} value={description} />;
          })}
      </ComboboxPopover>
    </Combobox>
  );
}
