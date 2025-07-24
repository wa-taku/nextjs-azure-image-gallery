#!/bin/bash

# Azure Developer CLI デプロイスクリプト
# 使用方法: ./scripts/deploy.sh [environment-name]

set -e

ENVIRONMENT_NAME=${1:-"dev"}
LOCATION=${AZURE_LOCATION:-"japaneast"}

# 非対話的環境での認証設定
export AZURE_CORE_NO_COLOR=true
export AZURE_CORE_ONLY_SHOW_ERRORS=true

echo "🚀 Azure Developer CLI を使用してデプロイを開始します..."
echo "環境名: $ENVIRONMENT_NAME"
echo "リージョン: $LOCATION"
echo ""

# Azure Developer CLI がインストールされているかチェック
if ! command -v azd &> /dev/null; then
    echo "❌ Azure Developer CLI (azd) がインストールされていません。"
    echo "インストール方法: https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd"
    exit 1
fi

# Azure CLI がインストールされているかチェック
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI がインストールされていません。"
    echo "インストール方法: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Azure にログインしているかチェック
if ! az account show &> /dev/null; then
    echo "🔐 Azure にログインしています（デバイスコード認証）..."
    az login --use-device-code
fi

# Azure Developer CLI にログイン（デバイスコード認証を使用）
if ! azd auth login --check-status &> /dev/null; then
    echo "🔐 Azure Developer CLI にログインしています（デバイスコード認証）..."
    azd auth login --use-device-code
fi

# 環境の初期化（既に存在する場合はスキップ）
if [ ! -f ".azure/$ENVIRONMENT_NAME/.env" ]; then
    echo "📝 環境を初期化しています..."
    azd env new $ENVIRONMENT_NAME
fi

# 環境を選択
azd env select $ENVIRONMENT_NAME

# 依存関係のチェック
echo "📦 依存関係をチェックしています..."
if [ ! -d "node_modules" ]; then
    echo "📦 依存関係をインストールしています..."
    npm ci
fi

# アプリケーションをビルド
echo "🔨 アプリケーションをビルドしています..."
npm run build

# デプロイの実行
echo "🚀 デプロイを実行しています..."
azd up

echo ""
echo "✅ デプロイが完了しました！"
echo ""

# デプロイ後の情報を表示
echo "📋 デプロイ情報:"
azd env get-values

echo ""
echo "🌐 アプリケーションにアクセス:"
WEB_APP_URL=$(azd env get-value WEB_APP_URL)
if [ ! -z "$WEB_APP_URL" ]; then
    echo "$WEB_APP_URL"
else
    echo "URL の取得に失敗しました。Azure Portal で確認してください。"
fi

echo ""
echo "📄 ログの確認:"
WEB_APP_NAME=$(azd env get-value WEB_APP_NAME)
AZURE_RESOURCE_GROUP=$(azd env get-value AZURE_RESOURCE_GROUP)
if [ ! -z "$WEB_APP_NAME" ] && [ ! -z "$AZURE_RESOURCE_GROUP" ]; then
    echo "az webapp log tail --name $WEB_APP_NAME --resource-group $AZURE_RESOURCE_GROUP"
fi
