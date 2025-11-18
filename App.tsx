import React, { useState, useEffect, useMemo } from 'react';
import { Todo, FilterType } from './types';
import { todoService } from './services/todoService';
import TodoItem from './components/TodoItem';
import FilterTabs from './components/FilterTabs';
import { PlusIcon, ListIcon } from './components/Icons';

const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>(FilterType.ALL);
  const [inputValue, setInputValue] = useState('');
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
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    try {
      const newTodo = await todoService.add(inputValue.trim());
      setTodos(prev => [newTodo, ...prev]);
      setInputValue('');
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

  // Derived State
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case FilterType.ACTIVE:
        return todos.filter(t => !t.completed);
      case FilterType.COMPLETED:
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(() => ({
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  }), [todos]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-md mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl text-white">
              <ListIcon className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">Мои Задачи</h1>
          <p className="text-gray-500 text-lg">Организуйте свой день эффективно</p>
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-indigo-50">
          <form onSubmit={handleAddTodo} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Что нужно сделать?"
              className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Добавить</span>
            </button>
          </form>
        </div>

        {/* Filters & List */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 min-h-[400px] flex flex-col">
          <FilterTabs 
            currentFilter={filter} 
            setFilter={setFilter} 
            counts={stats}
          />

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Загрузка...
            </div>
          ) : filteredTodos.length > 0 ? (
            <div className="space-y-1">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onDelete={handleDeleteTodo}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
              <div className="bg-gray-50 p-4 rounded-full mb-4">
                <ListIcon className="w-12 h-12 text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-500">
                {filter === FilterType.COMPLETED 
                  ? 'Нет выполненных задач' 
                  : filter === FilterType.ACTIVE 
                    ? 'Нет активных задач'
                    : 'Список задач пуст'}
              </p>
              <p className="text-sm mt-2">
                {filter === FilterType.ALL && 'Добавьте новую задачу, чтобы начать!'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Нажмите на задачу, чтобы отметить как выполненную</p>
        </div>
      </div>
    </div>
  );
};

export default App;