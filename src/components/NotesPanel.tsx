import React from 'react';
import { X, Save, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

interface NotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotesPanel({ isOpen, onClose }: NotesPanelProps) {
  const [notes, setNotes] = React.useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('chat-notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [newNote, setNewNote] = React.useState({ title: '', content: '' });
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);

  React.useEffect(() => {
    localStorage.setItem('chat-notes', JSON.stringify(notes));
  }, [notes]);

  const handleAddNote = () => {
    if (newNote.title.trim() || newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title.trim() || '無題のメモ',
        content: newNote.content,
        createdAt: new Date(),
      };
      setNotes(prev => [note, ...prev]);
      setNewNote({ title: '', content: '' });
    }
  };

  const handleUpdateNote = (noteId: string) => {
    setNotes(prev => prev.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          title: newNote.title.trim() || note.title,
          content: newNote.content,
        };
      }
      return note;
    }));
    setEditingNoteId(null);
    setNewNote({ title: '', content: '' });
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNewNote({ title: note.title, content: note.content });
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('このメモを削除してもよろしいですか？')) {
      setNotes(prev => prev.filter(note => note.id !== noteId));
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setNewNote({ title: '', content: '' });
      }
    }
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-gray-50">
          <h2 className="text-lg font-semibold">メモ</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b">
          <input
            type="text"
            value={newNote.title}
            onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
            placeholder="タイトル"
            className="w-full p-2 mb-2 border rounded-lg"
          />
          <textarea
            value={newNote.content}
            onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
            placeholder="メモを入力..."
            className="w-full p-2 border rounded-lg h-32 resize-none"
          />
          <button
            onClick={() => editingNoteId ? handleUpdateNote(editingNoteId) : handleAddNote()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {editingNoteId ? '更新' : '保存'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {notes.map(note => (
            <div
              key={note.id}
              className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-medium">{note.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(note.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}