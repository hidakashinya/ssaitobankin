import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Mail, Lock, ArrowRight, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('このメールアドレスは既に登録されています');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('アカウントの作成に失敗しました');
      }

      // 登録成功後、ログインページに遷移
      navigate('/login', { 
        state: { 
          message: 'アカウントの作成が完了しました。メールアドレスとパスワードでログインしてください。'
        }
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'アカウントの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <MessageSquare className="w-10 h-10 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900">アカウント登録</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                お名前
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="山田 太郎"
                  required
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8文字以上の英数字"
                  minLength={8}
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>登録中...</span>
                  </>
                ) : (
                  <>
                    <span>アカウントを作成</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                すでにアカウントをお持ちの方はログイン
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            登録することで、
            <Link to="/terms" className="text-blue-500 hover:text-blue-600">利用規約</Link>
            と
            <Link to="/privacy" className="text-blue-500 hover:text-blue-600">プライバシーポリシー</Link>
            に同意したことになります。
          </p>
        </div>
      </div>
    </div>
  );
}