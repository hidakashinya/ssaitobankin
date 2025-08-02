export interface Message {
  text: string;
  isBot: boolean;
  messageId?: string;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  conversationId?: string;
  mode: 'internal' | 'customer';
  isFavorite?: boolean;
}