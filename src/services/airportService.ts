import { Airport } from '../types/models';

// This is a subset of the OpenFlights airport database
// Source: https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat
const AIRPORTS_DATA = [
  // Format: Airport ID,Name,City,Country,IATA,ICAO,Latitude,Longitude,Altitude,Timezone,DST,Tz database time zone,Type,Source
  "1,Goroka,Goroka,Papua New Guinea,GKA,AYGA,-6.081689,145.391881,5282,10,U,Pacific/Port_Moresby,airport,OurAirports",
  "2,Madang,Madang,Papua New Guinea,MAG,AYMD,-5.207083,145.788700,20,10,U,Pacific/Port_Moresby,airport,OurAirports",
  // ... more airports will be added
].map(line => {
  const [, name, city, country, iata] = line.split(',');
  return { name, city, country, iata };
});

export const airportService = {
  async getAirportsByCountry(countryCode: string): Promise<Airport[]> {
    try {
      // Filter airports by country code
      // Note: The country codes in the data are full names, so we'll need to match accordingly
      const filteredAirports = AIRPORTS_DATA.filter(airport => 
        airport.country.toLowerCase().includes(countryCode.toLowerCase())
      );

      return filteredAirports.map(airport => ({
        iata: airport.iata,
        name: airport.name,
        city: airport.city,
        country: airport.country
      }));
    } catch (error) {
      console.error('Error filtering airports:', error);
      return [];
    }
  }
};