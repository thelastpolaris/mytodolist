import React from 'react';
import { Todo } from '../types';
import { CheckIcon, TrashIcon } from './Icons';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('todoId', todo.id);
    e.dataTransfer.effectAllowed = 'move';
    // Optional: Set a custom drag image or transparency here if needed
  };

  return (
    <div 
      draggable
      onDragStart={handleDragStart}
      className={`
        group flex items-start gap-2 p-2.5 rounded-lg border transition-all duration-200 relative cursor-grab active:cursor-grabbing
        ${todo.completed 
          ? 'bg-gray-50 border-gray-100 opacity-75' 
          : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100'
        }
      `}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`
          flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 rounded border transition-all
          ${todo.completed
            ? 'bg-indigo-500 border-indigo-500 text-white'
            : 'bg-white border-gray-300 text-transparent hover:border-indigo-500'
          }
        `}
      >
        <CheckIcon className="w-3.5 h-3.5" />
      </button>
      
      <span 
        className={`
          text-sm flex-1 break-words leading-snug select-none
          ${todo.completed 
            ? 'text-gray-400 line-through' 
            : 'text-gray-700'
          }
        `}
        onClick={() => onToggle(todo.id)}
      >
        {todo.text}
      </span>

      <button
        onClick={() => onDelete(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-0.5 transition-opacity"
        aria-label="Удалить"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TodoItem;