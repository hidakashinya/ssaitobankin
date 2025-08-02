import React from 'react';
import { Search, Building2, Users } from 'lucide-react';

interface WelcomeScreenProps {
  onSend: (message: string) => void;
  mode: 'internal' | 'customer';
}

export function WelcomeScreen({ onSend, mode }: WelcomeScreenProps) {
  const [message, setMessage] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="flex items-center gap-3 mb-2">
        {mode === 'internal' ? (
          <Building2 className="w-8 h-8 text-green-500" />
        ) : (
          <Users className="w-8 h-8 text-blue-500" />
        )}
        <h1 className="text-3xl font-bold">
          {mode === 'internal' ? '社内用チャットボット' : 'お客様用チャットボット'}
        </h1>
      </div>
      <p className="text-gray-600 mb-8">
        {mode === 'internal' ? 
          '社内の情報やサポートについて質問してください' : 
          'サービスに関する質問にお答えします'}
      </p>
      
      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={mode === 'internal' ? 
              '社内の質問や相談を入力してください...' : 
              'サービスについて質問してください...'}
            className="w-full p-4 pr-12 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </form>
    </div>
  );
}