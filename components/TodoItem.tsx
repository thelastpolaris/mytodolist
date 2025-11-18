import React from 'react';
import { Todo } from '../types';
import { CheckIcon, TrashIcon } from './Icons';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <div 
      className={`
        group flex items-center justify-between p-4 mb-3 rounded-xl border transition-all duration-200
        ${todo.completed 
          ? 'bg-gray-50 border-gray-100 opacity-75' 
          : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100'
        }
      `}
    >
      <div className="flex items-center flex-1 gap-3">
        <button
          onClick={() => onToggle(todo.id)}
          className={`
            flex items-center justify-center w-6 h-6 rounded-full border transition-all
            ${todo.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 text-transparent hover:border-indigo-500'
            }
          `}
          aria-label="Переключить статус"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
        
        <span 
          className={`
            text-base sm:text-lg transition-all cursor-pointer
            ${todo.completed 
              ? 'text-gray-400 line-through' 
              : 'text-gray-700'
            }
          `}
          onClick={() => onToggle(todo.id)}
        >
          {todo.text}
        </span>
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-red-50 focus:opacity-100"
        aria-label="Удалить задачу"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default TodoItem;