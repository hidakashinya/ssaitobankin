import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types';

if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

interface ConversationInput {
  title: string;
  mode: string;
  messages: Array<{ text: string; isBot: boolean; messageId?: string }>;
  isFavorite?: boolean;
}

export async function saveConversation(conversation: ConversationInput) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: user.user.id,
      title: conversation.title,
      mode: conversation.mode,
      is_favorite: conversation.isFavorite || false
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('Failed to create conversation');
  }

  const conversationId = data.id;

  const messagesData = conversation.messages.map(message => ({
    conversation_id: conversationId,
    content: message.text,
    is_bot: message.isBot,
    message_id: message.messageId
  }));

  const { error: messagesError } = await supabase
    .from('messages')
    .insert(messagesData);

  if (messagesError) {
    // If messages insertion fails, delete the conversation to maintain consistency
    await supabase.from('conversations').delete().eq('id', conversationId);
    throw messagesError;
  }

  return data;
}

export async function updateConversationFavorite(conversationId: string, isFavorite: boolean) {
  const { error } = await supabase
    .from('conversations')
    .update({ is_favorite: isFavorite })
    .eq('id', conversationId);

  if (error) {
    throw error;
  }
}