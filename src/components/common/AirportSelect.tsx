import React, { useEffect, useState } from 'react';
import { airportService } from '../../services/airportService';
import type { Airport } from '../../types/models';

interface AirportSelectProps {
  countryCode: string;
  label: string;
  value?: string;
  onChange: (airport: string) => void;
  disabled?: boolean;
}

export const AirportSelect: React.FC<AirportSelectProps> = ({
  countryCode,
  label,
  value,
  onChange,
  disabled
}) => {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAirports = async () => {
      if (countryCode) {
        setIsLoading(true);
        try {
          const airportList = await airportService.getAirportsByCountry(countryCode);
          setAirports(airportList);
        } catch (error) {
          console.error('Error loading airports:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadAirports();
  }, [countryCode]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoading}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Select airport</option>
          {airports.map((airport) => (
            <option key={airport.iata} value={airport.iata}>
              {airport.name} ({airport.iata}) - {airport.city}
            </option>
          ))}
        </select>
        {isLoading && (
          <div className="absolute right-3 top-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>
      {airports.length === 0 && !isLoading && countryCode && (
        <p className="mt-1 text-sm text-gray-500">
          No airports found for this country
        </p>
      )}
    </div>
  );
};