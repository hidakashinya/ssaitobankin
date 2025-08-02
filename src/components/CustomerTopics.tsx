import React from 'react';

interface CustomerTopicsProps {
  onSelectTopic: (topic: string) => void;
}

export function CustomerTopics({ onSelectTopic }: CustomerTopicsProps) {
  const topics = [
    {
      category: '製品・サービス',
      items: [
        '製品の特徴について教えてください',
        '料金プランの詳細を知りたいです',
        '無料トライアルはありますか？',
        'サービスの利用方法を教えてください'
      ]
    },
    {
      category: 'アカウント・設定',
      items: [
        'アカウントの作成方法を教えてください',
        'パスワードの変更方法は？',
        '請求先情報の更新方法は？',
        'アカウントの削除について'
      ]
    },
    {
      category: 'トラブルシューティング',
      items: [
        'ログインできない場合の対処法',
        'エラーメッセージの意味を教えてください',
        'アプリが動作しない場合の対処法',
        'データが表示されない場合の対処法'
      ]
    },
    {
      category: 'サポート',
      items: [
        'カスタマーサポートの連絡方法',
        '営業時間について',
        '返金ポリシーについて',
        '技術サポートの範囲について'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {topics.map((topic, index) => (
        <div key={index}>
          <h4 className="text-gray-300 font-medium mb-2">{topic.category}</h4>
          <div className="space-y-1">
            {topic.items.map((item, itemIndex) => (
              <button
                key={itemIndex}
                onClick={() => onSelectTopic(item)}
                className="w-full text-left p-2 text-gray-400 hover:bg-gray-700 rounded-md text-sm"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}