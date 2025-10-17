import React from "react";
import { ChatMessage } from "../components/ChatMessage";
import { ChatInput } from "../components/ChatInput";

interface Message {
  text: string;
  isBot: boolean;
  messageId?: string;
  followUpQuestions?: string[];
}

export function EmbeddedChat() {
  const [messages, setMessages] = React.useState<Message[]>([
    { text: "聞きたいことをなんでも書いてください！\n\n※ご質問に対するお答えは、ブログ・弊社サイトなどの情報をもとにお答えさせていただいております!", isBot: true },
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string>();
  const [typingMessageIndex, setTypingMessageIndex] = React.useState<number | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      setMessages((prev) => [...prev, { text: message, isBot: false }]);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: messages
              .map((msg) => ({
                role: msg.isBot ? "assistant" : "user",
                content: msg.text,
              }))
              .concat([{ role: "user", content: message }]),
            conversation_id: conversationId || "",
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || `APIリクエストに失敗しました: ${response.status}`
        );
      }

      const data = await response.json();
      
      // デバッグ用: APIレスポンスをコンソールに出力
      console.log('Dify API Response:', data);
      console.log('Follow-up questions:', data.follow_up_questions);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/save-chat-log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          query: message,
          answer: data.choices[0].message.content,
          metadata: {
            conversation_id: data.conversation_id,
            message_id: data.message_id,
          },
        }),
      });

      setConversationId(data.conversation_id);
      
      // 実際のフォローアップ質問を取得
      const followUpQuestions = data.follow_up_questions || data.suggested_questions || data.followup_questions || [];
      
      // デバッグ用: フォローアップ質問がない場合の情報をログに出力
      if (followUpQuestions.length === 0) {
        console.log('No follow-up questions found in response');
        console.log('Available fields in response:', Object.keys(data));
        if (data._debug_full_response) {
          console.log('Full Dify response:', data._debug_full_response);
        }
      }

      // テスト用: 強制的にフォローアップ質問を表示（デバッグ用）
      const testFollowUpQuestions = [
        "詳細を教えてください",
        "他にもありますか？", 
        "具体的な手順は？"
      ];

      const botMessage = {
        text: data.choices[0].message.content,
        isBot: true,
        messageId: data.message_id,
        followUpQuestions: testFollowUpQuestions, // テスト用に強制表示
      };

      // デバッグ用: ボットメッセージの内容をログに出力
      console.log('Bot message created:', botMessage);
      console.log('Follow-up questions:', botMessage.followUpQuestions);
      console.log('Is bot:', botMessage.isBot);

      setMessages((prev) => {
        const newMessages = [...prev, botMessage];
        setTypingMessageIndex(newMessages.length - 1);
        return newMessages;
      });
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: error instanceof Error ? error.message : "エラーが発生しました",
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypewriterComplete = () => {
    setTypingMessageIndex(null);
  };

  const handleFollowUpClick = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#343541] shadow-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {messages.map((message, index) => {
          // デバッグ用: 各メッセージの状態をログに出力
          console.log(`Message ${index}:`, {
            isBot: message.isBot,
            hasFollowUp: !!message.followUpQuestions,
            followUpLength: message.followUpQuestions?.length || 0,
            followUpQuestions: message.followUpQuestions
          });
          
          return (
          <div key={index}>
            <ChatMessage
              message={message.text}
              isBot={message.isBot}
              useTypewriter={message.isBot && index === typingMessageIndex}
              onTypewriterComplete={handleTypewriterComplete}
              typewriterSpeed={30}
            />
            {message.isBot && message.followUpQuestions && message.followUpQuestions.length > 0 && (
              <div className="px-4 py-2 bg-red-100 border border-red-300 rounded">
                <div className="text-sm text-red-600 mb-2">🔍 関連する質問（テスト表示）：</div>
                <div className="flex flex-wrap gap-2">
                  {message.followUpQuestions.map((question, qIndex) => (
                    <button
                      key={qIndex}
                      onClick={() => handleFollowUpClick(question)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded-full transition-colors duration-200 border border-red-600 hover:border-red-500"
                      disabled={isLoading}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-600/50 bg-[#343541] p-4">
        <div className="relative">
          <ChatInput onSend={handleSend} disabled={isLoading} />
          <div className="text-center mt-2 text-xs text-gray-400">
            個人情報は入力しないでください。
          </div>
        </div>
      </div>
    </div>
  );
}
