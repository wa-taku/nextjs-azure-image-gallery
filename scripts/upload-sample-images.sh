#!/bin/bash

# サンプル画像をAzure Blob Storageにアップロードするスクリプト
# 使用方法: ./scripts/upload-sample-images.sh

set -e

echo "📸 サンプル画像をアップロードしています..."

# 環境変数の確認
STORAGE_ACCOUNT_NAME=$(azd env get-value AZURE_STORAGE_ACCOUNT_NAME 2>/dev/null || echo "")
CONTAINER_NAME=$(azd env get-value AZURE_STORAGE_CONTAINER_NAME 2>/dev/null || echo "images")

if [ -z "$STORAGE_ACCOUNT_NAME" ]; then
    echo "❌ AZURE_STORAGE_ACCOUNT_NAME が設定されていません。"
    echo "先に 'azd up' を実行してください。"
    exit 1
fi

echo "Storage Account: $STORAGE_ACCOUNT_NAME"
echo "Container: $CONTAINER_NAME"

# サンプル画像ディレクトリを作成
mkdir -p sample-images

# サンプル画像をダウンロード（実際の使用時はここに画像ファイルを配置）
echo "📁 サンプル画像を準備しています..."

# Unsplash から無料の画像をダウンロード（例）
curl -L "https://picsum.photos/800/600?random=1" -o sample-images/sample-1.jpg
curl -L "https://picsum.photos/800/600?random=2" -o sample-images/sample-2.jpg  
curl -L "https://picsum.photos/800/600?random=3" -o sample-images/sample-3.jpg

echo "📤 画像をアップロードしています..."

# 各画像をアップロード
for image in sample-images/*.jpg; do
    if [ -f "$image" ]; then
        filename=$(basename "$image")
        echo "アップロード中: $filename"
        
        az storage blob upload \
            --account-name "$STORAGE_ACCOUNT_NAME" \
            --container-name "$CONTAINER_NAME" \
            --name "$filename" \
            --file "$image" \
            --auth-mode login \
            --overwrite
    fi
done

echo ""
echo "✅ サンプル画像のアップロードが完了しました！"
echo ""
echo "🌐 アプリケーションにアクセスして画像を確認してください："
WEB_APP_URL=$(azd env get-value WEB_APP_URL 2>/dev/null || echo "")
if [ ! -z "$WEB_APP_URL" ]; then
    echo "$WEB_APP_URL"
fi

# クリーンアップ
rm -rf sample-images

echo ""
echo "📋 Blob Storage の内容を確認:"
az storage blob list \
    --account-name "$STORAGE_ACCOUNT_NAME" \
    --container-name "$CONTAINER_NAME" \
    --auth-mode login \
    --output table
