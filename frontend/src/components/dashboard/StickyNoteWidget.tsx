import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StickyNote, Maximize2, X, Plus, Trash2, Pin, PinOff,
  Bold, Italic, List, ListOrdered, CheckSquare, Loader2, Save, Menu
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { motion, AnimatePresence } from 'framer-motion';
import { AxiosInstance } from '../../axios/axiosInstance';
import InfoTooltip from '../ui/InfoTooltip';

interface Note {
  id: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const StickyNoteWidget: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert focus:outline-none max-w-none h-full min-h-[120px]',
      },
    },
    onUpdate: ({ editor }) => {
      if (!activeNoteId) return;
      const html = editor.getHTML();
      setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, content: html } : n));
      setIsDirty(true);
    },
  });

  const saveNote = useCallback(async () => {
    if (!activeNoteId || !isDirty) return;
    const note = notes.find(n => n.id === activeNoteId);
    if (!note) return;
    setIsSaving(true);
    try {
      await AxiosInstance.patch(`/notes/${activeNoteId}`, {
        title: note.title,
        content: note.content,
      });
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setIsSaving(false);
    }
  }, [activeNoteId, isDirty, notes]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await AxiosInstance.get('/notes');
      const fetched: Note[] = res.data.data || [];
      setNotes(fetched);
      if (fetched.length > 0 && !activeNoteId) {
        setActiveNoteId(fetched[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (editor && activeNote) {
      const currentContent = editor.getHTML();
      if (currentContent !== activeNote.content) {
        editor.commands.setContent(activeNote.content || '');
      }
    } else if (editor && !activeNote) {
      editor.commands.setContent('');
    }
    setIsDirty(false);
  }, [activeNoteId, editor]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMaximized) setIsMaximized(false);
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNote();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMaximized, saveNote]);

  const handleSwitchNote = useCallback(async (noteId: number) => {
    if (noteId === activeNoteId) {
      setIsSidebarOpen(false);
      return;
    }
    if (isDirty) await saveNote();
    setActiveNoteId(noteId);
    setIsSidebarOpen(false);
  }, [activeNoteId, isDirty, saveNote]);

  const handleCreateNote = async () => {
    if (isDirty) await saveNote();
    try {
      const res = await AxiosInstance.post('/notes', { title: 'Untitled', content: '' });
      const newNote: Note = res.data.data;
      setNotes(prev => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
      setTimeout(() => titleInputRef.current?.focus(), 100);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await AxiosInstance.delete(`/notes/${noteId}`);
      setNotes(prev => {
        const remaining = prev.filter(n => n.id !== noteId);
        if (activeNoteId === noteId) {
          setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const handleTogglePin = async (noteId: number) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const newPinned = !note.isPinned;
    setNotes(prev =>
      prev.map(n => n.id === noteId ? { ...n, isPinned: newPinned } : n)
        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
    );
    try {
      await AxiosInstance.patch(`/notes/${noteId}`, { isPinned: newPinned });
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeNoteId) return;
    const title = e.target.value;
    setNotes(prev => prev.map(n => n.id === activeNoteId ? { ...n, title } : n));
    setIsDirty(true);
  };

  if (!editor) return null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const MenuBar = () => (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-[var(--hover-bg)]'}`}
        style={{ color: editor.isActive('bold') ? undefined : 'var(--text-tertiary)' }}
      >
        <Bold size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-[var(--hover-bg)]'}`}
        style={{ color: editor.isActive('italic') ? undefined : 'var(--text-tertiary)' }}
      >
        <Italic size={14} />
      </button>
      <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border-primary)' }} />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-[var(--hover-bg)]'}`}
        style={{ color: editor.isActive('bulletList') ? undefined : 'var(--text-tertiary)' }}
      >
        <List size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-[var(--hover-bg)]'}`}
        style={{ color: editor.isActive('orderedList') ? undefined : 'var(--text-tertiary)' }}
      >
        <ListOrdered size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('taskList') ? 'bg-orange-500/20 text-orange-500' : 'hover:bg-[var(--hover-bg)]'}`}
        style={{ color: editor.isActive('taskList') ? undefined : 'var(--text-tertiary)' }}
      >
        <CheckSquare size={14} />
      </button>
      <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border-primary)' }} />
      <button
        onClick={saveNote}
        disabled={!isDirty || isSaving}
        className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 ${isDirty ? 'text-orange-500 hover:bg-orange-500/10' : 'opacity-30 cursor-default'}`}
        style={{ color: isDirty ? undefined : 'var(--text-tertiary)' }}
        title="Save (Ctrl+S)"
      >
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      </button>
      {isDirty && (
        <span className="ml-1 text-[9px] font-bold text-orange-500/70">UNSAVED</span>
      )}
    </div>
  );

  const NotesList = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex flex-col ${compact ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
        <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: 'var(--text-tertiary)' }}>
          Notes ({notes.length})
        </span>
        <button
          onClick={handleCreateNote}
          className="p-1 rounded-lg hover:bg-orange-500/10 text-orange-500 transition-all active:scale-95"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-tertiary)' }} />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 px-4">
            <StickyNote size={24} className="mx-auto mb-2 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-xs opacity-50" style={{ color: 'var(--text-tertiary)' }}>No notes yet</p>
            <button
              onClick={handleCreateNote}
              className="mt-3 text-xs font-semibold text-orange-500 hover:text-orange-400 transition-colors"
            >
              Create your first note
            </button>
          </div>
        ) : (
          notes.map(note => (
            <button
              key={note.id}
              onClick={() => handleSwitchNote(note.id)}
              className={`w-full text-left px-3 py-2.5 border-b transition-all group ${note.id === activeNoteId
                  ? 'bg-orange-500/10 border-l-2 border-l-orange-500'
                  : 'hover:bg-[var(--hover-bg)]'
                }`}
              style={{ borderBottomColor: 'var(--border-primary)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {note.isPinned && <Pin size={10} className="text-orange-500 shrink-0" />}
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {note.title || 'Untitled'}
                    </p>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {formatDate(note.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id); }}
                    className="p-1 rounded hover:bg-orange-500/10 text-orange-500/60 hover:text-orange-500 transition-colors"
                  >
                    {note.isPinned ? <PinOff size={10} /> : <Pin size={10} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                    className="p-1 rounded hover:bg-red-500/10 text-red-400/60 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full h-[280px] relative pointer-events-none">
        <div className="w-full h-full rounded-2xl border border-dashed" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-tertiary)', opacity: 0.3 }} />

        <motion.div
          layout
          className={`pointer-events-auto rounded-2xl overflow-hidden shadow-sm border flex flex-col transition-shadow duration-300
              ${isMaximized
              ? 'fixed z-[200] inset-4 sm:inset-10 md:inset-16 shadow-2xl'
              : 'absolute inset-0 shadow-sm hover:shadow-md'
            }`}
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 shrink-0 select-none border-b"
            style={{ borderColor: 'var(--border-primary)' }}>
            <div className="flex items-center gap-2.5">
              {isMaximized && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="md:hidden p-1.5 hover:bg-orange-500/10 rounded-lg text-orange-500 transition-all active:scale-95"
                >
                  <Menu size={16} />
                </button>
              )}
              <div className={`p-1.5 rounded-lg bg-orange-500/10 text-orange-500 ${isMaximized ? 'hidden md:block' : ''}`}>
                <StickyNote size={13} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                Scratchpad
                <InfoTooltip
                  title="Scratchpad"
                  items={[
                    { color: '#f97316', label: 'Multiple Notes', desc: 'create notes with titles, all saved to the cloud' },
                    { color: '#8b5cf6', label: 'Rich Text', desc: 'bold, italic, bullet lists, numbered lists' },
                    { color: '#10b981', label: 'Checklists', desc: 'track tasks with interactive checkboxes' },
                    { color: '#3b82f6', label: 'Ctrl+S', desc: 'manual save to reduce API calls' },
                    { color: '#fbbf24', label: 'Pin', desc: 'pin important notes to keep them at the top' },
                  ]}
                />
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleCreateNote}
                className="p-1.5 hover:bg-orange-500/10 rounded-lg text-orange-500 transition-all active:scale-95"
                title="New note"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1.5 hover:bg-orange-500/10 rounded-lg text-orange-500 transition-all active:scale-95"
              >
                {isMaximized ? <X size={14} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          {isMaximized ? (
            <div className="flex-1 flex overflow-hidden relative">
              <div className="hidden md:flex w-[220px] shrink-0 border-r overflow-hidden flex-col" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
                <NotesList />
              </div>

              <AnimatePresence>
                {isSidebarOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="md:hidden absolute inset-0 z-10 bg-black/20 backdrop-blur-sm"
                      onClick={() => setIsSidebarOpen(false)}
                    />
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="md:hidden absolute left-0 top-0 bottom-0 w-[240px] z-20 border-r flex flex-col shadow-2xl"
                      style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}
                    >
                      <NotesList />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className="flex-1 flex flex-col overflow-hidden">
                {activeNote ? (
                  <>
                    <div className="px-6 pt-4 pb-2 shrink-0">
                      <input
                        ref={titleInputRef}
                        value={activeNote.title}
                        onChange={handleTitleChange}
                        placeholder="Note title..."
                        className="w-full text-lg font-bold bg-transparent border-none outline-none placeholder:opacity-30"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    </div>
                    <MenuBar />
                    <div className="flex-1 overflow-auto px-6 py-4 tiptap-container">
                      <EditorContent editor={editor} className="h-full max-w-3xl" />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <StickyNote size={32} className="mx-auto mb-3 opacity-10" style={{ color: 'var(--text-tertiary)' }} />
                      <p className="text-sm opacity-40" style={{ color: 'var(--text-tertiary)' }}>
                        {notes.length === 0 ? 'Create a note to get started' : 'Select a note'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {activeNote ? (
                <>
                  <div className="px-3 pt-2 pb-1 shrink-0 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                    <input
                      value={activeNote.title}
                      onChange={handleTitleChange}
                      placeholder="Note title..."
                      className="w-full text-xs font-bold bg-transparent border-none outline-none placeholder:opacity-30"
                      style={{ color: 'var(--text-primary)' }}
                    />
                  </div>
                  <MenuBar />
                  <div className="flex-1 overflow-auto p-3 tiptap-container">
                    <EditorContent editor={editor} className="h-full" />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center px-4">
                    <StickyNote size={24} className="mx-auto mb-2 opacity-15" style={{ color: 'var(--text-tertiary)' }} />
                    <button
                      onClick={handleCreateNote}
                      className="text-xs font-semibold text-orange-500 hover:text-orange-400 transition-colors"
                    >
                      Create a note
                    </button>
                  </div>
                </div>
              )}
              {notes.length > 1 && (
                <div className="px-2 py-1.5 border-t flex gap-1 overflow-x-auto shrink-0" style={{ borderColor: 'var(--border-primary)' }}>
                  {notes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => handleSwitchNote(note.id)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap transition-all shrink-0 ${note.id === activeNoteId
                          ? 'bg-orange-500/15 text-orange-500'
                          : 'hover:bg-[var(--hover-bg)]'
                        }`}
                      style={{ color: note.id === activeNoteId ? undefined : 'var(--text-secondary)' }}
                    >
                      {note.isPinned && '📌 '}{note.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {isMaximized && (
            <div className="py-1.5 text-center text-[9px] font-black uppercase tracking-[0.3em] opacity-20 pointer-events-none border-t"
              style={{ color: 'var(--text-primary)', borderColor: 'var(--border-primary)' }}>
              Press Esc to collapse
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {isMaximized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[150]"
            onClick={() => setIsMaximized(false)}
          />
        )}
      </AnimatePresence>

      <style>{`
        .tiptap-container .ProseMirror { min-height: 100%; color: var(--text-primary); outline: none; }
        .tiptap-container .ProseMirror p.is-editor-empty:first-child::before {
          content: 'Start writing...';
          float: left;
          color: var(--text-tertiary);
          pointer-events: none;
          height: 0;
          opacity: 0.4;
        }
        .tiptap-container .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; }
        .tiptap-container .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; }
        .tiptap-container .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        .tiptap-container .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          padding: 2px 0;
        }
        .tiptap-container .ProseMirror ul[data-type="taskList"] li > label {
          flex-shrink: 0;
          margin-top: 3px;
        }
        .tiptap-container .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          appearance: none;
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-secondary);
          border-radius: 4px;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
        }
        .tiptap-container .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked {
          background-color: #f97316;
          border-color: #f97316;
        }
        .tiptap-container .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"]:checked::after {
          content: '';
          position: absolute;
          left: 4px;
          top: 1px;
          width: 5px;
          height: 9px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .tiptap-container .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1;
        }
        .tiptap-container .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div p {
          text-decoration: line-through;
          opacity: 0.5;
        }
        .tiptap-container::-webkit-scrollbar { width: 4px; }
        .tiptap-container::-webkit-scrollbar-track { background: transparent; }
        .tiptap-container::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        [data-theme="dark"] .tiptap-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}</style>
    </>
  );
};

export default StickyNoteWidget;