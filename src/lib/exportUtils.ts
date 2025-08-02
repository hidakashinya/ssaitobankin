import { Message } from '../types';

export function convertToMarkdown(messages: Message[], title: string): string {
  const timestamp = new Date().toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  let markdown = '';
  markdown += `# ${title}\n\n`;
  markdown += `*会話日時: ${timestamp}*\n\n`;
  markdown += `---\n\n`;

  messages.forEach((message, index) => {
    const role = message.isBot ? '🤖 アシスタント' : '👤 ユーザー';
    markdown += `**${role}**\n\n${message.text}\n\n`;
    
    // 最後のメッセージ以外は区切り線を追加
    if (index < messages.length - 1) {
      markdown += `---\n\n`;
    }
  });

  return markdown;
}

export function downloadAsMarkdown(content: string, filename: string) {
  // UTF-8 BOMを追加して文字化けを防ぐ
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, content], { 
    type: 'text/markdown;charset=utf-8' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.md`;
  
  // IEとEdgeのための回避策
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, `${filename}.md`);
  } else {
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  URL.revokeObjectURL(url);
}