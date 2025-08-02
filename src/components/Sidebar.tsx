import React from 'react';
import { PlusCircle, Clock, BookOpen, Menu, ChevronDown, ChevronUp, Building2, Users, Star, Code, MessageSquare, ExternalLink, Home, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SettingsModal } from './SettingsModal';

interface Thread {
  id: string;
  title: string;
  isFavorite?: boolean;
}

interface SidebarProps {
  onNewThread: () => void;
  selectedThread: string | null;
  threads: Thread[];
  onSelectThread?: (threadId: string) => void;
  mode: 'internal' | 'customer';
  onShowTopics: () => void;
  showTopics: boolean;
  onShowCustomerLogs: () => void;
  onGoHome: () => void;
}

export function Sidebar({ 
  onNewThread, 
  selectedThread, 
  threads, 
  onSelectThread, 
  mode,
  onShowTopics,
  showTopics,
  onShowCustomerLogs,
  onGoHome
}: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState(() => {
    return window.innerWidth >= 768;
  });
  const [showAllHistory, setShowAllHistory] = React.useState(false);
  const [showEmbedCode, setShowEmbedCode] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const favoriteThreads = threads.filter(t => t.isFavorite);
  const nonFavoriteThreads = threads.filter(t => !t.isFavorite);
  const recentThreads = nonFavoriteThreads.slice(0, 5);
  const olderThreads = nonFavoriteThreads.slice(5);
  const hasOlderThreads = olderThreads.length > 0;

  const handleThreadSelect = (threadId: string) => {
    if (onSelectThread) {
      onSelectThread(threadId);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    }
  };

  const handleShowCustomerLogs = () => {
    onShowCustomerLogs();
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 p-2 bg-gray-800 text-white rounded-lg md:hidden z-50"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className={`
        fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 ease-in-out z-40
        ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex-shrink-0">
            <button
              onClick={onGoHome}
              className="w-full mb-6 text-center"
            >
              <div className="mb-2 py-2 px-4">
                <h1 className="text-xl font-bold text-white">大平シールGPT</h1>
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                {mode === 'internal' ? (
                  <Building2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Users className="w-4 h-4 text-blue-500" />
                )}
                <span>
                  {mode === 'internal' ? '社内用チャット' : 'お客様用チャット'}
                </span>
              </div>
            </button>
            
            <button
              onClick={onNewThread}
              className="w-full flex items-center gap-2 p-2.5 mb-4 text-sm rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>新しいスレッド</span>
            </button>

            <button
              onClick={onGoHome}
              className="w-full flex items-center gap-2 p-2.5 mb-4 text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>ホーム</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
            {favoriteThreads.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                  <Star className="w-3 h-3" />
                  <span>お気に入り</span>
                </div>
                <div className="space-y-1">
                  {favoriteThreads.map(thread => (
                    <button
                      key={thread.id}
                      onClick={() => handleThreadSelect(thread.id)}
                      className={`w-full text-left p-2 text-sm rounded-lg hover:bg-gray-800 transition-colors
                        ${selectedThread === thread.id ? 'bg-gray-800' : ''}`}
                    >
                      <span className="line-clamp-1">{thread.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
                <Clock className="w-3 h-3" />
                <span>履歴</span>
              </div>
              <div className="space-y-1">
                {recentThreads.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => handleThreadSelect(thread.id)}
                    className={`w-full text-left p-2 text-sm rounded-lg hover:bg-gray-800 transition-colors
                      ${selectedThread === thread.id ? 'bg-gray-800' : ''}`}
                  >
                    <span className="line-clamp-1">{thread.title}</span>
                  </button>
                ))}

                {hasOlderThreads && (
                  <div className="mt-2">
                    <button
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className="w-full flex items-center justify-between p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <span className="text-xs">過去の履歴を{showAllHistory ? '隠す' : '表示'}</span>
                      {showAllHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    
                    {showAllHistory && (
                      <div className="mt-1 max-h-48 overflow-y-auto custom-scrollbar">
                        <div className="space-y-1 pr-1">
                          {olderThreads.map(thread => (
                            <button
                              key={thread.id}
                              onClick={() => handleThreadSelect(thread.id)}
                              className={`w-full text-left p-1.5 text-xs rounded hover:bg-gray-800 transition-colors
                                ${selectedThread === thread.id ? 'bg-gray-800' : ''}`}
                            >
                              <span className="line-clamp-2 leading-tight">{thread.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={onShowTopics}
                className={`w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors ${
                  showTopics ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>トピック集</span>
              </button>

              {mode === 'customer' && (
                <button
                  onClick={handleShowCustomerLogs}
                  className="w-full flex items-center gap-2 p-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>お客様チャットログ</span>
                </button>
              )}

              {mode === 'internal' && (
                <button
                  onClick={handleShowCustomerLogs}
                  className="w-full flex items-center gap-2 p-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>お客様チャットログ</span>
                </button>
              )}

              <Link
                to="/customer"
                target="_blank"
                className="w-full flex items-center gap-2 p-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>お客様用チャット</span>
              </Link>

              <button
                onClick={() => setShowEmbedCode(!showEmbedCode)}
                className={`w-full flex items-center gap-2 p-2 text-sm rounded-lg transition-colors ${
                  showEmbedCode ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>埋め込みコード</span>
              </button>
            </div>
          </div>
          
          <div className="flex-shrink-0 p-4 space-y-1 border-t border-gray-700">
            <button
              onClick={() => setShowSettings(true)}
              className="w-full flex items-center gap-2 p-2 text-sm text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>設定</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 p-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>ログアウト</span>
            </button>

            {showEmbedCode && (
              <div className="mt-3 p-3 bg-gray-800 rounded-lg">
                <h3 className="text-xs font-medium mb-2">埋め込みコード</h3>
                <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
                  {`<iframe
  src="${window.location.origin}/embedded"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 8px;"
></iframe>`}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
