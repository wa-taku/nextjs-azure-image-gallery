import { BlobServiceClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';

// Azure Storage Blob Service Client を初期化
export function getBlobServiceClient(): BlobServiceClient {
  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  
  if (!accountName) {
    throw new Error('AZURE_STORAGE_ACCOUNT_NAME environment variable is required');
  }

  // Managed Identity を使用してBlobServiceClientを作成
  const credential = new DefaultAzureCredential();
  const blobServiceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    credential
  );

  return blobServiceClient;
}

// コンテナからすべてのブロブ（画像）を取得
export async function listBlobs() {
  try {
    const blobServiceClient = getBlobServiceClient();
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'images';
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobs = [];

    // コンテナ内のブロブを一覧取得
    for await (const blob of containerClient.listBlobsFlat()) {
      // 画像ファイルのみをフィルタリング
      if (blob.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        blobs.push({
          name: blob.name,
          url: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${containerName}/${blob.name}`,
          lastModified: blob.properties.lastModified,
          size: blob.properties.contentLength
        });
      }
    }

    return blobs;
  } catch (error) {
    console.error('Error fetching blobs:', error);
    throw error;
  }
}

// 特定のブロブのSASトークン付きURLを生成（読み取り専用）
export async function getBlobUrl(blobName: string): Promise<string> {
  try {
    const blobServiceClient = getBlobServiceClient();
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'images';
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);
    
    // ブロブのURLを返す（Managed Identityが設定されている場合）
    return blobClient.url;
  } catch (error) {
    console.error('Error generating blob URL:', error);
    throw error;
  }
}
