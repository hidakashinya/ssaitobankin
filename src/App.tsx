/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { TopicsPage } from "./components/TopicsPage";
import { Sidebar } from "./components/Sidebar";
import {
  Star,
  Copy,
  Download,
  Save,
  FileDown,
  Bot,
  User,
  Search,
  Calendar,
  ArrowDown,
  ArrowUp,
  Clock,
  MessageSquare,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import { EmbeddedChat } from "./pages/EmbeddedChat";
import { convertToMarkdown, downloadAsMarkdown } from "./lib/exportUtils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CustomerChat } from "./pages/CustomerChat";
import { LoginPage } from "./components/LoginPage";
import { SignupPage } from "./components/SignupPage";
import { AuthProvider, useAuth } from "./lib/auth";
import { ResetPasswordPage } from "./components/ResetPasswordPage";
import { InternalChatPage } from "./pages/InternalChatPage";

interface Message {
  text: string;
  isBot: boolean;
  messageId?: string;
}

interface Thread {
  id: string;
  title: string;
  messages: Message[];
  mode: "internal" | "customer";
  isFavorite?: boolean;
}

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

function MainApp() {
  const [showTopics, setShowTopics] = React.useState(false);
  const [selectedThread, setSelectedThread] = React.useState<string | null>(
    null
  );
  const [threads, setThreads] = React.useState<Thread[]>(() => {
    const savedThreads = localStorage.getItem("chat-threads");
    return savedThreads ? JSON.parse(savedThreads) : [];
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [chatMode, setChatMode] = React.useState<"internal" | "customer">(
    "internal"
  );
  const [showCustomerLogs, setShowCustomerLogs] = React.useState(false);
  const [customerLogs, setCustomerLogs] = React.useState<ChatLog[]>([]);
  const [selectedLog, setSelectedLog] = React.useState<ChatLog | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [dateFilter, setDateFilter] = React.useState("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [logsError, setLogsError] = React.useState<string | null>(null);
  const [isLoadingLogs, setIsLoadingLogs] = React.useState(false);
  const [typingMessageIndex, setTypingMessageIndex] = React.useState<number | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    localStorage.setItem("chat-threads", JSON.stringify(threads));
  }, [threads]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [threads, selectedThread]);

  const fetchCustomerLogs = async () => {
    setIsLoadingLogs(true);
    setLogsError(null);
    try {
      const { data, error } = await supabase
        .from("chat_logs")
        .select(
          `
          id,
          query,
          answer,
          created_at,
          metadata,
          user_info
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setCustomerLogs(
        data.map((log) => ({
          id: log.id,
          query: log.query,
          answer: log.answer,
          created_at: log.created_at,
          metadata: {
            user_info: log.user_info || {},
            total_messages: 1,
          },
        }))
      );
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogsError(
        error instanceof Error ? error.message : "エラーが発生しました"
      );
    } finally {
      setIsLoadingLogs(false);
    }
  };

  React.useEffect(() => {
    if (showCustomerLogs && customerLogs.length === 0) {
      fetchCustomerLogs();
    }
  }, [showCustomerLogs]);

  const filteredLogs = customerLogs
    .filter((log) => {
      const matchesSearch =
        searchTerm === "" ||
        log.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.answer.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate =
        dateFilter === "" ||
        new Date(log.created_at).toLocaleDateString() ===
          new Date(dateFilter).toLocaleDateString();

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleModeChange = (newMode: "internal" | "customer") => {
    setChatMode(newMode);
    setSelectedThread(null);
    setShowCustomerLogs(false);
    setSelectedLog(null);
  };

  const handleNewThread = (mode: "internal" | "customer" = chatMode) => {
    const newThread: Thread = {
      id: Date.now().toString(),
      title: "新しい会話",
      messages: [
        {
          text: "こんにちは！何かお手伝いできることはありますか？",
          isBot: true,
        },
      ],
      mode: mode,
      isFavorite: false,
    };
    setShowCustomerLogs(false);
    setShowTopics(false);
    setThreads((prev) => [newThread, ...prev]);
    setSelectedThread(newThread.id);
  };

  const handleToggleFavorite = async (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return { ...t, isFavorite: !t.isFavorite };
        }
        return t;
      })
    );
  };

  const handleCopyConversation = (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    const conversationText = thread.messages
      .map((msg) => `${msg.isBot ? "アシスタント" : "ユーザー"}: ${msg.text}`)
      .join("\n\n");

    navigator.clipboard.writeText(conversationText);
  };

  const handleDownloadConversation = (
    threadId: string,
    format: "text" | "markdown" = "text"
  ) => {
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) return;

    if (format === "markdown") {
      const markdown = convertToMarkdown(thread.messages, thread.title);
      downloadAsMarkdown(
        markdown,
        `会話_${thread.title}_${new Date().toISOString().split("T")[0]}`
      );
      return;
    }

    const conversationText = thread.messages
      .map((msg) => `${msg.isBot ? "アシスタント" : "ユーザー"}: ${msg.text}`)
      .join("\n\n");

    const blob = new Blob([conversationText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `会話_${thread.title}_${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentThread = threads.find((t) => t.id === selectedThread);

  const makeApiRequest = async (
    messages: Array<{ role: string; content: string }>,
    conversationId?: string,
    mode: "internal" | "customer" = "customer"
  ) => {
    const TIMEOUT_DURATION = 60000;
    const MAX_RETRIES = 3;
    let retryCount = 0;

    const makeRequest = async (): Promise<any> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, TIMEOUT_DURATION);

      try {
        const endpoint =
          mode === "internal"
            ? /* 絶対パスで修正 */
              "https://ikdjnfxabgltmayfmsca.supabase.co/functions/v1/chat-internal"
            : "https://ikdjnfxabgltmayfmsca.supabase.co/functions/v1/chat";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            /* 追加しました */
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages,
            conversation_id: conversationId || "",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          let errorMessage = `APIリクエストに失敗しました: ${response.status}`;
          try {
            if (data.error) {
              errorMessage = data.error;
            }
          } catch {
            console.error("Failed to parse error response:", data);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data?.choices?.[0]?.message?.content) {
          throw new Error("APIレスポンスの形式が無効です");
        }

        return {
          content: data.choices[0].message.content,
          messageId: data.message_id,
          conversationId: data.conversation_id,
          metadata: data.metadata,
        };
      } finally {
        clearTimeout(timeoutId);
      }
    };

    while (retryCount < MAX_RETRIES) {
      try {
        return await makeRequest();
      } catch (error) {
        retryCount++;

        if ((error as Error).name === "AbortError") {
          if (retryCount === MAX_RETRIES) {
            throw new Error("リクエストがタイムアウトしました");
          }
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
          continue;
        }

        throw error;
      }
    }

    throw new Error("リクエストの最大試行回数を超えました");
  };

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      if (!selectedThread) {
        const newThread: Thread = {
          id: Date.now().toString(),
          title: message,
          messages: [
            {
              text: "こんにちは！何かお手伝いできることはありますか？",
              isBot: true,
            },
            { text: message, isBot: false },
          ],
          mode: chatMode,
          isFavorite: false,
        };
        setThreads((prev) => [newThread, ...prev]);
        setSelectedThread(newThread.id);

        const response = await makeApiRequest(
          [{ role: "user", content: message }],
          undefined,
          chatMode
        );

        const botMessage = {
          text: response.content,
          isBot: true,
          messageId: response.messageId,
        };

        setThreads((prev) =>
          prev.map((thread) => {
            if (thread.id === newThread.id) {
              const updatedMessages = [...thread.messages, botMessage];
              setTypingMessageIndex(updatedMessages.length - 1);
              return {
                ...thread,
                conversationId: response.conversationId,
                messages: updatedMessages,
              };
            }
            return thread;
          })
        );
        return;
      }

      setThreads((prev) => {
        const updatedThreads = prev.map((thread) => {
          if (thread.id === selectedThread) {
            if (thread.messages.length === 1) {
              return {
                ...thread,
                title: message,
                messages: [...thread.messages, { text: message, isBot: false }],
              };
            }
            return {
              ...thread,
              messages: [...thread.messages, { text: message, isBot: false }],
            };
          }
          return thread;
        });

        const activeThread = updatedThreads.find(t => t.id === selectedThread);
        const otherThreads = updatedThreads.filter(t => t.id !== selectedThread);
        
        return activeThread ? [activeThread, ...otherThreads] : updatedThreads;
      });

      const threadMessages =
        currentThread?.messages.map((msg) => ({
          role: msg.isBot ? "assistant" : "user",
          content: msg.text,
        })) || [];

      const response = await makeApiRequest(
        [...threadMessages, { role: "user", content: message }],
        currentThread?.conversationId,
        currentThread?.mode
      );

      const botMessage = {
        text: response.content,
        isBot: true,
        messageId: response.messageId,
      };

      setThreads((prev) => {
        const updatedThreads = prev.map((thread) => {
          if (thread.id === selectedThread) {
            const updatedMessages = [...thread.messages, botMessage];
            setTypingMessageIndex(updatedMessages.length - 1);
            return {
              ...thread,
              conversationId: response.conversationId,
              messages: updatedMessages,
            };
          }
          return thread;
        });

        const activeThread = updatedThreads.find(t => t.id === selectedThread);
        const otherThreads = updatedThreads.filter(t => t.id !== selectedThread);
        
        return activeThread ? [activeThread, ...otherThreads] : updatedThreads;
      });
    } catch (error) {
      console.error("Error:", error);
      const errorMessage =
        (error as Error).message ||
        "エラーが発生しました。しばらく経ってからもう一度お試しください。";

      setThreads((prev) =>
        prev.map((thread) => {
          if (thread.id === selectedThread) {
            return {
              ...thread,
              messages: [
                ...thread.messages,
                { text: errorMessage, isBot: true },
              ],
            };
          }
          return thread;
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypewriterComplete = () => {
    setTypingMessageIndex(null);
  };

  const handleTopicSelect = (topic: string) => {
    // 新しいスレッドを作成してトピックで開始
    const newThread: Thread = {
      id: Date.now().toString(),
      title: topic.length > 50 ? topic.substring(0, 50) + '...' : topic,
      messages: [
        {
          text: "こんにちは！何かお手伝いできることはありますか？",
          isBot: true,
        },
      ],
      mode: chatMode,
      isFavorite: false,
    };
    
    setThreads((prev) => [newThread, ...prev]);
    setSelectedThread(newThread.id);
    setShowTopics(false);
    
    // 選択されたトピックでチャットを開始
    handleSend(topic);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        onNewThread={() => handleNewThread()}
        selectedThread={selectedThread}
        threads={threads.filter((t) => t.mode === chatMode)}
        onSelectThread={setSelectedThread}
        mode={chatMode}
        onShowTopics={() => {
          setShowTopics(true);
          setShowCustomerLogs(false);
        }}
        showTopics={showTopics}
        onShowCustomerLogs={() => {
          setShowCustomerLogs(true);
          setShowTopics(false);
          setSelectedThread(null);
        }}
        onGoHome={() => {
          setSelectedThread(null);
          setShowCustomerLogs(false);
          setShowTopics(false);
        }}
      />

      <div className="flex flex-col h-screen md:pl-64">
        {showTopics ? (
          <TopicsPage onSelectTopic={handleTopicSelect} />
        ) : showCustomerLogs ? (
          <div className="flex h-full bg-[#202123]">
            <div className="w-96 border-r border-gray-600/50 flex flex-col">
              <div className="p-6 border-b border-gray-600/50">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-8 h-8 text-white" />
                  <h1 className="text-xl font-bold text-white">
                    お客様からの質問一覧
                  </h1>
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
                      onClick={() =>
                        setSortOrder((prev) =>
                          prev === "desc" ? "asc" : "desc"
                        )
                      }
                      className="px-3 py-2 text-white border border-gray-600/50 rounded-lg hover:bg-[#343541] transition-colors"
                    >
                      {sortOrder === "desc" ? (
                        <ArrowDown className="w-4 h-4" />
                      ) : (
                        <ArrowUp className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoadingLogs ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                ) : logsError ? (
                  <div className="text-center py-12 text-red-400">
                    {logsError}
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
                          selectedLog?.id === log.id
                            ? "bg-[#343541]"
                            : "hover:bg-[#2A2B32]"
                        }`}
                      >
                        <div className="font-medium text-white line-clamp-2 mb-2">
                          {log.query}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(log.created_at).toLocaleString("ja-JP")}
                          </span>
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
                        <h2 className="text-xl font-semibold text-white">
                          会話の詳細
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(selectedLog.created_at).toLocaleString(
                            "ja-JP"
                          )}
                        </p>
                      </div>
                      {selectedLog.metadata?.user_info?.name && (
                        <div className="text-sm text-gray-400">
                          送信者: {selectedLog.metadata.user_info.name}
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
        ) : !selectedThread ? (
          <WelcomeScreen onSend={handleSend} mode={chatMode} />
        ) : (
          <>
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{currentThread?.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFavorite(currentThread!.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    currentThread?.isFavorite
                      ? "text-yellow-500 hover:text-yellow-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  title={
                    currentThread?.isFavorite
                      ? "お気に入りから削除"
                      : "お気に入りに追加"
                  }
                >
                  <Star
                    className="w-5 h-5"
                    fill={currentThread?.isFavorite ? "currentColor" : "none"}
                  />
                </button>
                <button
                  onClick={() => handleCopyConversation(currentThread!.id)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  title="会話をコピー"
                >
                  <Copy className="w-5 h-5" />
                </button>
                <div className="relative group">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    title="会話をダウンロード"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block">
                    <button
                      onClick={() =>
                        handleDownloadConversation(currentThread!.id, "text")
                      }
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      テキストファイル (.txt)
                    </button>
                    <button
                      onClick={() =>
                        handleDownloadConversation(
                          currentThread!.id,
                          "markdown"
                        )
                      }
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Markdown (.md)
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {currentThread?.messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message.text}
                  isBot={message.isBot}
                  useTypewriter={message.isBot && index === typingMessageIndex}
                  onTypewriterComplete={handleTypewriterComplete}
                  typewriterSpeed={30}
                />
              ))}
              {isLoading && (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Public routes that don't require authentication
  const isPublicRoute = (path: string) => {
    return path.startsWith("/customer") || path.startsWith("/embedded");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/customer/*" element={<CustomerChat />} />
      <Route path="/embedded/*" element={<EmbeddedChat />} />

      {/* Auth routes */}
      <Route
        path="/login"
        element={session ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={session ? <Navigate to="/" replace /> : <SignupPage />}
      />
      <Route
        path="/reset-password"
        element={session ? <Navigate to="/" replace /> : <ResetPasswordPage />}
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          !session && !isPublicRoute(location.pathname) ? (
            <Navigate to="/login" state={{ from: location }} replace />
          ) : (
            <ProtectedRoutes />
          )
        }
      />
    </Routes>
  );
}
function ProtectedRoutes() {
  const location = useLocation();
  const isPublicRoute =
    location.pathname.startsWith("/customer") ||
    location.pathname.startsWith("/embedded");

  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/internal-chat" element={<InternalChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
