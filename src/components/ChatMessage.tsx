import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  useTypewriter?: boolean;
  onTypewriterComplete?: () => void;
  typewriterSpeed?: number;
}

export function ChatMessage({ 
  message, 
  isBot, 
  useTypewriter = false,
  onTypewriterComplete,
  typewriterSpeed = 30
}: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // タイピングエフェクトの初期化
  useEffect(() => {
    if (useTypewriter && isBot) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(true);
    } else {
      setDisplayedText(message);
      setIsTyping(false);
    }
  }, [message, useTypewriter, isBot]);

  // タイピングエフェクトの実行
  useEffect(() => {
    if (useTypewriter && isBot && isTyping && currentIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + message[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, typewriterSpeed);

      return () => clearTimeout(timer);
    } else if (currentIndex >= message.length && isTyping) {
      setIsTyping(false);
      if (onTypewriterComplete) {
        onTypewriterComplete();
      }
    }
  }, [currentIndex, message, typewriterSpeed, onTypewriterComplete, useTypewriter, isBot, isTyping]);

  const textToDisplay = useTypewriter && isBot ? displayedText : message;

  return (
    <div className={`${isBot ? 'bg-[#444654]' : 'bg-[#343541]'}`}>
      <div className="max-w-3xl mx-auto flex p-6 gap-6">
        <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 ${
          isBot ? '' : 'bg-purple-500'
        }`}>
          {isBot ? (
            <img src="https://shinya-hidaka.com/blog/wp-content/uploads/2025/07/higa_icon.jpg" alt="Bot Icon" className="rounded-full" />
          ) : (
            <div className="w-5 h-5 bg-white rounded-sm" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {textToDisplay}
            </ReactMarkdown>
            {useTypewriter && isBot && isTyping && (
              <span className="animate-pulse text-white">▊</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}