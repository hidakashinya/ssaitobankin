# Chat Application

## Environment Variables

このアプリケーションを実行するには、以下の環境変数を設定する必要があります：

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development

1. 環境変数を設定
```bash
cp .env.example .env
```

2. `.env`ファイルを編集し、必要な値を設定

3. 依存関係をインストール
```bash
npm install
```

4. 開発サーバーを起動
```bash
npm run dev
```

## Deployment

Netlifyにデプロイする場合、以下の環境変数を設定してください：

1. Netlifyダッシュボードで「Site settings」→「Build & deploy」→「Environment variables」を開く
2. 以下の環境変数を追加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`# tgbot
