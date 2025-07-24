import { NextRequest, NextResponse } from 'next/server';
import { listBlobs } from '@/lib/azure-blob';
import { mockImageData, isDevelopment, isAzureConfigured } from '@/lib/mock-data';

export async function GET() {
  try {
    // 開発環境でAzureが設定されていない場合はモックデータを返す
    if (isDevelopment && !isAzureConfigured()) {
      console.log('Azure not configured in development environment, using mock data');
      return NextResponse.json({ 
        success: true, 
        images: mockImageData,
        source: 'mock'
      });
    }

    const blobs = await listBlobs();
    return NextResponse.json({ 
      success: true, 
      images: blobs,
      source: 'azure'
    });
  } catch (error) {
    console.error('Error in /api/images:', error);
    
    // エラーが発生した場合、開発環境ではモックデータを返す
    if (isDevelopment) {
      console.log('Azure error in development, falling back to mock data');
      return NextResponse.json({ 
        success: true, 
        images: mockImageData,
        source: 'mock-fallback',
        originalError: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch images from Azure Blob Storage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
