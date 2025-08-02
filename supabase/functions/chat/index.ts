import { corsHeaders } from '../_shared/cors.ts';

const DIFY_API_KEY = Deno.env.get('DIFY_API_KEY_CUSTOMER') ?? '';
if (!DIFY_API_KEY) {
  throw new Error('DIFY_API_KEY_CUSTOMER environment variable is not set');
}

const DIFY_API_URL = 'https://api.dify.ai/v1';
const DEFAULT_TIMEOUT = 60000;
const DEFAULT_USER_ID = 'customer-user';

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  try {
    // 認証チェックを完全にスキップ
    console.log('Processing chat request without authentication...');

    const { messages, conversation_id = "" } = await req.json().catch(() => ({ messages: [] }));
    const userMessage = messages[messages.length - 1]?.content;

    if (!userMessage) {
      return new Response(
        JSON.stringify({
          error: 'メッセージの内容が必要です'
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      );
    }

    console.log('Sending request to Dify API...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const difyResponse = await fetch(`${DIFY_API_URL}/chat-messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          inputs: {},
          query: userMessage,
          response_mode: "blocking",
          conversation_id: conversation_id,
          user: DEFAULT_USER_ID
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!difyResponse.ok) {
        const errorText = await difyResponse.text();
        let errorMessage = `Dify API error: ${difyResponse.status}`;
        try {
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          }
        } catch {
          if (errorText.includes('<!DOCTYPE html>')) {
            errorMessage = 'APIの認証に失敗しました。APIキーを確認してください。';
          }
        }
        throw new Error(errorMessage);
      }

      const data = await difyResponse.json();
      console.log('Dify API response received');

      return new Response(
        JSON.stringify({
          message_id: data.id,
          conversation_id: data.conversation_id,
          choices: [{
            message: {
              content: data.answer
            }
          }],
          metadata: data.metadata
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('リクエストがタイムアウトしました');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('Error in chat function:', error);
    
    const status = error.message?.includes('timeout') ? 408 : 
                  error.message?.includes('Dify API error') ? 502 :
                  500;
    
    return new Response(
      JSON.stringify({
        error: error.message || 'エラーが発生しました。しばらくしてからもう一度お試しください。'
      }),
      {
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate'
        }
      }
    );
  }
});