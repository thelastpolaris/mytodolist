
import React, { useState, useRef, useEffect } from 'react';
import { DayOfWeek, Todo, DAYS_OF_WEEK, ALL_COLUMNS, TimeBlock, Tag, COLOR_PALETTE } from '../types';
import TodoItem from './TodoItem';
import { PlusIcon, DotsHorizontalIcon, ArrowRightIcon, MorningIcon, SunIcon, MoonIcon, ArchiveBoxIcon, ArrowsPointingOutIcon } from './Icons';

interface DayColumnProps {
  day: DayOfWeek;
  todos: Todo[];
  tags: Tag[];
  onAddTodo: (text: string, day: DayOfWeek, timeBlock: TimeBlock, tagId: string | null) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onDropTodo: (todoId: string, targetDay: DayOfWeek) => void;
  onMoveAll: (sourceDay: DayOfWeek, targetDay: DayOfWeek) => void;
  isSelectionMode: boolean;
  selectedIds: string[];
  onSelectTodo: (id: string) => void;
  onEditTodo: (todo: Todo) => void;
  onFocus: () => void;
  isFocused: boolean;
}

const DayColumn: React.FC<DayColumnProps> = ({ 
  day, 
  todos, 
  tags,
  onAddTodo, 
  onToggleTodo, 
  onDeleteTodo,
  onDropTodo,
  onMoveAll,
  isSelectionMode,
  selectedIds,
  onSelectTodo,
  onEditTodo,
  onFocus,
  isFocused
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<TimeBlock>('day');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isBacklog = day === 'Backlog';

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
      onAddTodo(inputValue.trim(), day, selectedTimeBlock, selectedTagId);
      setInputValue('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isSelectionMode) return;
    e.preventDefault(); // Necessary to allow dropping
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isSelectionMode) return;
    
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
  const otherDays = ALL_COLUMNS.filter(d => d !== day);
  const activeTodosCount = todos.filter(t => !t.completed).length;

  const isToday = day === new Date().toLocaleDateString('ru-RU', { weekday: 'long' }).replace(/^./, str => str.toUpperCase());
  const isWeekend = day === 'Суббота' || day === 'Воскресенье';

  // Group todos by time block
  const morningTodos = todos.filter(t => t.timeBlock === 'morning');
  const dayTodos = todos.filter(t => t.timeBlock === 'day');
  const eveningTodos = todos.filter(t => t.timeBlock === 'evening');

  const renderTodoGroup = (
    groupTodos: Todo[], 
    title: string, 
    icon: React.ReactNode, 
    colorClass: string
  ) => {
    if (groupTodos.length === 0) return null;

    return (
      <div className="mb-3 last:mb-0">
        <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 px-1 ${colorClass}`}>
          {icon}
          <span>{title}</span>
        </div>
        <div className="space-y-2">
          {groupTodos.map(todo => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              tags={tags}
              onToggle={onToggleTodo} 
              onDelete={onDeleteTodo}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(todo.id)}
              onSelect={onSelectTodo}
              onEdit={onEditTodo}
            />
          ))}
        </div>
      </div>
    );
  };

  const activeTag = tags.find(t => t.id === selectedTagId);

  return (
    <div 
      className={`
        flex flex-col h-full rounded-xl shadow-sm border overflow-visible transition-colors duration-200 relative
        ${isFocused ? 'w-full max-w-3xl mx-auto min-h-[80vh] shadow-md bg-white' : 'min-w-[300px]'}
        ${isDragOver ? 'bg-indigo-50 border-indigo-300 border-dashed' : 'bg-white border-gray-100'}
        ${isToday && !isDragOver && !isFocused ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
        ${isBacklog && !isDragOver && !isFocused ? 'bg-gray-50/50' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className={`
        p-3 border-b border-gray-100 flex justify-between items-center rounded-t-xl
        ${isFocused ? 'bg-white py-4' : ''}
        ${!isFocused && isBacklog ? 'bg-gray-100' : !isFocused && isWeekend ? 'bg-red-50/50' : !isFocused ? 'bg-gray-50/50' : ''}
      `}>
        <div className="flex items-center gap-2">
            {isBacklog && <ArchiveBoxIcon className="w-5 h-5 text-gray-500" />}
            <h3 className={`font-bold text-lg ${!isFocused && isBacklog ? 'text-gray-600' : !isFocused && isWeekend ? 'text-red-500' : 'text-gray-700'}`}>
              {isBacklog ? 'Бэклог' : day}
            </h3>
            <span className="bg-white px-2 py-0.5 rounded-md text-xs font-medium text-gray-400 border border-gray-100 shadow-sm">
              {todos.length}
            </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Focus Button - Only show if not already focused and not selecting */}
          {!isSelectionMode && !isFocused && (
             <button
               onClick={onFocus}
               className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-md transition-all"
               title="Фокусировка на этом дне"
             >
               <ArrowsPointingOutIcon className="w-5 h-5" />
             </button>
          )}

          {/* Context Menu */}
          {!isSelectionMode && todos.length > 0 && (
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
                                      <span>В {targetDay === 'Backlog' ? 'Бэклог' : targetDay}</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 p-3 min-h-[150px] flex flex-col">
        {todos.length > 0 ? (
          isBacklog ? (
             // Backlog view: Simple list without time separation
             <div className="space-y-2">
               {todos.map(todo => (
                 <TodoItem 
                    key={todo.id} 
                    todo={todo} 
                    tags={tags}
                    onToggle={onToggleTodo} 
                    onDelete={onDeleteTodo}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.includes(todo.id)}
                    onSelect={onSelectTodo}
                    onEdit={onEditTodo}
                  />
               ))}
             </div>
          ) : (
            // Standard view: Time blocks
            <>
              {renderTodoGroup(morningTodos, 'Утро', <MorningIcon className="w-3.5 h-3.5" />, 'text-amber-600')}
              {renderTodoGroup(dayTodos, 'День', <SunIcon className="w-3.5 h-3.5" />, 'text-sky-600')}
              {renderTodoGroup(eveningTodos, 'Вечер', <MoonIcon className="w-3.5 h-3.5" />, 'text-indigo-600')}
            </>
          )
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center text-sm py-8 border-2 border-dashed rounded-lg transition-colors ${isDragOver ? 'border-indigo-200 bg-indigo-50/50' : 'border-gray-100 text-gray-300'}`}>
            <p>{isDragOver ? 'Бросьте сюда' : 'Нет задач'}</p>
          </div>
        )}
      </div>

      {/* Input & Time/Tag Selector */}
      {!isSelectionMode && (
        <form onSubmit={handleSubmit} className={`p-3 bg-gray-50 border-t border-gray-100 rounded-b-xl mt-auto ${isFocused ? 'bg-white' : ''}`}>
            
            {/* Active Selection Indicator */}
            <div className="flex items-center justify-between mb-2 px-0.5 min-h-[20px]">
               <div className="flex items-center gap-2 text-xs text-gray-500">
                  {!isBacklog && (
                    <span className="font-medium">
                      {selectedTimeBlock === 'morning' ? 'Утро' : selectedTimeBlock === 'day' ? 'День' : 'Вечер'}
                    </span>
                  )}
                  {activeTag && (
                     <>
                      {!isBacklog && <span>•</span>}
                      <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded border ${COLOR_PALETTE[activeTag.color].bg} ${COLOR_PALETTE[activeTag.color].border} ${COLOR_PALETTE[activeTag.color].text}`}>
                        {activeTag.label}
                      </span>
                     </>
                  )}
               </div>
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-2 mb-2 px-1">
              {/* Time Block Selector - Hide in Backlog */}
              {!isBacklog && (
                <>
                  <div className="flex bg-gray-200 p-0.5 rounded-lg gap-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedTimeBlock('morning')}
                      className={`p-1 rounded-md transition-all ${selectedTimeBlock === 'morning' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Утро"
                    >
                      <MorningIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTimeBlock('day')}
                      className={`p-1 rounded-md transition-all ${selectedTimeBlock === 'day' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      title="День"
                    >
                      <SunIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTimeBlock('evening')}
                      className={`p-1 rounded-md transition-all ${selectedTimeBlock === 'evening' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Вечер"
                    >
                      <MoonIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="w-px h-6 bg-gray-200"></div>
                </>
              )}

              {/* Tag Selector (Compact) */}
              <div className="flex items-center gap-1 flex-1 overflow-x-auto scrollbar-hide mask-linear-right">
                 {tags.map(tag => {
                    const colors = COLOR_PALETTE[tag.color];
                    const isSelected = selectedTagId === tag.id;
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setSelectedTagId(isSelected ? null : tag.id)}
                        className={`
                          w-4 h-4 rounded-full border transition-all flex-shrink-0
                          ${colors.bg} ${colors.border}
                          ${isSelected ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110' : 'opacity-60 hover:opacity-100'}
                        `}
                        title={tag.label}
                      />
                    );
                 })}
              </div>
            </div>

            <div className="relative">
              <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isBacklog ? "Задача в бэклог..." : "Новая задача..."}
                  className="w-full pl-3 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-gray-400"
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
      )}
    </div>
  );
};

export default DayColumn;
