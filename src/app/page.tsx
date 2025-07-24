import ImageGallery from '@/components/ImageGallery';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Azure Blob Storage 画像ギャラリー
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Managed Identity を使用して Azure Blob Storage から画像を取得・表示する Next.js アプリケーション
          </p>
        </header>
        
        <main>
          <ImageGallery />
        </main>
        
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            Built with Next.js, Azure Blob Storage, and Managed Identity
          </p>
        </footer>
      </div>
    </div>
  );
}
