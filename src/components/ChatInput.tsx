import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 日本語入力中（IME変換中）は何もしない
    if (isComposing) {
      return;
    }
    
    // Enterで改行（デフォルト動作を許可）
    if (e.key === 'Enter') {
      return;
    }
  };

  // IME変換開始時
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // IME変換終了時
  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  // テキストエリアの高さを自動調整
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 一度高さをリセット
      textarea.style.height = 'auto';
      // scrollHeightに基づいて高さを設定
      const newHeight = Math.min(textarea.scrollHeight, 144); // 6行分の高さ (24px * 6)
      textarea.style.height = `${newHeight}px`;
    }
  };

  // メッセージが変更されたときに高さを調整
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  // メッセージ変更時とコンポーネントマウント時に高さを調整
  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // メッセージ送信後にテキストエリアの高さをリセット
  useEffect(() => {
    if (!message) {
      adjustTextareaHeight();
    }
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        placeholder="メッセージを入力... (Enter: 改行)"
        className="w-full p-4 pr-16 bg-[#40414f] rounded-lg border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 resize-none overflow-y-auto"
        rows={1}
        disabled={disabled}
        style={{
          minHeight: '56px',
          maxHeight: '144px', // 6行分の高さ
          lineHeight: '24px'   // 行の高さを明示的に設定
        }}
      />
      <button
        type="submit"
        className={`absolute right-2 top-2 p-3 rounded-lg transition-all duration-200 transform ${
          disabled || !message.trim()
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed scale-95'
            : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 shadow-lg hover:shadow-xl'
        }`}
        disabled={disabled || !message.trim()}
        style={{
          minWidth: '44px',
          minHeight: '44px'
        }}
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}