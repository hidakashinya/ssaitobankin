import React, { useState, useEffect } from 'react';
import { Bot, User, Search, Calendar, ArrowDown, ArrowUp, X, MessageSquare, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../lib/supabase';

interface ChatLog {
  id: string;
  query: string;
  answer: string;
  created_at: string;
  metadata: {
    conversation_id?: string;
    message_id?: string;
    user_info?: {
      name?: string;
      email?: string;
    };
  };
  user_info?: {
    name?: string;
    email?: string;
  };
}

export function CustomerChatPage() {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<ChatLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    console.log('Fetching chat logs...');
    try {
      const { data: logsData, error: logsError } = await supabase
        .from('chat_logs')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data: logsData, error: logsError });

      if (logsError) {
        console.error('Error fetching logs:', logsError);
        throw new Error(logsError.message);
      }

      if (!logsData) {
        throw new Error('データが見つかりませんでした');
      }

      console.log('Successfully fetched logs:', logsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching logs:', error);
      console.log('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs
    .filter(log => {
      const matchesSearch = searchTerm === '' ||
        (log.query?.toLowerCase().includes(searchTerm.toLowerCase()) || 
         log.answer?.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });

  return (
    <div className="flex h-screen bg-[#202123]">
      {/* Left sidebar with question list */}
      <div className="w-96 border-r border-gray-600/50 flex flex-col">
        <div className="p-6 border-b border-gray-600/50">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="w-8 h-8 text-white" />
            <h1 className="text-xl font-bold text-white">お客様からの質問一覧</h1>
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
                  <div className="text-sm text-gray-400 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(log.created_at).toLocaleString('ja-JP')}</span>
                    </div>
                    {(log.user_info?.name || log.metadata?.user_info?.name) && (
                      <span className="text-gray-500">
                        {log.user_info?.name || log.metadata?.user_info?.name}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side content area */}
      <div className="flex-1 flex flex-col">
        {selectedLog ? (
          <>
            <div className="p-6 border-b border-gray-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">会話の詳細</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(selectedLog.created_at).toLocaleString('ja-JP')}
                    {selectedLog.metadata?.conversation_id && (
                      <span className="ml-2 text-gray-500">
                        ID: {selectedLog.metadata.conversation_id}
                      </span>
                    )}
                    {selectedLog.metadata?.message_id && (
                      <span className="ml-2 text-gray-500">
                        Message ID: {selectedLog.metadata.message_id}
                      </span>
                    )}
                  </p>
                </div>
                {(selectedLog.user_info?.name || selectedLog.metadata?.user_info?.name) && (
                  <div className="text-sm text-gray-400">
                    送信者: {selectedLog.user_info?.name || selectedLog.metadata?.user_info?.name}
                    {(selectedLog.user_info?.email || selectedLog.metadata?.user_info?.email) && (
                      <span className="ml-2">
                        ({selectedLog.user_info?.email || selectedLog.metadata?.user_info?.email})
                      </span>
                    )}
                  </div>
                )}
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