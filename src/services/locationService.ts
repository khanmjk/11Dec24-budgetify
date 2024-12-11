import { Country, City } from '../types/models';
import citiesData from 'cities.json';

const COUNTRIES_API = 'https://restcountries.com/v3.1';

interface CityData {
  name: string;
  country: string;
  lat: string;
  lng: string;
  admin1?: string;
}

export const locationService = {
  async getCountries(): Promise<Country[]> {
    try {
      const response = await fetch(`${COUNTRIES_API}/all?fields=name,cca2`);
      const data = await response.json();
      return data.map((country: any) => ({
        name: country.name.common,
        code: country.cca2
      })).sort((a: Country, b: Country) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  },

  async getCities(countryCode: string, searchQuery: string = ''): Promise<City[]> {
    if (!searchQuery || searchQuery.length < 2) return [];

    try {
      // Filter cities based on country and search query
      const filteredCities = (citiesData as CityData[])
        .filter(city => 
          city.country === countryCode && 
          city.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map(city => ({
          name: city.name,
          country: city.country,
          region: city.admin1
        }))
        .slice(0, 10);

      return filteredCities;
    } catch (error) {
      console.error('Error filtering cities:', error);
      return [];
    }
  }
};