import { corsHeaders } from '../_shared/cors.ts';

const DIFY_API_KEY = Deno.env.get('DIFY_API_KEY_CUSTOMER') ?? '';
if (!DIFY_API_KEY) {
  throw new Error('DIFY_API_KEY_CUSTOMER environment variable is not set');
}

const DIFY_API_URL = 'https://api.dify.ai/v1';
const DEFAULT_USER_ID = 'customer-user';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const conversationsResponse = await fetch(`${DIFY_API_URL}/conversations?user=${DEFAULT_USER_ID}&limit=50`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DIFY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!conversationsResponse.ok) {
      const errorData = await conversationsResponse.json().catch(() => ({}));
      console.error('Dify API error:', errorData);
      throw new Error(`会話の取得に失敗しました (${conversationsResponse.status})`);
    }

    const conversationsData = await conversationsResponse.json();
    
    if (!conversationsData.data || !Array.isArray(conversationsData.data)) {
      console.error('Invalid API response:', conversationsData);
      throw new Error('APIからの応答形式が無効です');
    }

    const conversations = conversationsData.data;
    const messagesPromises = conversations.map(async (conv: any) => {
      try {
        const messagesResponse = await fetch(`${DIFY_API_URL}/messages?conversation_id=${conv.id}&limit=100&user=${DEFAULT_USER_ID}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${DIFY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });

        if (!messagesResponse.ok) {
          console.error(`Failed to fetch messages for conversation ${conv.id}:`, await messagesResponse.text());
          return null;
        }

        const messagesData = await messagesResponse.json();
        if (!messagesData.data || !Array.isArray(messagesData.data)) {
          console.error(`Invalid messages data for conversation ${conv.id}:`, messagesData);
          return null;
        }

        const messages = messagesData.data;
        if (messages.length === 0) {
          return null;
        }

        const userMessages = messages.filter((m: any) => m.role === 'user');
        const assistantMessages = messages.filter((m: any) => m.role === 'assistant');

        if (userMessages.length === 0 || assistantMessages.length === 0) {
          return null;
        }

        const latestUserMessage = userMessages[0];
        const latestAssistantMessage = assistantMessages[0];

        return {
          id: conv.id,
          query: latestUserMessage.query || latestUserMessage.content || '',
          answer: latestAssistantMessage.answer || latestAssistantMessage.content || '',
          created_at: conv.created_at || latestUserMessage.created_at,
          metadata: {
            user_info: conv.user || {},
            total_messages: messages.length
          }
        };
      } catch (error) {
        console.error(`Error processing conversation ${conv.id}:`, error);
        return null;
      }
    });

    const results = await Promise.all(messagesPromises);
    const validResults = results
      .filter((result): result is NonNullable<typeof result> => result !== null)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return new Response(
      JSON.stringify({ messages: validResults }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in chat-logs function:', error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'チャットログの取得に失敗しました',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});