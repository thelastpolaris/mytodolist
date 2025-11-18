import { Todo } from '../types';

const STORAGE_KEY = 'todo_app_v1_data';

// Helper to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const todoService = {
  /**
   * Fetches all todos.
   * In the future, replace this with an API GET request.
   */
  getAll: (): Promise<Todo[]> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY);
      const todos: Todo[] = data ? JSON.parse(data) : [];
      // Simulate network delay for realism if desired, keeping it sync for MVP speed
      resolve(todos.sort((a, b) => b.createdAt - a.createdAt));
    });
  },

  /**
   * Adds a new todo.
   * In the future, replace with API POST request.
   */
  add: (text: string): Promise<Todo> => {
    return new Promise((resolve) => {
      const newTodo: Todo = {
        id: generateId(),
        text,
        completed: false,
        createdAt: Date.now(),
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
   * In the future, replace with API PUT/PATCH request.
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
   * In the future, replace with API DELETE request.
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
  }
};