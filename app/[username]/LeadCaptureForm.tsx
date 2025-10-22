'use client';

import { useState } from 'react';
import { submitLead } from './actions';

interface LeadCaptureFormProps {
  username: string;
}

export default function LeadCaptureForm({ username }: LeadCaptureFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      const result = await submitLead(email, username);
      
      if (result.success) {
        setMessage('Success! Redirecting...');
        // The server action will handle the redirect
      } else {
        setMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="you@example.com"
        />
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Get Started'}
      </button>
      
      {message && (
        <div className={`text-center text-sm ${
          message.includes('Success') ? 'text-green-600' : 'text-red-600'
        }`}>
          {message}
        </div>
      )}
    </form>
  );
}
