import React, { useState, useEffect } from 'react';
import { Bot, User, Search, Calendar, ArrowDown, ArrowUp, MessageSquare, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatLog {
  id: string;
  query: string;
  answer: string;
  created_at: string;
  metadata: {
    user_info: {
      name?: string;
      email?: string;
    };
    total_messages: number;
  };
}

export function InternalChatLogs() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://ikdjnfxabgltmayfmsca.supabase.co/functions/v1/chat-internal-logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('チャットログの取得に失敗しました');
      }

      const data = await response.json();
      setLogs(data.messages);
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = searchTerm === '' ||
        log.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.answer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = dateFilter === '' ||
        new Date(log.created_at).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="flex h-screen bg-[#202123]">
      <div className="w-96 border-r border-gray-600/50 flex flex-col">
        <div className="p-6 border-b border-gray-600/50">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold text-white">社内チャットログ</h1>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="質問を検索..."
                className="w-full pl-10 pr-4 py-2 bg-[#343541] text-white border border-gray-600/50 rounded-lg placeholder-gray-400 focus:outline-none focus:border-gray-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            
            <div className="flex gap-2">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#343541] text-white border border-gray-600/50 rounded-lg focus:outline-none focus:border-gray-400"
              />
              
              <button
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="px-3 py-2 text-white border border-gray-600/50 rounded-lg hover:bg-[#343541] transition-colors"
              >
                {sortOrder === 'desc' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">
              {error}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              質問が見つかりません
            </div>
          ) : (
            <div className="divide-y divide-gray-600/50">
              {filteredLogs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className={`w-full text-left p-4 transition-colors ${
                    selectedLog?.id === log.id ? 'bg-[#343541]' : 'hover:bg-[#2A2B32]'
                  }`}
                >
                  <div className="font-medium text-white line-clamp-2 mb-2">
                    {log.query}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(log.created_at).toLocaleString('ja-JP')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedLog ? (
          <>
            <div className="p-6 border-b border-gray-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">会話の詳細</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(selectedLog.created_at).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <User className="w-5 h-5" />
                  <span>質問内容</span>
                </div>
                <div className="bg-[#2A2B32] rounded-lg p-4">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedLog.query}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Bot className="w-5 h-5" />
                  <span>回答内容</span>
                </div>
                <div className="bg-[#2A2B32] rounded-lg p-4">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedLog.answer}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" />
              <p>左側のリストから質問を選択してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
