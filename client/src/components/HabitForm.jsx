// components/HabitForm.jsx
import { useState } from 'react';
import axios from 'axios';

export default function HabitForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please enter a habit title');
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:3001/habits', { 
        title: title.trim() 
      });
      
      onAdd(response.data);
      setTitle('');
      setError('');
    } catch (err) {
      console.error('Error:', err.response?.data || err.message);
      setError('Failed to create habit. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError('');
          }}
          placeholder="Enter new habit"
          className={`flex-1 p-2 border rounded ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>
      {error && <p className="mt-1 text-red-500 text-sm">{error}</p>}
    </form>
  );
}