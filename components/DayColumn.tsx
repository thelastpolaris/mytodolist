import React, { useState, useRef, useEffect } from 'react';
import { DayOfWeek, Todo, DAYS_OF_WEEK } from '../types';
import TodoItem from './TodoItem';
import { PlusIcon, DotsHorizontalIcon, ArrowRightIcon } from './Icons';

interface DayColumnProps {
  day: DayOfWeek;
  todos: Todo[];
  onAddTodo: (text: string, day: DayOfWeek) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onDropTodo: (todoId: string, targetDay: DayOfWeek) => void;
  onMoveAll: (sourceDay: DayOfWeek, targetDay: DayOfWeek) => void;
}

const DayColumn: React.FC<DayColumnProps> = ({ 
  day, 
  todos, 
  onAddTodo, 
  onToggleTodo, 
  onDeleteTodo,
  onDropTodo,
  onMoveAll
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onAddTodo(inputValue.trim(), day);
      setInputValue('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const todoId = e.dataTransfer.getData('todoId');
    if (todoId) {
      onDropTodo(todoId, day);
    }
  };

  const handleMoveAllTo = (targetDay: DayOfWeek) => {
    onMoveAll(day, targetDay);
    setShowMenu(false);
  };

  // Calculate days for submenu
  const otherDays = DAYS_OF_WEEK.filter(d => d !== day);
  const activeTodosCount = todos.filter(t => !t.completed).length;

  const isToday = day === new Date().toLocaleDateString('ru-RU', { weekday: 'long' }).replace(/^./, str => str.toUpperCase());
  const isWeekend = day === 'Суббота' || day === 'Воскресенье';

  return (
    <div 
      className={`
        flex flex-col h-full rounded-xl shadow-sm border overflow-visible transition-colors duration-200 relative
        ${isDragOver ? 'bg-indigo-50 border-indigo-300 border-dashed' : 'bg-white border-gray-100'}
        ${isToday && !isDragOver ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={`p-3 border-b border-gray-100 flex justify-between items-center rounded-t-xl ${isWeekend ? 'bg-red-50/50' : 'bg-gray-50/50'}`}>
        <div className="flex items-center gap-2">
            <h3 className={`font-bold text-lg ${isWeekend ? 'text-red-500' : 'text-gray-700'}`}>
            {day}
            </h3>
            <span className="bg-white px-2 py-0.5 rounded-md text-xs font-medium text-gray-400 border border-gray-100 shadow-sm">
            {todos.length}
            </span>
        </div>
        
        {/* Context Menu */}
        {todos.length > 0 && (
            <div className="relative" ref={menuRef}>
                <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all"
                >
                    <DotsHorizontalIcon className="w-5 h-5" />
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-50 p-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                        <div className="text-xs font-semibold text-gray-400 px-2 py-1.5 uppercase tracking-wider">
                            Перенести активные ({activeTodosCount})
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                            {otherDays.map(targetDay => (
                                <button
                                    key={targetDay}
                                    onClick={() => handleMoveAllTo(targetDay)}
                                    className="w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-md flex items-center gap-2 transition-colors"
                                >
                                    <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                                    <span>В {targetDay}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 p-3 space-y-2 min-h-[150px]">
        {todos.length > 0 ? (
          todos.map(todo => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onToggle={onToggleTodo} 
              onDelete={onDeleteTodo} 
            />
          ))
        ) : (
          <div className={`h-full flex flex-col items-center justify-center text-sm py-8 border-2 border-dashed rounded-lg transition-colors ${isDragOver ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-100 text-gray-300'}`}>
            <p>{isDragOver ? 'Бросьте сюда' : 'Нет задач'}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Добавить..."
            className="w-full pl-3 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          <button 
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-1 top-1 p-1 text-indigo-500 hover:bg-indigo-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default DayColumn;