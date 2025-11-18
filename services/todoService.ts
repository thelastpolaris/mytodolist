
import { Todo, DayOfWeek, DAYS_OF_WEEK, TimeBlock, Tag, DEFAULT_TAGS } from '../types';

const STORAGE_KEY_TODOS = 'todo_app_v1_data';
const STORAGE_KEY_TAGS = 'todo_app_v1_tags';

// Helper to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const todoService = {
  /**
   * TAG METHODS
   */
  getTags: (): Promise<Tag[]> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY_TAGS);
      if (data) {
        resolve(JSON.parse(data));
      } else {
        // Initialize defaults if empty
        localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(DEFAULT_TAGS));
        resolve(DEFAULT_TAGS);
      }
    });
  },

  saveTags: (tags: Tag[]): Promise<void> => {
    return new Promise((resolve) => {
      localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(tags));
      resolve();
    });
  },

  /**
   * TODO METHODS
   */
  getAll: (): Promise<Todo[]> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY_TODOS);
      let todos: any[] = data ? JSON.parse(data) : [];
      
      // Migration for existing data
      const todayIndex = (new Date().getDay() + 6) % 7;
      const todayName = DAYS_OF_WEEK[todayIndex];

      const migratedTodos: Todo[] = todos.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        createdAt: todo.createdAt,
        day: todo.day || todayName,
        timeBlock: todo.timeBlock || 'day',
        tagId: todo.tagId || (todo.tag && todo.tag !== 'none' ? todo.tag : null),
        estimatedTime: todo.estimatedTime || 0, // Default to 0
        description: todo.description || '',
        subtasks: todo.subtasks || []
      }));

      resolve(migratedTodos.sort((a, b) => b.createdAt - a.createdAt));
    });
  },

  add: (text: string, day: DayOfWeek, timeBlock: TimeBlock = 'day', tagId: string | null = null, estimatedTime: number = 0): Promise<Todo> => {
    return new Promise((resolve) => {
      const newTodo: Todo = {
        id: generateId(),
        text,
        completed: false,
        createdAt: Date.now(),
        day,
        timeBlock,
        tagId: tagId || '',
        estimatedTime,
        description: '',
        subtasks: []
      };
      
      const data = localStorage.getItem(STORAGE_KEY_TODOS);
      const currentTodos: Todo[] = data ? JSON.parse(data) : [];
      const updatedTodos = [newTodo, ...currentTodos];
      
      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(updatedTodos));
      resolve(newTodo);
    });
  },

  update: (updatedTodo: Todo): Promise<void> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY_TODOS);
      if (!data) return resolve();

      const currentTodos: Todo[] = JSON.parse(data);
      const newTodos = currentTodos.map(todo => 
        todo.id === updatedTodo.id ? updatedTodo : todo
      );

      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(newTodos));
      resolve();
    });
  },

  toggle: (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY_TODOS);
      if (!data) return resolve();

      const currentTodos: Todo[] = JSON.parse(data);
      const updatedTodos = currentTodos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );

      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(updatedTodos));
      resolve();
    });
  },

  delete: (id: string): Promise<void> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY_TODOS);
      if (!data) return resolve();

      const currentTodos: Todo[] = JSON.parse(data);
      const updatedTodos = currentTodos.filter(todo => todo.id !== id);

      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(updatedTodos));
      resolve();
    });
  },

  updateDay: (id: string, newDay: DayOfWeek): Promise<void> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY_TODOS);
      if (!data) return resolve();

      const currentTodos: Todo[] = JSON.parse(data);
      const updatedTodos = currentTodos.map(todo => 
        todo.id === id ? { ...todo, day: newDay } : todo
      );

      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(updatedTodos));
      resolve();
    });
  },

  moveBatch: (ids: string[], newDay: DayOfWeek): Promise<void> => {
    return new Promise((resolve) => {
      const data = localStorage.getItem(STORAGE_KEY_TODOS);
      if (!data) return resolve();

      const currentTodos: Todo[] = JSON.parse(data);
      const updatedTodos = currentTodos.map(todo => 
        ids.includes(todo.id) ? { ...todo, day: newDay } : todo
      );

      localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(updatedTodos));
      resolve();
    });
  }
};
