import React from 'react';
import { Sidebar } from './Sidebar';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { NotesPanel } from './NotesPanel';

export function MainApp() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          <ChatMessage />
        </div>
        <div className="p-4 border-t border-gray-200">
          <ChatInput />
        </div>
      </div>
      <NotesPanel />
    </div>
  );
}