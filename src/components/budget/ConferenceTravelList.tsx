import React from 'react';
import { TravelDetail } from '../../types/models';
import { Plane, Hotel, Car, Calendar, Users, DollarSign } from 'lucide-react';

interface ConferenceTravelListProps {
  travels: TravelDetail[];
}

export const ConferenceTravelList: React.FC<ConferenceTravelListProps> = ({ travels }) => {
  if (travels.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No travel items added yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {travels.map(travel => {
        const days = Math.ceil(
          (new Date(travel.endDate).getTime() - new Date(travel.startDate).getTime()) / 
          (1000 * 60 * 60 * 24)
        );

        return (
          <div key={travel.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {travel.conferenceName}
                </h4>
                <p className="text-sm text-gray-500">
                  {travel.city}, {travel.country}
                </p>
              </div>
              <div className="flex space-x-2">
                {travel.needsAirTravel && (
                  <Plane className="h-5 w-5 text-indigo-600" />
                )}
                {travel.needsHotel && (
                  <Hotel className="h-5 w-5 text-indigo-600" />
                )}
                {travel.needsCarRental && (
                  <Car className="h-5 w-5 text-indigo-600" />
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-sm font-medium">
                    {new Date(travel.startDate).toLocaleDateString()} - {new Date(travel.endDate).toLocaleDateString()}
                    <span className="ml-1 text-gray-500">({days} days)</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Travelers</p>
                  <p className="text-sm font-medium">{travel.numberOfTravelers}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {travel.needsAirTravel && (
                  <div>
                    <p className="text-sm text-gray-500">Flight Costs (pp)</p>
                    <p className="text-sm font-medium">${travel.flightCosts.toLocaleString()}</p>
                  </div>
                )}
                {travel.needsHotel && (
                  <div>
                    <p className="text-sm text-gray-500">Hotel Costs (pp)</p>
                    <p className="text-sm font-medium">${travel.hotelCosts.toLocaleString()}</p>
                  </div>
                )}
                {travel.needsCarRental && (
                  <div>
                    <p className="text-sm text-gray-500">Car Rental (total)</p>
                    <p className="text-sm font-medium">${travel.carRentalCosts.toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Meals (pp)</p>
                  <p className="text-sm font-medium">${travel.mealCosts.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Cost per Person</p>
                    <p className="text-sm font-medium">${travel.perPersonCost.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-lg font-medium text-indigo-600">
                    ${travel.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};