import React from 'react';
import { Save } from 'lucide-react';
import { saveConversation } from '../lib/supabase';

interface SaveButtonProps {
  conversation: {
    title: string;
    mode: string;
    messages: Array<{ text: string; isBot: boolean; messageId?: string }>;
    isFavorite?: boolean;
  };
  onSave?: () => void;
}

export function SaveButton({ conversation, onSave }: SaveButtonProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await saveConversation(conversation);
      onSave?.();
    } catch (error) {
      console.error('Failed to save conversation:', error);
      alert('会話の保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isSaving}
      className={`p-2 rounded-lg transition-colors ${
        isSaving
          ? 'bg-gray-200 cursor-not-allowed'
          : 'text-gray-400 hover:text-gray-600'
      }`}
      title="会話を保存"
    >
      <Save className="w-5 h-5" />
    </button>
  );
}