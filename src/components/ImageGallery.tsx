'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AlertCircle, RefreshCw, ImageIcon } from 'lucide-react';

interface ImageItem {
  name: string;
  url: string;
  lastModified?: Date;
  size?: number;
}

interface ApiResponse {
  success: boolean;
  images?: ImageItem[];
  error?: string;
  details?: string;
  source?: 'mock' | 'azure' | 'mock-fallback';
  originalError?: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/images');
      const data: ApiResponse = await response.json();
      
      if (data.success && data.images) {
        setImages(data.images);
        setDataSource(data.source || 'unknown');
      } else {
        setError(data.error || 'Failed to fetch images');
      }
    } catch (err) {
      setError('Network error occurred while fetching images');
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown date';
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-600">Azure Blob Storage から画像を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-8">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">画像の読み込みに失敗しました</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchImages}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <ImageIcon className="w-12 h-12 text-gray-400" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">画像が見つかりません</h3>
          <p className="text-gray-600">Azure Blob Storage のコンテナに画像がアップロードされていません。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Azure Blob Storage 画像ギャラリー
        </h2>
        <button
          onClick={fetchImages}
          className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          更新
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {images.map((image) => (
          <div
            key={image.name}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square relative bg-gray-100">
              <Image
                src={image.url}
                alt={image.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 truncate mb-2" title={image.name}>
                {image.name}
              </h3>
              <div className="text-sm text-gray-500 space-y-1">
                <p>サイズ: {formatFileSize(image.size)}</p>
                <p>更新日: {formatDate(image.lastModified)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-gray-500 text-sm space-y-1">
        <p>合計 {images.length} 枚の画像</p>
        {dataSource && (
          <p className="text-xs">
            データソース: {
              dataSource === 'azure' ? 'Azure Blob Storage' :
              dataSource === 'mock' ? 'モックデータ (開発用)' :
              dataSource === 'mock-fallback' ? 'モックデータ (Azure接続エラー)' :
              dataSource
            }
          </p>
        )}
      </div>
    </div>
  );
}
