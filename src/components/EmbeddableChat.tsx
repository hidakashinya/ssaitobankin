import React from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface Message {
  text: string;
  isBot: boolean;
  messageId?: string;
}

export function EmbeddableChat() {
  const [messages, setMessages] = React.useState<Message[]>([
    { text: 'こんにちは！何かお手伝いできることはありますか？', isBot: true }
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [conversationId, setConversationId] = React.useState<string>();

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      setMessages(prev => [...prev, { text: message, isBot: false }]);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

      try {
        const response = await fetch('/functions/v1/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: message }],
            conversation_id: conversationId || ""
          }),
          signal: controller.signal
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `APIリクエストに失敗しました: ${response.status}`);
        }

        if (!data?.choices?.[0]?.message?.content) {
          throw new Error('APIレスポンスの形式が無効です');
        }

        setConversationId(data.conversation_id);
        setMessages(prev => [...prev, { 
          text: data.choices[0].message.content, 
          isBot: true,
          messageId: data.message_id
        }]);
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: error.message || "エラーが発生しました。しばらく経ってからもう一度お試しください。", 
        isBot: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] rounded-lg shadow-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message.text} isBot={message.isBot} />
        ))}
        {isLoading && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}