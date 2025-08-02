import { supabase } from './supabase';

export interface SavedConversation {
  id: string;
  title: string;
  mode: 'internal' | 'customer';
  messages: Array<{
    text: string;
    isBot: boolean;
    messageId?: string;
  }>;
  isFavorite: boolean;
  created_at: string;
  updated_at: string;
}

export async function getSavedConversations(): Promise<SavedConversation[]> {
  const { data, error } = await supabase
    .from('saved_conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function saveConversation(conversation: {
  title: string;
  mode: 'internal' | 'customer';
  messages: Array<{
    text: string;
    isBot: boolean;
    messageId?: string;
  }>;
  isFavorite?: boolean;
}): Promise<SavedConversation> {
  const { data, error } = await supabase
    .from('saved_conversations')
    .insert([{
      title: conversation.title,
      mode: conversation.mode,
      messages: conversation.messages,
      is_favorite: conversation.isFavorite || false
    }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    ...data,
    isFavorite: data.is_favorite
  };
}

export async function updateConversationFavorite(id: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('saved_conversations')
    .update({ is_favorite: isFavorite })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabase
    .from('saved_conversations')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
} 