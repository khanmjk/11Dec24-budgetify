import React, { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { locationService } from '../../services/locationService';
import type { Country, City } from '../../types/models';

interface LocationSelectProps {
  selectedCountry?: string;
  selectedCity?: string;
  onCountryChange: (country: string) => void;
  onCityChange: (city: string) => void;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  selectedCountry,
  selectedCity,
  onCountryChange,
  onCityChange
}) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citySearch, setCitySearch] = useState(selectedCity || '');
  const [debouncedCitySearch] = useDebounce(citySearch, 300);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      const countriesList = await locationService.getCountries();
      setCountries(countriesList);
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const loadCities = async () => {
      if (selectedCountry && debouncedCitySearch && debouncedCitySearch.length >= 2) {
        setIsLoadingCities(true);
        try {
          const citiesList = await locationService.getCities(selectedCountry, debouncedCitySearch);
          setCities(citiesList);
        } catch (error) {
          console.error('Error loading cities:', error);
          setCities([]);
        } finally {
          setIsLoadingCities(false);
        }
      } else {
        setCities([]);
      }
    };
    loadCities();
  }, [selectedCountry, debouncedCitySearch]);

  const selectedCountryName = countries.find(c => c.code === selectedCountry)?.name;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Country</label>
        <select
          value={selectedCountry}
          onChange={(e) => {
            onCountryChange(e.target.value);
            setCitySearch('');
            setCities([]);
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a country</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">City</label>
        <input
          type="text"
          value={citySearch}
          onChange={(e) => {
            setCitySearch(e.target.value);
            onCityChange(e.target.value);
          }}
          placeholder={selectedCountryName ? `Search cities in ${selectedCountryName}...` : 'Select a country first'}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          disabled={!selectedCountry}
        />
        {isLoadingCities && (
          <div className="absolute right-3 top-9">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
          </div>
        )}
        {cities.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {cities.map((city, index) => (
              <li
                key={`${city.name}-${index}`}
                className="relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-indigo-50"
                onClick={() => {
                  setCitySearch(city.name);
                  onCityChange(city.name);
                  setCities([]); // Hide dropdown after selection
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{city.name}</span>
                  {city.region && (
                    <span className="text-xs text-gray-500">{city.region}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};