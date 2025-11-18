
import React, { useState, useEffect } from 'react';
import { Todo, Tag, Subtask, DayOfWeek, DAYS_OF_WEEK, TimeBlock, COLOR_PALETTE, ALL_COLUMNS } from '../types';
import { 
  XMarkIcon, TrashIcon, CheckIcon, ChatBubbleLeftIcon, 
  ListBulletIcon, CalendarIcon, ClockIcon, TagIcon, 
  PlusIcon, MorningIcon, SunIcon, MoonIcon, ArchiveBoxIcon
} from './Icons';

interface TodoModalProps {
  todo: Todo;
  tags: Tag[];
  onClose: () => void;
  onSave: (updatedTodo: Todo) => void;
  onDelete: (id: string) => void;
}

const TodoModal: React.FC<TodoModalProps> = ({ todo, tags, onClose, onSave, onDelete }) => {
  const [text, setText] = useState(todo.text);
  const [description, setDescription] = useState(todo.description || '');
  const [day, setDay] = useState<DayOfWeek>(todo.day);
  const [timeBlock, setTimeBlock] = useState<TimeBlock>(todo.timeBlock);
  const [tagId, setTagId] = useState<string | null>(todo.tagId);
  const [subtasks, setSubtasks] = useState<Subtask[]>(todo.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSave = () => {
    const updatedTodo: Todo = {
      ...todo,
      text,
      description,
      day,
      timeBlock,
      tagId: tagId || '',
      subtasks
    };
    onSave(updatedTodo);
    onClose();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      text: newSubtaskText.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskText('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, completed: !st.completed } : st
    ));
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white sticky top-0 z-20">
          <div className="flex-1 mr-4">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full text-xl sm:text-2xl font-bold text-gray-800 placeholder-gray-300 border-none focus:ring-0 p-0 bg-transparent"
              placeholder="Название задачи"
              autoFocus
            />
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          
          {/* Left Column: Details */}
          <div className="flex-1 p-6 space-y-8 border-r border-gray-100">
            
            {/* Description */}
            <div>
               <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
                  Описание
               </div>
               <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Добавьте заметки, ссылки или подробности..."
                  className="w-full min-h-[120px] p-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
               />
            </div>

            {/* Subtasks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <ListBulletIcon className="w-5 h-5 text-gray-400" />
                    Подзадачи
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                   {subtasks.filter(st => st.completed).length}/{subtasks.length}
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                {subtasks.map(st => (
                  <div key={st.id} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => toggleSubtask(st.id)}
                      className={`
                        flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-all
                        ${st.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-gray-300 hover:border-indigo-400'}
                      `}
                    >
                      {st.completed && <CheckIcon className="w-3.5 h-3.5" />}
                    </button>
                    <span className={`flex-1 text-sm ${st.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                      {st.text}
                    </span>
                    <button
                      onClick={() => deleteSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubtask} className="relative">
                <input 
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Добавить подзадачу..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <PlusIcon className="w-5 h-5 text-gray-400 absolute left-2.5 top-2" />
              </form>
            </div>

          </div>

          {/* Right Sidebar: Meta Data */}
          <div className="w-full md:w-80 bg-gray-50/50 p-6 space-y-6">
            
            {/* Day Selector */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                <CalendarIcon className="w-4 h-4" /> День недели
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Backlog Option */}
                <button
                    onClick={() => setDay('Backlog')}
                    className={`
                      col-span-2 px-3 py-2 text-sm rounded-lg text-left transition-all border flex items-center gap-2
                      ${day === 'Backlog' 
                        ? 'bg-gray-700 border-gray-700 text-white shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                   <ArchiveBoxIcon className="w-4 h-4" />
                   Бэклог (Нераспределенное)
                </button>

                {DAYS_OF_WEEK.map(d => (
                  <button
                    key={d}
                    onClick={() => setDay(d)}
                    className={`
                      px-3 py-2 text-sm rounded-lg text-left transition-all border
                      ${day === d 
                        ? 'bg-white border-indigo-500 text-indigo-700 shadow-sm ring-1 ring-indigo-500' 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Block Selector - Hide if Backlog */}
            {day !== 'Backlog' && (
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  <ClockIcon className="w-4 h-4" /> Время
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'morning', label: 'Утро', icon: MorningIcon, color: 'text-amber-600' },
                    { id: 'day', label: 'День', icon: SunIcon, color: 'text-sky-600' },
                    { id: 'evening', label: 'Вечер', icon: MoonIcon, color: 'text-indigo-600' },
                  ].map(block => (
                    <button
                      key={block.id}
                      onClick={() => setTimeBlock(block.id as TimeBlock)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg border transition-all
                        ${timeBlock === block.id 
                          ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <block.icon className={`w-5 h-5 ${block.color}`} />
                      <span className={`text-sm font-medium ${timeBlock === block.id ? 'text-gray-900' : 'text-gray-600'}`}>
                        {block.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tag Selector */}
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                <TagIcon className="w-4 h-4" /> Тег
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                   onClick={() => setTagId(null)}
                   className={`
                     px-3 py-1.5 rounded-lg text-sm border transition-all
                     ${!tagId 
                       ? 'bg-gray-800 text-white border-gray-800' 
                       : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                     }
                   `}
                >
                  Нет
                </button>
                {tags.map(tag => {
                  const colors = COLOR_PALETTE[tag.color];
                  const isActive = tagId === tag.id;
                  return (
                    <button
                      key={tag.id}
                      onClick={() => setTagId(tag.id)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm border transition-all flex items-center gap-2
                        ${isActive 
                          ? `${colors.bg} ${colors.text} ${colors.border} ring-1 ring-current` 
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
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Удалить эту задачу?')) {
                onDelete(todo.id);
                onClose();
              }
            }}
            className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <TrashIcon className="w-4 h-4" />
            Удалить
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
            >
              Сохранить
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TodoModal;
