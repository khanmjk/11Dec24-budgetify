import React from 'react';

interface DateRangeSelectProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export const DateRangeSelect: React.FC<DateRangeSelectProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          required
          min={today}
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          required
          min={startDate || today}
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          disabled={!startDate}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {!startDate && (
          <p className="mt-1 text-sm text-gray-500">
            Please select a start date first
          </p>
        )}
      </div>
    </div>
  );
};