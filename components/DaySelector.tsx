import React, { useEffect, useRef } from 'react';
import { DayOfWeek, DAYS_OF_WEEK } from '../types';

interface DaySelectorProps {
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDay, onSelectDay }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected day on mobile/small screens
  useEffect(() => {
    if (scrollRef.current) {
      const selectedButton = scrollRef.current.querySelector(`[data-day="${selectedDay}"]`) as HTMLElement;
      if (selectedButton) {
        const containerCenter = scrollRef.current.offsetWidth / 2;
        const buttonCenter = selectedButton.offsetLeft + selectedButton.offsetWidth / 2;
        
        scrollRef.current.scrollTo({
          left: buttonCenter - containerCenter,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedDay]);

  const getShortName = (day: string) => {
    const map: Record<string, string> = {
      'Понедельник': 'ПН',
      'Вторник': 'ВТ',
      'Среда': 'СР',
      'Четверг': 'ЧТ',
      'Пятница': 'ПТ',
      'Суббота': 'СБ',
      'Воскресенье': 'ВС',
    };
    return map[day] || day.substring(0, 2);
  };

  return (
    <div className="mb-6 relative">
      {/* Gradient masks to indicate scrolling */}
      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none sm:hidden"></div>
      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none sm:hidden"></div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar sm:justify-between sm:overflow-visible scroll-smooth px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = day === selectedDay;
          const isWeekend = day === 'Суббота' || day === 'Воскресенье';

          return (
            <button
              key={day}
              data-day={day}
              onClick={() => onSelectDay(day)}
              className={`
                flex flex-col items-center justify-center min-w-[60px] py-3 rounded-2xl transition-all duration-200 flex-shrink-0 border
                ${isSelected 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600 transform scale-105' 
                  : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50'
                }
              `}
            >
              <span className={`text-xs font-semibold mb-1 ${isSelected ? 'text-indigo-200' : 'text-gray-400'}`}>
                {getShortName(day)}
              </span>
              <span className={`text-sm font-bold ${isSelected ? 'text-white' : isWeekend ? 'text-red-400' : 'text-gray-700'}`}>
                {day.substring(0, 3)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DaySelector;