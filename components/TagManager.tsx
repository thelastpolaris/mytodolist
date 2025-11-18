
import React, { useState } from 'react';
import { Tag, COLOR_PALETTE, ColorKey } from '../types';
import { XMarkIcon, TrashIcon, PlusIcon, CheckIcon } from './Icons';

interface TagManagerProps {
  tags: Tag[];
  onSaveTags: (tags: Tag[]) => void;
  onClose: () => void;
}

const TagManager: React.FC<TagManagerProps> = ({ tags, onSaveTags, onClose }) => {
  const [localTags, setLocalTags] = useState<Tag[]>(tags);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState<ColorKey>('slate');

  const handleAddTag = () => {
    const newTag: Tag = {
      id: Date.now().toString(),
      label: 'Новый тег',
      color: 'slate'
    };
    setLocalTags([...localTags, newTag]);
    setEditingId(newTag.id);
    setEditLabel('Новый тег');
    setEditColor('slate');
  };

  const handleDeleteTag = (id: string) => {
    const updatedTags = localTags.filter(t => t.id !== id);
    setLocalTags(updatedTags);
    if (editingId === id) {
        setEditingId(null);
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingId(tag.id);
    setEditLabel(tag.label);
    setEditColor(tag.color);
  };

  const saveEditing = () => {
    if (editingId) {
      setLocalTags(localTags.map(t => 
        t.id === editingId 
          ? { ...t, label: editLabel, color: editColor } 
          : t
      ));
      setEditingId(null);
    }
  };

  const handleSaveAndClose = () => {
    // Calculate final state explicitly to handle pending edits immediately
    let finalTags = [...localTags];
    
    if (editingId) {
      finalTags = finalTags.map(t => 
        t.id === editingId 
          ? { ...t, label: editLabel, color: editColor } 
          : t
      );
    }

    onSaveTags(finalTags);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Настройка тегов</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-3">
            {localTags.map(tag => (
              <div key={tag.id} className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100 transition-all">
                {editingId === tag.id ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
                        placeholder="Название тега"
                        autoFocus
                      />
                      <button 
                        onClick={saveEditing}
                        className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Color Palette */}
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(COLOR_PALETTE) as ColorKey[]).map(color => (
                        <button
                          key={color}
                          onClick={() => setEditColor(color)}
                          className={`
                            w-6 h-6 rounded-full border-2 transition-all
                            ${COLOR_PALETTE[color].bg.replace('bg-', 'bg-')}
                            ${editColor === color ? 'border-indigo-600 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}
                          `}
                        >
                           <div className={`w-full h-full rounded-full opacity-50 ${COLOR_PALETTE[color].dot}`}></div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${COLOR_PALETTE[tag.color].bg} ${COLOR_PALETTE[tag.color].text} border ${COLOR_PALETTE[tag.color].border}`}>
                      <span className={`w-2 h-2 rounded-full ${COLOR_PALETTE[tag.color].dot}`}></span>
                      <span className="font-medium text-sm">{tag.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => startEditing(tag)}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                      >
                        Изменить
                      </button>
                      <button 
                        onClick={() => handleDeleteTag(tag.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleAddTag}
            className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            Создать новый тег
          </button>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
           <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSaveAndClose}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all"
          >
            Сохранить изменения
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagManager;
