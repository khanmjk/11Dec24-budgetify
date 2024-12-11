// Update the form to include conference name and motivation
<div className="grid grid-cols-1 gap-4 mb-4">
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
    <label className="block text-sm font-medium text-gray-700">Motivation</label>
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
</div>

// Rest of the existing form fields...