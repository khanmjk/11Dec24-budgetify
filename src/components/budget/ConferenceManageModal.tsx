import React, { useState } from 'react';
import { useBudgetStore } from '../../store/budgetStore';
import { FormField } from '../common/FormField';
import { LocationSelect } from '../common/LocationSelect';
import { DateRangeSelect } from '../common/DateRangeSelect';
import { ConferenceTravelList } from './ConferenceTravelList';
import { TravelType } from '../../types/enums';
import { generateId } from '../../utils/generateId';
import { AlertTriangle, Plus } from 'lucide-react';

interface ConferenceManageModalProps {
  budgetItemId: string;
  onClose: () => void;
}

export const ConferenceManageModal: React.FC<ConferenceManageModalProps> = ({
  budgetItemId,
  onClose
}) => {
  const store = useBudgetStore();
  const budgetItem = store.budgetItems.find(item => item.id === budgetItemId);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    conferenceName: '',
    motivation: '',
    travelType: TravelType.Local,
    country: '',
    city: '',
    needsHotel: false,
    needsCarRental: false,
    needsAirTravel: false,
    flightCosts: 0,
    hotelCosts: 0,
    carRentalCosts: 0,
    mealCosts: 0,
    startDate: '',
    endDate: '',
    numberOfTravelers: 1
  });

  const [error, setError] = useState('');

  if (!budgetItem) return null;

  const calculateTotalPerPerson = () => {
    const { hotelCosts, carRentalCosts, mealCosts, flightCosts, numberOfTravelers } = formData;
    // Car rental is shared among travelers, other costs are per person
    const carRentalPerPerson = formData.needsCarRental ? carRentalCosts / numberOfTravelers : 0;
    const flightCostsAmount = formData.needsAirTravel ? flightCosts : 0;
    
    return (
      (formData.needsHotel ? hotelCosts : 0) +
      carRentalPerPerson +
      mealCosts +
      flightCostsAmount
    );
  };

  const calculateTotalAmount = () => {
    return calculateTotalPerPerson() * formData.numberOfTravelers;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate < startDate) {
      setError('End date cannot be before start date');
      return;
    }

    const totalAmount = calculateTotalAmount();
    const currentSpent = budgetItem.travelDetails?.reduce((sum, detail) => sum + detail.totalAmount, 0) || 0;
    
    if (totalAmount + currentSpent > budgetItem.amount) {
      setError(`Total amount exceeds budget allocation of $${budgetItem.amount.toLocaleString()}`);
      return;
    }

    const travelDetail = {
      id: generateId(),
      budgetItemId,
      conferenceName: formData.conferenceName,
      motivation: formData.motivation,
      travelType: formData.travelType,
      country: formData.country,
      city: formData.city,
      needsHotel: formData.needsHotel,
      needsCarRental: formData.needsCarRental,
      needsAirTravel: formData.needsAirTravel,
      flightCosts: formData.needsAirTravel ? formData.flightCosts : 0,
      hotelCosts: formData.hotelCosts,
      carRentalCosts: formData.carRentalCosts,
      mealCosts: formData.mealCosts,
      startDate: formData.startDate,
      endDate: formData.endDate,
      numberOfTravelers: formData.numberOfTravelers,
      perPersonCost: calculateTotalPerPerson(),
      totalAmount
    };

    // Update budget item with travel details
    const updatedBudgetItem = {
      ...budgetItem,
      spent: (currentSpent + totalAmount),
      travelDetails: [...(budgetItem.travelDetails || []), travelDetail]
    };

    store.addBudgetItem(updatedBudgetItem);
    setShowForm(false);
    setFormData({
      conferenceName: '',
      motivation: '',
      travelType: TravelType.Local,
      country: '',
      city: '',
      needsHotel: false,
      needsCarRental: false,
      needsAirTravel: false,
      flightCosts: 0,
      hotelCosts: 0,
      carRentalCosts: 0,
      mealCosts: 0,
      startDate: '',
      endDate: '',
      numberOfTravelers: 1
    });
  };

  const totalPerPerson = calculateTotalPerPerson();
  const totalAmount = calculateTotalAmount();
  const currentSpent = budgetItem.travelDetails?.reduce((sum, detail) => sum + detail.totalAmount, 0) || 0;
  const remaining = budgetItem.amount - currentSpent;
  const isOverBudget = totalAmount > remaining;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Conference Travel Management</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">×</button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-blue-700">
            Budget Allocation: ${budgetItem.amount.toLocaleString()}
            <br />
            Spent: ${currentSpent.toLocaleString()}
            <br />
            Available: ${remaining.toLocaleString()}
          </p>
        </div>

        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Travel
            </button>
          </div>
        )}

        {showForm ? (
          <>
            {error && (
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Existing form fields */}
              <FormField
                label="Conference Name"
                type="text"
                required
                value={formData.conferenceName}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  conferenceName: e.target.value 
                }))}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Motivation
                </label>
                <textarea
                  required
                  value={formData.motivation}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    motivation: e.target.value 
                  }))}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Travel Type
                  </label>
                  <select
                    value={formData.travelType}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      travelType: e.target.value as TravelType
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value={TravelType.Local}>Local</option>
                    <option value={TravelType.International}>International</option>
                  </select>
                </div>

                <FormField
                  label="Number of Travelers"
                  type="number"
                  min="1"
                  required
                  value={formData.numberOfTravelers}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    numberOfTravelers: Number(e.target.value)
                  }))}
                />
              </div>

              <LocationSelect
                selectedCountry={formData.country}
                selectedCity={formData.city}
                onCountryChange={(country) => setFormData(prev => ({
                  ...prev,
                  country,
                  city: ''
                }))}
                onCityChange={(city) => setFormData(prev => ({
                  ...prev,
                  city
                }))}
              />

              <DateRangeSelect
                startDate={formData.startDate}
                endDate={formData.endDate}
                onStartDateChange={(date) => setFormData(prev => ({
                  ...prev,
                  startDate: date,
                  endDate: ''
                }))}
                onEndDateChange={(date) => setFormData(prev => ({
                  ...prev,
                  endDate: date
                }))}
              />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.needsHotel}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsHotel: e.target.checked,
                        hotelCosts: e.target.checked ? prev.hotelCosts : 0
                      }))}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Needs Hotel</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.needsCarRental}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsCarRental: e.target.checked,
                        carRentalCosts: e.target.checked ? prev.carRentalCosts : 0
                      }))}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Needs Car Rental</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.needsAirTravel}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        needsAirTravel: e.target.checked,
                        flightCosts: e.target.checked ? prev.flightCosts : 0
                      }))}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Needs Air Travel</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.needsAirTravel && (
                  <FormField
                    label="Estimated Flight Costs (per person)"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.flightCosts}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      flightCosts: Number(e.target.value)
                    }))}
                  />
                )}

                {formData.needsHotel && (
                  <FormField
                    label="Hotel Costs (per person)"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.hotelCosts}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      hotelCosts: Number(e.target.value)
                    }))}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.needsCarRental && (
                  <FormField
                    label="Car Rental Costs (total)"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.carRentalCosts}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      carRentalCosts: Number(e.target.value)
                    }))}
                  />
                )}

                <FormField
                  label="Meal Costs (per person)"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={formData.mealCosts}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    mealCosts: Number(e.target.value)
                  }))}
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Cost per Person</p>
                    <p className="text-lg font-medium text-gray-900">
                      ${totalPerPerson.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className={`text-lg font-medium ${
                      isOverBudget ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      ${totalAmount.toLocaleString()}
                      {isOverBudget && (
                        <AlertTriangle className="inline-block ml-1 h-4 w-4 text-red-500" />
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  disabled={isOverBudget}
                >
                  Add Travel
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Items</h3>
            <ConferenceTravelList travels={budgetItem.travelDetails || []} />
          </div>
        )}
      </div>
    </div>
  );
};