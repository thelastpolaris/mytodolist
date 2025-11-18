import { Todo, DayOfWeek, DAYS_OF_WEEK } from '../types';

const STORAGE_KEY = 'todo_app_v1_data';

// Helper to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const todoService = {
  /**
   * Fetches all todos.
   */
  getAll: (): Promise<Todo[]> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      let todos: Todo[] = data ? JSON.parse(data) : [];
      
      // Migration for existing data without 'day' property
      // Assign them to today or Monday if specific logic is needed
      const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun
      const todayName = DAYS_OF_WEEK[todayIndex];

      todos = todos.map(todo => ({
        ...todo,
        day: todo.day || todayName // Fallback for old data
      }));

      resolve(todos.sort((a, b) => b.createdAt - a.createdAt));
    });
  },

  /**
   * Adds a new todo for a specific day.
   */
  add: (text: string, day: DayOfWeek): Promise<Todo> => {
    return new Promise((resolve) => {
      const newTodo: Todo = {
        id: generateId(),
        text,
        completed: false,
        createdAt: Date.now(),
        day,
      };
      
      const data = localStorage.getItem(STORAGE_KEY);
      const currentTodos: Todo[] = data ? JSON.parse(data) : [];
      const updatedTodos = [newTodo, ...currentTodos];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      resolve(newTodo);
    });
  },

  /**
   * Toggles completion status.
   */
  toggle: (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return resolve();

      const currentTodos: Todo[] = JSON.parse(data);
      const updatedTodos = currentTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      resolve();
    });
  },

  /**
   * Deletes a todo.
   */
  delete: (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return resolve();

      const currentTodos: Todo[] = JSON.parse(data);
      const updatedTodos = currentTodos.filter(todo => todo.id !== id);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      resolve();
    });
  },

  /**
   * Updates the day of a specific todo.
   */
  updateDay: (id: string, newDay: DayOfWeek): Promise<void> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return resolve();

      const currentTodos: Todo[] = JSON.parse(data);
      const updatedTodos = currentTodos.map(todo => 
        todo.id === id ? { ...todo, day: newDay } : todo
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      resolve();
    });
  },

  /**
   * Moves multiple todos to a new day.
   */
  moveBatch: (ids: string[], newDay: DayOfWeek): Promise<void> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return resolve();

      const currentTodos: Todo[] = JSON.parse(data);
      const updatedTodos = currentTodos.map(todo => 
        ids.includes(todo.id) ? { ...todo, day: newDay } : todo
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTodos));
      resolve();
    });
  }
};