import { useState, useEffect } from 'react';
import { TrashIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { format, isToday } from 'date-fns';
import { parseISO, differenceInDays, isYesterday } from 'date-fns';

export default function Habit({ habit, onDelete }) {
  const [days, setDays] = useState([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetchDays();
  }, []);

  const fetchDays = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/habits/${habit.id}/days`);
      setDays(response.data.map(day => day.date));
      calculateStreak(response.data.map(day => day.date));
    } catch (error) {
      console.error('Error fetching days:', error);
    }
  };

  // Расчет текущего стрика
  // const calculateStreak = (dates) => {
  //   if (dates.length === 0) {
  //     setStreak(0);
  //     return;
  //   }
  
  //   // Конвертируем строки в timestamp и сортируем по возрастанию
  //   const sortedTimestamps = dates
  //     .map(date => new Date(date).getTime())
  //     .sort((a, b) => a - b);
  
  //   let currentStreak = 1;
  //   let maxStreak = 1;
  
  //   for (let i = 1; i < sortedTimestamps.length; i++) {
  //     const prevDay = sortedTimestamps[i - 1];
  //     const currDay = sortedTimestamps[i];
      
  //     // Проверяем, что дни идут подряд (разница = 86400000 мс)
  //     if (currDay - prevDay === 86400000) {
  //       currentStreak++;
  //       maxStreak = Math.max(maxStreak, currentStreak);
  //     } else {
  //       currentStreak = 1; // Сброс, если дни не последовательные
  //     }
  //   }
  
  //   console.log('Calculated streak:', maxStreak); // Логирование
  //   setStreak(maxStreak);
  // };

  const calculateStreak = (dates) => {
    if (dates.length === 0) {
      setStreak(0);
      return;
    }
  
    // 1. Конвертируем строки в Date объекты и сортируем по возрастанию
    const sortedDates = [...dates]
      .map(dateStr => parseISO(dateStr))
      .sort((a, b) => a - b);
  
    // 2. Убираем дубликаты дат
    const uniqueDates = Array.from(new Set(sortedDates.map(date => date.toISOString())))
      .map(dateStr => parseISO(dateStr));
  
    // 3. Расчет стрика
    let currentStreak = 1;
    let maxStreak = 1;
  
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = uniqueDates[i - 1];
      const currDate = uniqueDates[i];
      
      // Разница в днях должна быть ровно 1
      if (differenceInDays(currDate, prevDate) === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1; // Сброс стрика
      }
    }
  
    // 4. Проверка последней даты (если последняя отметка - вчера, стрик продолжается)
    const lastDate = uniqueDates[uniqueDates.length - 1];
    if (isYesterday(lastDate)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    }
  
    setStreak(maxStreak);
  };

  const handleAddDay = async () => {
    try {
      const response = await axios.post(`http://localhost:3001/habits/${habit.id}/days`);
      const newDays = response.data.map(day => day.date);
      setDays(newDays);
      calculateStreak(newDays);
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
    }
  };
  return (
    <div className="p-4 bg-white rounded-lg shadow mb-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{habit.title}</h3>
        <div className="flex gap-2">
          <button 
            onClick={handleAddDay}
            className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Day<br></br>
            +
          </button>
          <button 
            onClick={() => onDelete(habit.id)}
            className="text-red-500 hover:text-red-700"
          >Del<TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
        <span>Текущий стрик: {streak} дней</span>
      </div>
    </div>
  );
}