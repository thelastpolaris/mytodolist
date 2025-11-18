import React, { useState, useEffect, useMemo } from 'react';
import { Todo, DayOfWeek, DAYS_OF_WEEK } from './types';
import { todoService } from './services/todoService';
import DayColumn from './components/DayColumn';
import { ListIcon } from './components/Icons';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      try {
        const data = await todoService.getAll();
        setTodos(data);
      } catch (error) {
        console.error('Failed to fetch todos', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);

  // Handlers
  const handleAddTodo = async (text: string, day: DayOfWeek) => {
    try {
      const newTodo = await todoService.add(text, day);
      setTodos(prev => [...prev, newTodo]); // Append to end for cleaner UI in columns
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

  const handleDropTodo = async (todoId: string, targetDay: DayOfWeek) => {
    // Check if todo is already in that day to prevent unnecessary updates
    const todo = todos.find(t => t.id === todoId);
    if (!todo || todo.day === targetDay) return;

    // Optimistic update for UI responsiveness
    setTodos(prev => prev.map(t => 
      t.id === todoId ? { ...t, day: targetDay } : t
    ));

    try {
      await todoService.updateDay(todoId, targetDay);
    } catch (error) {
      console.error('Error moving todo', error);
      // Revert on error would go here
    }
  };

  const handleMoveAll = async (sourceDay: DayOfWeek, targetDay: DayOfWeek) => {
    // Find all active todos in source day
    const todosToMove = todos.filter(t => t.day === sourceDay && !t.completed);
    if (todosToMove.length === 0) return;

    const idsToMove = todosToMove.map(t => t.id);

    // Optimistic update
    setTodos(prev => prev.map(t => 
      idsToMove.includes(t.id) ? { ...t, day: targetDay } : t
    ));

    try {
      await todoService.moveBatch(idsToMove, targetDay);
    } catch (error) {
      console.error('Error moving batch todos', error);
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: todos.length,
    completed: todos.filter(t => t.completed).length
  }), [todos]);

  const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm shadow-indigo-200">
              <ListIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">Моя Неделя</h1>
          </div>
          
          {/* Simple Progress Bar */}
          <div className="flex items-center gap-4">
             <div className="hidden sm:block text-sm text-gray-500">
               <span className="font-medium text-indigo-600">{stats.completed}</span> / {stats.total} выполнено
             </div>
             <div className="w-24 sm:w-32 h-2 bg-gray-100 rounded-full overflow-hidden ring-1 ring-gray-100">
               <div 
                 className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                 style={{ width: `${progress}%` }}
               />
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-2 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                <span className="text-sm">Загрузка задач...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {DAYS_OF_WEEK.map((day) => (
              <DayColumn
                key={day}
                day={day}
                todos={todos.filter(t => t.day === day)}
                onAddTodo={handleAddTodo}
                onToggleTodo={handleToggleTodo}
                onDeleteTodo={handleDeleteTodo}
                onDropTodo={handleDropTodo}
                onMoveAll={handleMoveAll}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;