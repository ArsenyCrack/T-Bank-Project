import { useEffect, useState } from 'react';
import axios from 'axios';
import HabitForm from './components/HabitForm';
import Habit from './components/Habit';

function App() {
  const [habits, setHabits] = useState([]);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const response = await axios.get('http://localhost:3001/habits');
      setHabits(response.data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/habits/${id}`);
      setHabits(habits.filter(habit => habit.id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Habit Tracker</h1>
      <HabitForm onAdd={(newHabit) => setHabits([...habits, newHabit])} />
      <div>
        {habits.map(habit => (
          <Habit key={habit.id} habit={habit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default App;