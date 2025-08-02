import React from 'react';
import { 
  Hammer, 
  Users2, 
  Calculator, 
  FileText, 
  UserCheck, 
  DollarSign,
  ClipboardList,
  Wrench
} from 'lucide-react';

interface TopicCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  prompts: Array<{
    title: string;
    description: string;
    examples: string[];
  }>;
}

interface TopicsPageProps {
  onSelectTopic?: (topic: string) => void;
}

export function TopicsPage({ onSelectTopic }: TopicsPageProps) {
  const [activeTab, setActiveTab] = React.useState('sales');

  const categories: TopicCategory[] = [
    {
      id: 'sales',
      title: '営業・集客',
      icon: <UserCheck className="w-5 h-5" />,
      prompts: [
        {
          title: '新規顧客開拓',
          description: '田舎町で新しいお客様を見つける方法',
          examples: [
            '田舎町で新規のお客様を見つけるにはどうしたらよいでしょうか？',
            '口コミで仕事を増やすコツを教えてください',
            'チラシ配布以外の宣伝方法はありますか？',
            '近所の大工さんと差別化するポイントは何ですか？',
            'SNSを使った宣伝方法を教えてください'
          ]
        },
        {
          title: '見積もり・提案',
          description: '適正価格での見積もりと効果的な提案方法',
          examples: [
            '見積もりで他社に負けないコツはありますか？',
            'お客様に分かりやすい見積書の作り方を教えてください',
            '値引き交渉された時の対応方法は？',
            '追加工事の説明を上手にする方法',
            '高い見積もりでも受注するための提案方法'
          ]
        },
        {
          title: 'お客様との関係構築',
          description: '信頼関係を築き、リピーターを増やす方法',
          examples: [
            'お客様との信頼関係を築くにはどうしたらいいですか？',
            '工事中のお客様とのコミュニケーション方法',
            'クレームを言われた時の対処法',
            '工事完了後もお付き合いを続けるコツ',
            '紹介をもらいやすくする方法'
          ]
        }
      ]
    },
    {
      id: 'materials',
      title: '資材調達・コスト',
      icon: <Calculator className="w-5 h-5" />,
      prompts: [
        {
          title: '資材仕入れ',
          description: '良い資材を安く仕入れる方法',
          examples: [
            '資材を安く仕入れる方法を教えてください',
            '材木の良し悪しの見分け方は？',
            '建材店との上手な付き合い方',
            '在庫を抱えすぎないための管理方法',
            'ネット通販の資材は使っても大丈夫ですか？'
          ]
        },
        {
          title: '原価管理',
          description: '利益を確保するための原価計算',
          examples: [
            '材料費の計算方法を教えてください',
            '人件費はどのように設定すればいいですか？',
            '適正な利益率の考え方',
            '予算オーバーを防ぐ方法',
            '小さな工事でも利益を出すコツ'
          ]
        }
      ]
    },
    {
      id: 'technical',
      title: '技術・施工',
      icon: <Hammer className="w-5 h-5" />,
      prompts: [
        {
          title: '施工技術',
          description: '品質の高い施工を行うための技術的なアドバイス',
          examples: [
            '基礎工事で気をつけるべきポイントは？',
            '雨漏りしない屋根の作り方',
            '湿気対策の施工方法を教えてください',
            '地震に強い家を建てるには？',
            '省エネ住宅の施工ポイント'
          ]
        },
        {
          title: '新しい技術・工法',
          description: '最新の建築技術や工法の習得',
          examples: [
            '最新の断熱工法について教えてください',
            'ZEH住宅の建て方のポイント',
            '太陽光発電の設置で注意すること',
            '長期優良住宅の基準と施工方法',
            'バリアフリー工事のポイント'
          ]
        },
        {
          title: 'トラブル対応',
          description: '施工中のトラブルや不具合への対処法',
          examples: [
            '工事中に雨漏りが発覚した時の対処法',
            '基礎に不備が見つかった場合の対応',
            '近隣から騒音の苦情が来た時の対処法',
            '職人さんが来なくなった時の対応',
            '材料の納期が遅れた時の調整方法'
          ]
        }
      ]
    },
    {
      id: 'legal',
      title: '法規制・許認可',
      icon: <FileText className="w-5 h-5" />,
      prompts: [
        {
          title: '建築基準法・確認申請',
          description: '法令遵守と各種申請手続き',
          examples: [
            '建築確認申請の流れを教えてください',
            '4号建築物の特例について',
            '検査で指摘されやすいポイントは？',
            '違反建築にならないための注意点',
            '用途変更する時の手続き'
          ]
        },
        {
          title: '契約・保険',
          description: '適切な契約書作成と保険の活用',
          examples: [
            '工事契約書で必ず入れるべき項目は？',
            '工事保険はどのようなものに入るべきですか？',
            'PL保険（製造物責任保険）の必要性について',
            '下請け業者との契約で注意すること',
            '契約トラブルを避ける方法'
          ]
        }
      ]
    },
    {
      id: 'management',
      title: '経営・資金繰り',
      icon: <DollarSign className="w-5 h-5" />,
      prompts: [
        {
          title: '経営改善',
          description: '小規模工務店の経営を安定させる方法',
          examples: [
            '小さな工務店の経営を安定させる方法',
            '売上を上げるための戦略を教えてください',
            '忙しい時期と暇な時期の波を減らす方法',
            '一人親方から会社にするタイミング',
            '後継者問題への対処法'
          ]
        },
        {
          title: '資金管理',
          description: 'キャッシュフローと資金調達',
          examples: [
            '資金繰りが苦しい時の対処法',
            '設備投資のタイミングの判断方法',
            '銀行からの融資を受けやすくする方法',
            '補助金や助成金の活用方法',
            '税金対策で知っておくべきこと'
          ]
        }
      ]
    },
    {
      id: 'workforce',
      title: '人材・職人',
      icon: <Users2 className="w-5 h-5" />,
      prompts: [
        {
          title: '人材確保',
          description: '職人や従業員の採用と育成',
          examples: [
            '若い職人を雇うにはどうしたらいいですか？',
            '職人の給料はどのように決めればいいですか？',
            '外国人技能実習生の受け入れについて',
            '一人親方に仕事を頼む時の注意点',
            '職人の技術向上のための指導方法'
          ]
        },
        {
          title: '現場管理',
          description: '効率的な現場運営と安全管理',
          examples: [
            '現場の安全管理で気をつけること',
            '複数の現場を同時に管理するコツ',
            '職人同士のトラブルの解決方法',
            '工期を守るためのスケジュール管理',
            '現場の片付けと近隣への配慮'
          ]
        }
      ]
    },
    {
      id: 'maintenance',
      title: 'アフターサービス',
      icon: <Wrench className="w-5 h-5" />,
      prompts: [
        {
          title: '保証・メンテナンス',
          description: '適切なアフターサービスの提供',
          examples: [
            '引き渡し後の保証期間はどのくらいが適当ですか？',
            'お客様からの不具合連絡への対応方法',
            '定期点検の実施方法とタイミング',
            'リフォーム案件の獲得方法',
            '長期的なお付き合いを続けるコツ'
          ]
        },
        {
          title: 'トラブル対応',
          description: '完成後のトラブルへの対処',
          examples: [
            '雨漏りの修理方法と再発防止策',
            'お客様からのクレーム対応のポイント',
            '保証期間外の修理費用の説明方法',
            '急な修理依頼への対応体制',
            '他社施工物件の修理を依頼された時の対応'
          ]
        }
      ]
    },
    {
      id: 'admin',
      title: '事務・手続き',
      icon: <ClipboardList className="w-5 h-5" />,
      prompts: [
        {
          title: '書類・申請',
          description: '各種書類作成と手続きの効率化',
          examples: [
            '現場写真の撮り方と整理方法',
            '工事日報の書き方と重要性',
            '請求書発行のタイミングと注意点',
            '帳簿付けを簡単にする方法',
            '建設業許可の更新手続きについて'
          ]
        },
        {
          title: 'IT・デジタル化',
          description: 'ITツールを活用した業務効率化',
          examples: [
            '現場管理アプリの選び方と使い方',
            '見積もりソフトの導入メリット',
            'お客様との連絡にLINEを使う方法',
            'クラウド会計ソフトの活用法',
            'ホームページを作るべきでしょうか？'
          ]
        }
      ]
    }
  ];

  const handleExampleClick = (example: string) => {
    if (onSelectTopic) {
      onSelectTopic(example);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">田舎町工務店 お悩み相談トピック集</h1>
          <p className="text-gray-600">
            日々の業務でお困りのことはありませんか？カテゴリ別に整理された質問例から、
            あなたの状況に近いものを選んでお気軽にご相談ください。
          </p>
        </div>
        
        {/* タブナビゲーション */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.icon}
              {category.title}
            </button>
          ))}
        </div>

        {/* トピックコンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories
            .find(category => category.id === activeTab)
            ?.prompts.map((prompt, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-500 transition-colors"
              >
                <h3 className="text-xl font-semibold mb-3 text-gray-800">{prompt.title}</h3>
                <p className="text-gray-600 mb-4">{prompt.description}</p>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">よくある質問：</h4>
                  <ul className="space-y-2">
                    {prompt.examples.map((example, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer p-2 rounded hover:bg-blue-50 transition-colors"
                        onClick={() => handleExampleClick(example)}
                      >
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        <span className="leading-relaxed">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">💡 使い方のコツ</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 質問例をクリックするとチャットが開始されます</li>
            <li>• 自分の状況に合わせて質問を少し変更してもOKです</li>
            <li>• 具体的な数字や状況を教えていただくと、より詳しい回答ができます</li>
            <li>• 複数のカテゴリにまたがる相談も遠慮なくどうぞ</li>
          </ul>
        </div>
      </div>
    </div>
  );
}