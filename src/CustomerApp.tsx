import React from 'react';
import { CustomerChat } from './components/CustomerChat';

function CustomerApp() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <CustomerChat />
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">埋め込みコード</h2>
          <p className="text-gray-600 mb-4">
            以下のコードをあなたのウェブサイトに貼り付けることで、チャットウィジェットを埋め込むことができます。
          </p>
          <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
            {`<iframe
  src="${window.location.origin}/embedded"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"
></iframe>`}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default CustomerApp;