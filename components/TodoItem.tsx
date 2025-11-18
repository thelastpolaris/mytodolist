
import React from 'react';
import { Todo, Tag, COLOR_PALETTE } from '../types';
import { CheckIcon, TrashIcon, CheckCircleIcon, ListBulletIcon, ChatBubbleLeftIcon } from './Icons';

interface TodoItemProps {
  todo: Todo;
  tags: Tag[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit?: (todo: Todo) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ 
  todo, 
  tags,
  onToggle, 
  onDelete, 
  isSelectionMode,
  isSelected,
  onSelect,
  onEdit
}) => {
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (isSelectionMode) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('todoId', todo.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionMode) {
      e.preventDefault();
      onSelect(todo.id);
    } else if (onEdit) {
      onEdit(todo);
    }
  };

  // Resolve Tag
  const tag = tags.find(t => t.id === todo.tagId);
  const colorScheme = tag ? COLOR_PALETTE[tag.color] : null;

  // Indicators logic
  const hasDescription = todo.description && todo.description.trim().length > 0;
  const subtaskCount = todo.subtasks?.length || 0;
  const completedSubtasks = todo.subtasks?.filter(st => st.completed).length || 0;

  return (
    <div 
      draggable={!isSelectionMode}
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`
        group flex items-start gap-2 p-2.5 rounded-lg border transition-all duration-200 relative 
        ${!isSelectionMode && 'cursor-pointer hover:border-indigo-300'}
        ${isSelectionMode && 'cursor-pointer'}
        ${isSelected 
          ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' 
          : todo.completed 
            ? 'bg-gray-50 border-gray-100 opacity-75' 
            : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
        }
      `}
    >
      {/* Selection Mode Indicator OR Completion Checkbox */}
      {isSelectionMode ? (
        <div className={`
          flex-shrink-0 mt-0.5 flex items-center justify-center w-5 h-5 transition-colors
          ${isSelected ? 'text-indigo-600' : 'text-gray-300'}
        `}>
          {isSelected ? (
             <CheckCircleIcon className="w-6 h-6" />
          ) : (
             <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
          )}
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(todo.id);
          }}
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
      )}
      
      <div className="flex-1 min-w-0">
        <span 
          className={`
            text-sm block break-words leading-snug select-none mb-1.5
            ${todo.completed && !isSelected
              ? 'text-gray-400 line-through' 
              : 'text-gray-700'
            }
          `}
        >
          {todo.text}
        </span>
        
        <div className="flex flex-wrap items-center gap-2">
            {tag && colorScheme && (
            <span className={`
                inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border
                ${colorScheme.bg} ${colorScheme.text} ${colorScheme.border}
            `}>
                {tag.label}
            </span>
            )}

            {/* Indicators */}
            {(hasDescription || subtaskCount > 0) && (
               <div className="flex items-center gap-2 text-gray-400">
                  {hasDescription && (
                     <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
                  )}
                  {subtaskCount > 0 && (
                    <div className={`flex items-center gap-0.5 text-[10px] font-medium ${completedSubtasks === subtaskCount ? 'text-green-600' : ''}`}>
                       <ListBulletIcon className="w-3.5 h-3.5" />
                       <span>{completedSubtasks}/{subtaskCount}</span>
                    </div>
                  )}
               </div>
            )}
        </div>
      </div>

      {/* Hide delete button in selection mode to prevent accidental deletion */}
      {!isSelectionMode && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(todo.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 p-0.5 transition-opacity self-start"
          aria-label="Удалить"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default TodoItem;
