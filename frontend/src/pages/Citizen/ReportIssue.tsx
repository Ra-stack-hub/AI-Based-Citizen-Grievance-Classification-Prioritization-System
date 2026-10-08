import React, { useState } from 'react';
import { Camera, MapPin, Upload, Loader2 } from 'lucide-react';
import { useComplaint } from '../../hooks/useComplaint';
import { useNotification } from '../../hooks/useNotification';
import { useNavigate } from 'react-router-dom';

const ReportIssue = () => {
  const { submitComplaint, loading } = useComplaint();
  const { notifySuccess, notifyError } = useNotification();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitComplaint({
        ...formData,
        location: { latitude: 28.6139, longitude: 77.2090, address: formData.address }
      });
      notifySuccess('Complaint registered successfully! AI is analyzing it.');
      navigate('/dashboard/history');
    } catch (error: any) {
      notifyError(error.message || 'Failed to submit complaint');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report an Issue</h1>
        <p className="text-gray-500 mt-2">Help us identify and fix problems in your area. AI will automatically route your issue to the correct department.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issue Title</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="E.g., Severe water leakage on MG Road"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detailed Description</label>
            <textarea 
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location / Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Where is this happening?"
                className="w-full pl-10 pr-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-700 dark:text-white"
              />
              <button type="button" className="absolute inset-y-0 right-2 flex items-center text-blue-600 text-sm font-medium hover:text-blue-700">
                Detect Location
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Photo Evidence</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
              <div className="flex justify-center mb-3 text-gray-400">
                <Camera className="w-10 h-10" />
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Click to upload or drag and drop photos</p>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
            </div>
          </div>

          <div className="pt-4 border-t dark:border-gray-700">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              {loading ? 'Submitting to AI...' : 'Submit Complaint'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ReportIssue;
