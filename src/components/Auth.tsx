import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';
import { MessageSquare } from 'lucide-react';

export function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <MessageSquare className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold">Original Chat</h1>
        </div>
        <div className="text-center mb-8">
          <p className="text-gray-600">
            アカウントを作成して、チャットボットを利用開始しましょう。
          </p>
        </div>
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#3B82F6',
                  brandAccent: '#2563EB',
                }
              }
            },
            className: {
              container: 'w-full',
              button: 'w-full px-4 py-2 rounded-lg font-medium',
              input: 'w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              label: 'text-sm font-medium text-gray-700 mb-1 block',
              message: 'text-sm text-red-500 mt-1'
            }
          }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                button_label: 'ログイン',
                loading_button_label: 'ログインしています...',
                link_text: 'アカウントをお持ちでない方は新規登録',
                password_input_placeholder: 'パスワードを入力',
                email_input_placeholder: 'メールアドレスを入力',
                error_message: 'メールアドレスまたはパスワードが正しくありません'
              },
              sign_up: {
                email_label: 'メールアドレス',
                password_label: 'パスワード',
                button_label: '新規登録',
                loading_button_label: '登録しています...',
                link_text: 'すでにアカウントをお持ちの方はログイン',
                password_input_placeholder: '安全なパスワードを設定',
                email_input_placeholder: 'メールアドレスを入力',
                error_message: '登録に失敗しました。入力内容を確認してください'
              }
            }
          }}
        />
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            登録することで、利用規約とプライバシーポリシーに同意したことになります。
          </p>
        </div>
      </div>
    </div>
  );
}