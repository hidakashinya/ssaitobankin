import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { query, answer, metadata = {}, user_info = {}, user_id } = await req.json();
    console.log('Saving chat log:', { query, answer, metadata, user_info });

    if (!query || !answer) {
      throw new Error('質問と回答は必須です');
    }

    const { data, error } = await supabase
      .from('chat_logs')
      .insert({
        query,
        answer,
        metadata,
        user_info,
        user_id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error saving chat log:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'チャットログの保存に失敗しました'
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