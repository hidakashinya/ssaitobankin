import React, { useState, useEffect } from 'react';
import { Star, Trash2, Download, Copy, MessageSquare, Calendar, Search, Filter } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSavedConversations, deleteConversation, updateConversationFavorite } from '../lib/conversations';

interface SavedConversation {
  id: string;
  title: string;
  mode: 'internal' | 'customer';
  messages: Array<{
    text: string;
    isBot: boolean;
    messageId?: string;
  }>;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export function SavedConversations() {
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SavedConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'internal' | 'customer' | 'favorites'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSavedConversations();
      setConversations(data.map(conv => ({
        ...conv,
        createdAt: conv.created_at,
        updatedAt: conv.updated_at
      })));
    } catch (error) {
      console.error('Error fetching saved conversations:', error);
      setError('保存された会話の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    try {
      await updateConversationFavorite(id, !conversation.isFavorite);
      setConversations(prev => 
        prev.map(c => 
          c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
        )
      );
      
      if (selectedConversation?.id === id) {
        setSelectedConversation(prev => 
          prev ? { ...prev, isFavorite: !prev.isFavorite } : null
        );
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      alert('お気に入り状態の更新に失敗しました');
    }
  };

  const handleDeleteConversation = async (id: string) => {
    if (!confirm('この会話を削除してもよろしいですか？')) return;

    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      
      if (selectedConversation?.id === id) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('会話の削除に失敗しました');
    }
  };

  const handleCopyConversation = (conversation: SavedConversation) => {
    const conversationText = conversation.messages
      .map(msg => `${msg.isBot ? 'アシスタント' : 'ユーザー'}: ${msg.text}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(conversationText);
    alert('会話をクリップボードにコピーしました');
  };

  const handleDownloadConversation = (conversation: SavedConversation) => {
    const conversationText = [
      `タイトル: ${conversation.title}`,
      `モード: ${conversation.mode === 'internal' ? '社内用' : 'お客様用'}`,
      `作成日: ${new Date(conversation.createdAt).toLocaleString('ja-JP')}`,
      `更新日: ${new Date(conversation.updatedAt).toLocaleString('ja-JP')}`,
      '',
      '--- 会話内容 ---',
      '',
      ...conversation.messages.map(msg => `${msg.isBot ? 'アシスタント' : 'ユーザー'}: ${msg.text}`)
    ].join('\n');

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `会話_${conversation.title}_${new Date(conversation.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredConversations = conversations
    .filter(conv => {
      const matchesSearch = searchTerm === '' || 
        conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.messages.some(msg => msg.text.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = 
        filterMode === 'all' ||
        (filterMode === 'favorites' && conv.isFavorite) ||
        (filterMode === 'internal' && conv.mode === 'internal') ||
        (filterMode === 'customer' && conv.mode === 'customer');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  if (selectedConversation) {
    return (
      <div className="flex flex-col h-screen bg-[#202123] text-white">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <button
            onClick={() => setSelectedConversation(null)}
            className="text-sm text-blue-400 hover:underline mb-4"
          >
            &larr; 一覧に戻る
          </button>
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold flex-1 pr-4">{selectedConversation.title}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggleFavorite(selectedConversation.id)}
                title={selectedConversation.isFavorite ? 'お気に入り解除' : 'お気に入り登録'}
                className="p-2 rounded-full hover:bg-gray-700"
              >
                <Star className={`w-5 h-5 ${selectedConversation.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
              </button>
              <button
                onClick={() => handleCopyConversation(selectedConversation)}
                title="コピー"
                className="p-2 rounded-full hover:bg-gray-700"
              >
                <Copy className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => handleDownloadConversation(selectedConversation)}
                title="ダウンロード"
                className="p-2 rounded-full hover:bg-gray-700"
              >
                <Download className="w-5 h-5 text-gray-400" />
              </button>
              <button
                onClick={() => handleDeleteConversation(selectedConversation.id)}
                title="削除"
                className="p-2 rounded-full hover:bg-gray-700"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2">
            更新: {new Date(selectedConversation.updatedAt).toLocaleString('ja-JP')}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="prose prose-invert max-w-none">
            {selectedConversation.messages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.isBot ? 'bot' : 'user'}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#202123] text-white">
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-6 h-6 text-white" />
          <h1 className="text-xl font-bold text-white">お客様チャットログ</h1>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="キーワードで検索..."
              className="w-full pl-10 pr-4 py-2 bg-[#343541] rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="px-3 py-2 bg-[#343541] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全て</option>
            <option value="favorites">お気に入り</option>
            <option value="internal">社内用</option>
            <option value="customer">お客様用</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center p-8">読み込み中...</div>
        ) : error ? (
          <div className="text-center p-8 text-red-400">{error}</div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center p-8 text-gray-500">該当する会話はありません。</div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {filteredConversations.map((conv) => (
              <li key={conv.id}>
                <button
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full text-left p-4 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-bold line-clamp-2 flex-1 pr-4">{conv.title}</p>
                    <div className="flex items-center flex-shrink-0">
                      {conv.isFavorite && <Star className="w-4 h-4 text-yellow-400 fill-current mr-2" />}
                      <span className={`text-xs px-2 py-1 rounded-full ${conv.mode === 'internal' ? 'bg-green-800' : 'bg-blue-800'}`}>
                        {conv.mode === 'internal' ? '社内' : 'お客様'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {new Date(conv.updatedAt).toLocaleString('ja-JP')}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 