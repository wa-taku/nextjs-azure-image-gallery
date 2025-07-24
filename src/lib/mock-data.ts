// Azure Blob Storage の設定が完了していない場合の開発用データ
export const mockImageData = [
  {
    name: 'sample-1.jpg',
    url: '/next.svg', // Next.js のデフォルトロゴを使用
    lastModified: new Date('2024-01-15'),
    size: 15420
  },
  {
    name: 'sample-2.png',
    url: '/vercel.svg', // Vercel のロゴを使用
    lastModified: new Date('2024-01-10'),
    size: 8250
  }
];

// 開発環境かどうかを判定する関数
export const isDevelopment = process.env.NODE_ENV === 'development';

// Azure の設定が完了しているかを確認する関数
export const isAzureConfigured = () => {
  return !!(
    process.env.AZURE_STORAGE_ACCOUNT_NAME &&
    process.env.AZURE_STORAGE_CONTAINER_NAME
  );
};
