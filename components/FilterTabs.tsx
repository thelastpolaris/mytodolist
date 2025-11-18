import React from 'react';
import { FilterType } from '../types';

interface FilterTabsProps {
  currentFilter: FilterType;
  setFilter: (filter: FilterType) => void;
  counts: { total: number; active: number; completed: number };
}

const FilterTabs: React.FC<FilterTabsProps> = ({ currentFilter, setFilter, counts }) => {
  const tabs = [
    { type: FilterType.ALL, label: 'Все', count: counts.total },
    { type: FilterType.ACTIVE, label: 'В процессе', count: counts.active },
    { type: FilterType.COMPLETED, label: 'Завершенные', count: counts.completed },
  ];

  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.type}
          onClick={() => setFilter(tab.type)}
          className={`
            flex-1 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2
            ${currentFilter === tab.type
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
            }
          `}
        >
          {tab.label}
          <span className={`
            text-xs px-1.5 py-0.5 rounded-full
            ${currentFilter === tab.type ? 'bg-indigo-50' : 'bg-gray-200'}
          `}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterTabs;