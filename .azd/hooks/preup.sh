#!/bin/bash

# Azure Developer CLI preup hook
# このスクリプトは azd up の前に実行されます

echo "Setting up pre-deployment configuration..."

# Node.js のバージョンを確認
echo "Checking Node.js version..."
node --version

# 依存関係をインストール
echo "Installing dependencies..."
npm ci

# アプリケーションをビルド
echo "Building application..."
npm run build

echo "Pre-deployment setup completed successfully!"
