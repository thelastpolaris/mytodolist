
import React, { useState, useEffect, useMemo } from 'react';
import { Todo, DayOfWeek, DAYS_OF_WEEK, ALL_COLUMNS, TimeBlock, Tag, COLOR_PALETTE } from './types';
import { todoService } from './services/todoService';
import DayColumn from './components/DayColumn';
import TagManager from './components/TagManager';
import TodoModal from './components/TodoModal';
import { ListIcon, CursorArrowRaysIcon, XMarkIcon, TagIcon, CogIcon, ArchiveBoxIcon, ArrowsPointingInIcon } from './components/Icons';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTagFilterId, setActiveTagFilterId] = useState<string | 'all'>('all');
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [focusedDay, setFocusedDay] = useState<DayOfWeek | null>(null);

  // Initial Data Load
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [loadedTodos, loadedTags] = await Promise.all([
          todoService.getAll(),
          todoService.getTags()
        ]);
        setTodos(loadedTodos);
        setTags(loadedTags);
      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleAddTodo = async (text: string, day: DayOfWeek, timeBlock: TimeBlock, tagId: string | null) => {
    try {
      const newTodo = await todoService.add(text, day, timeBlock, tagId);
      setTodos(prev => [...prev, newTodo]); 
    } catch (error) {
      console.error('Error adding todo', error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    try {
      await todoService.toggle(id);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ));
    } catch (error) {
      console.error('Error toggling todo', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await todoService.delete(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo', error);
    }
  };

  const handleUpdateTodo = async (updatedTodo: Todo) => {
    try {
      await todoService.update(updatedTodo);
      setTodos(prev => prev.map(t => t.id === updatedTodo.id ? updatedTodo : t));
    } catch (error) {
      console.error('Error updating todo', error);
    }
  };

  const handleDropTodo = async (todoId: string, targetDay: DayOfWeek) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo || todo.day === targetDay) return;

    setTodos(prev => prev.map(t => 
      t.id === todoId ? { ...t, day: targetDay } : t
    ));

    try {
      await todoService.updateDay(todoId, targetDay);
    } catch (error) {
      console.error('Error moving todo', error);
    }
  };

  const handleMoveAll = async (sourceDay: DayOfWeek, targetDay: DayOfWeek) => {
    const todosToMove = todos.filter(t => t.day === sourceDay && !t.completed);
    if (todosToMove.length === 0) return;
    const idsToMove = todosToMove.map(t => t.id);

    setTodos(prev => prev.map(t => 
      idsToMove.includes(t.id) ? { ...t, day: targetDay } : t
    ));

    try {
      await todoService.moveBatch(idsToMove, targetDay);
    } catch (error) {
      console.error('Error moving batch todos', error);
    }
  };

  // Selection Mode Handlers
  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev);
    setSelectedIds([]); // Reset selection when toggling
  };

  const handleSelectTodo = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleMoveSelected = async (targetDay: DayOfWeek) => {
    if (selectedIds.length === 0) return;

    setTodos(prev => prev.map(t => 
      selectedIds.includes(t.id) ? { ...t, day: targetDay } : t
    ));

    try {
      await todoService.moveBatch(selectedIds, targetDay);
      setSelectedIds([]);
      setIsSelectionMode(false);
    } catch (error) {
      console.error('Error moving selected todos', error);
    }
  };

  // Tag Management
  const handleSaveTags = async (newTags: Tag[]) => {
    try {
      await todoService.saveTags(newTags);
      setTags(newTags);
    } catch (error) {
      console.error('Failed to save tags', error);
    }
  };

  // Filtering
  const filteredTodos = useMemo(() => {
    if (activeTagFilterId === 'all') return todos;
    return todos.filter(todo => todo.tagId === activeTagFilterId);
  }, [todos, activeTagFilterId]);

  // Stats: Only count Today's tasks
  const stats = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('ru-RU', { weekday: 'long' });
    // Capitalize first letter to match DayOfWeek type (e.g., "понедельник" -> "Понедельник")
    const todayName = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);
    
    const todayTodos = todos.filter(t => t.day === todayName);
    
    return {
      total: todayTodos.length,
      completed: todayTodos.filter(t => t.completed).length
    };
  }, [todos]);

  const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  const shortDays = DAYS_OF_WEEK.map(day => ({
    full: day,
    short: day.substring(0, 2).toUpperCase()
  }));

  const editingTodo = useMemo(() => 
    todos.find(t => t.id === editingTodoId), 
    [todos, editingTodoId]
  );

  const getShortName = (day: string) => {
    const map: Record<string, string> = {
      'Backlog': 'Бэклог',
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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24">
      {isTagManagerOpen && (
        <TagManager 
          tags={tags} 
          onSaveTags={handleSaveTags} 
          onClose={() => setIsTagManagerOpen(false)} 
        />
      )}

      {editingTodo && (
        <TodoModal
          todo={editingTodo}
          tags={tags}
          onClose={() => setEditingTodoId(null)}
          onSave={handleUpdateTodo}
          onDelete={handleDeleteTodo}
        />
      )}

      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Title and Global Actions */}
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm shadow-indigo-200">
                <ListIcon className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-800 hidden sm:block">Моя Неделя</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Selection Mode Toggle */}
              <button
                onClick={toggleSelectionMode}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                  ${isSelectionMode 
                    ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-1' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <CursorArrowRaysIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{isSelectionMode ? 'Готово' : 'Выбрать'}</span>
              </button>

              {/* Progress Bar */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-indigo-600">{stats.completed}</span> / {stats.total} сегодня
                </div>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden ring-1 ring-gray-100">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Filters */}
          <div className="pb-3 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                 <TagIcon className="w-3.5 h-3.5" />
                 Фильтр:
              </span>
              
              <button
                onClick={() => setActiveTagFilterId('all')}
                className={`
                   px-3 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap
                   ${activeTagFilterId === 'all' 
                     ? 'bg-gray-800 text-white border-gray-800' 
                     : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                   }
                `}
              >
                Все задачи
              </button>

              {tags.map(tag => {
                 const isActive = activeTagFilterId === tag.id;
                 const colors = COLOR_PALETTE[tag.color];
                 return (
                   <button
                     key={tag.id}
                     onClick={() => setActiveTagFilterId(isActive ? 'all' : tag.id)}
                     className={`
                        px-3 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 whitespace-nowrap
                        ${isActive 
                          ? `${colors.bg} ${colors.text} ${colors.border} ring-1 ring-offset-1 ring-current` 
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }
                     `}
                   >
                     <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-current' : colors.dot}`}></span>
                     {tag.label}
                   </button>
                 );
              })}
            </div>

            <button
              onClick={() => setIsTagManagerOpen(true)}
              className="ml-4 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors flex-shrink-0"
              title="Настроить теги"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Selection Floating Bar */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto sm:min-w-[600px] z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-gray-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-4 justify-between">
            
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start border-b sm:border-b-0 border-white/10 pb-3 sm:pb-0">
              <span className="font-semibold whitespace-nowrap pl-1">
                Выбрано: {selectedIds.length}
              </span>
              <button 
                onClick={toggleSelectionMode}
                className="p-1 hover:bg-white/20 rounded-full sm:hidden"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide mask-linear">
              <span className="text-sm text-gray-400 whitespace-nowrap mr-2 hidden sm:inline">Перенести в:</span>
              
              <button
                  onClick={() => handleMoveSelected('Backlog')}
                  disabled={selectedIds.length === 0}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-gray-700 hover:text-white text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap flex items-center gap-2"
                  title="В Бэклог"
                >
                  <ArchiveBoxIcon className="w-4 h-4" />
              </button>
              
              {shortDays.map(({ full, short }) => (
                <button
                  key={full}
                  onClick={() => handleMoveSelected(full)}
                  disabled={selectedIds.length === 0}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-indigo-50 hover:text-indigo-700 hover:bg-opacity-100 text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {short}
                </button>
              ))}
            </div>

            <button 
               onClick={toggleSelectionMode}
               className="hidden sm:flex p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
             >
               <XMarkIcon className="w-5 h-5" />
             </button>
          </div>
        </div>
      )}

      <main className="max-w-[1800px] mx-auto px-2 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <span className="text-sm">Загрузка задач...</span>
            </div>
          </div>
        ) : (
          <>
            {focusedDay ? (
               // Focused Single Column View
               <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-300">
                 {/* Focused Navigation */}
                 <div className="flex items-center justify-between mb-6 bg-white p-2 rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                    <button 
                      onClick={() => setFocusedDay(null)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                    >
                      <ArrowsPointingInIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Обзор</span>
                    </button>
                    
                    <div className="w-px h-6 bg-gray-200 mx-2 flex-shrink-0"></div>
                    
                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                      {ALL_COLUMNS.map(day => {
                         const isSelected = focusedDay === day;
                         const isBacklog = day === 'Backlog';
                         return (
                            <button
                              key={day}
                              onClick={() => setFocusedDay(day)}
                              className={`
                                px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0
                                ${isSelected 
                                  ? 'bg-indigo-600 text-white shadow-md' 
                                  : 'text-gray-500 hover:bg-gray-50'
                                }
                              `}
                            >
                               {isBacklog ? <ArchiveBoxIcon className="w-4 h-4" /> : getShortName(day)}
                            </button>
                         );
                      })}
                    </div>
                 </div>

                 {/* Single Focused Column */}
                 <DayColumn
                    day={focusedDay}
                    todos={filteredTodos.filter(t => t.day === focusedDay)}
                    tags={tags}
                    onAddTodo={handleAddTodo}
                    onToggleTodo={handleToggleTodo}
                    onDeleteTodo={handleDeleteTodo}
                    onDropTodo={handleDropTodo}
                    onMoveAll={handleMoveAll}
                    isSelectionMode={isSelectionMode}
                    selectedIds={selectedIds}
                    onSelectTodo={handleSelectTodo}
                    onEditTodo={(todo) => setEditingTodoId(todo.id)}
                    onFocus={() => {}} // Already focused
                    isFocused={true}
                 />
               </div>
            ) : (
              // Overview Grid View
              <div className="flex overflow-x-auto pb-8 gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible animate-in fade-in duration-300">
                {ALL_COLUMNS.map((day) => (
                  <DayColumn
                    key={day}
                    day={day}
                    todos={filteredTodos.filter(t => t.day === day)}
                    tags={tags}
                    onAddTodo={handleAddTodo}
                    onToggleTodo={handleToggleTodo}
                    onDeleteTodo={handleDeleteTodo}
                    onDropTodo={handleDropTodo}
                    onMoveAll={handleMoveAll}
                    isSelectionMode={isSelectionMode}
                    selectedIds={selectedIds}
                    onSelectTodo={handleSelectTodo}
                    onEditTodo={(todo) => setEditingTodoId(todo.id)}
                    onFocus={() => setFocusedDay(day)}
                    isFocused={false}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
