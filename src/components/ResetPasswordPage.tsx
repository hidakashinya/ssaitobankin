import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquare, Lock, ArrowRight, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    if (newPassword.length < 8) {
      setError('パスワードは8文字以上である必要があります');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'パスワードの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 relative">
          <button
            onClick={() => navigate('/login')}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <MessageSquare className="w-10 h-10 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">パスワードのリセット</h1>
            </div>
            <p className="text-center text-gray-600 text-sm">
              新しいパスワードを設定してください
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg">
                パスワードが更新されました。ログインページに移動します...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  新しいパスワード
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="8文字以上の英数字"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワードの確認
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="パスワードを再入力"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>更新中...</span>
                  </>
                ) : (
                  <>
                    <span>パスワードを更新</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}