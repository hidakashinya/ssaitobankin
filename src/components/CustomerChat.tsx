import React from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Bot, MessageSquare, Menu, Clock, X, Code } from 'lucide-react';

interface Message {
  text: string;
  isBot: boolean;
  messageId?: string;
  createdAt: Date;
}

interface ChatHistory {
  id: string;
  messages: Message[];
  createdAt: Date;
}

export function CustomerChat() {
  const [messages, setMessages] = React.useState<Message[]>([
    { text: 'こんにちは！何かお手伝いできることはありますか？', isBot: true }
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string>();
  const [chatHistory, setChatHistory] = React.useState<ChatHistory[]>(() => {
    const saved = localStorage.getItem('customer-chat-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [isMenuOpen, setIsMenuOpen] = React.useState(() => window.innerWidth >= 768);
  const [showEmbedCode, setShowEmbedCode] = React.useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = React.useState<number | null>(null);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMenuOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    localStorage.setItem('customer-chat-history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      setMessages(prev => [...prev, { text: message, isBot: false }]);

      const response = await fetch('/functions/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.isBot ? "assistant" : "user",
            content: msg.text
          })).concat([{ role: "user", content: message }]),
          conversation_id: conversationId || ""
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `APIリクエストに失敗しました: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.choices?.[0]?.message?.content) {
        throw new Error('APIレスポンスの形式が無効です');
      }

      setConversationId(data.conversation_id);
      
      setMessages(prev => {
        const newMessages = [
          ...prev,
          { text: data.choices[0].message.content, isBot: true, messageId: data.message_id }
        ];
        setTypingMessageIndex(newMessages.length - 1);
        return newMessages;
      });

      if (!conversationId) {
        const newHistory: ChatHistory = {
          id: data.conversation_id || Date.now().toString(),
          messages: [
            ...messages,
            { text: message, isBot: false },
            { text: data.choices[0].message.content, isBot: true, messageId: data.message_id }
          ],
          createdAt: new Date()
        };
        setChatHistory(prev => [newHistory, ...prev]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: error instanceof Error ? error.message : 'エラーが発生しました', 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistory = (history: ChatHistory) => {
    setMessages(history.messages);
    setConversationId(history.id);
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  const handleNewChat = () => {
    setMessages([{ text: 'こんにちは！何かお手伝いできることはありますか？', isBot: true }]);
    setConversationId(undefined);
    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  const handleTypewriterComplete = () => {
    setTypingMessageIndex(null);
  };

  return (
    <div className="flex h-screen bg-[#343541]">
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-4 left-4 p-2 bg-[#202123] text-white rounded-lg md:hidden z-30"
      >
        <Menu className="w-5 h-5" />
      </button>

      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div className={`fixed md:relative left-0 top-0 h-full bg-[#202123] transition-all duration-300 z-20 
        ${isMenuOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-16'}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-600/50">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-white" />
              {isMenuOpen && <span className="text-white font-bold text-xl">大平シールGPT</span>}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 p-3 mb-4 text-white rounded-lg border border-gray-600/50 hover:bg-gray-700/50 transition-colors"
            >
              <Bot className="w-5 h-5" />
              {isMenuOpen && <span>新しい会話</span>}
            </button>

            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 px-3 py-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {isMenuOpen && <span>会話履歴</span>}
                </div>
                {isMenuOpen && (
                  <div className="space-y-1">
                    {chatHistory.map(history => (
                      <button
                        key={history.id}
                        onClick={() => handleLoadHistory(history)}
                        className="w-full text-left p-2 text-gray-300 hover:bg-gray-700/50 rounded-md text-sm group transition-colors"
                      >
                        <div className="font-medium truncate">
                          {history.messages[1]?.text || '新しい会話'}
                        </div>
                        <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                          {new Date(history.createdAt).toLocaleString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  onClick={() => setShowEmbedCode(!showEmbedCode)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    showEmbedCode ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Code className="w-4 h-4" />
                  {isMenuOpen && <span>埋め込みコード</span>}
                </button>
              </div>
            </div>

            {isMenuOpen && showEmbedCode && (
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <h3 className="text-xs font-semibold text-white mb-2">埋め込みコード</h3>
                <pre className="text-xs bg-gray-100 text-gray-800 p-2 rounded overflow-x-auto">
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

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-4 text-gray-400 hover:text-white border-t border-gray-600/50 hidden md:block"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message.text} 
              isBot={message.isBot}
              useTypewriter={message.isBot && index === typingMessageIndex}
              onTypewriterComplete={handleTypewriterComplete}
              typewriterSpeed={20}
            />
          ))}
          {isLoading && (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="border-t border-gray-600/50 bg-[#343541] p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSend} disabled={isLoading} />
            <div className="text-center mt-2 text-xs text-gray-400">
              このチャットボットは一般的な質問にお答えします。個人情報は入力しないでください。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}