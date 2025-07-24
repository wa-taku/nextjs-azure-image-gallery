# Azure Blob Storage 画像ギャラリー

Next.js と React を使用した Web アプリケーションで、Azure Blob Storage から画像を取得・表示します。Azure App Service の Managed Identity を使用してセキュアに認証を行います。

## 機能

- Azure Blob Storage からの画像一覧取得
- レスポンシブな画像ギャラリー表示
- Managed Identity による安全な認証
- リアルタイムでの画像更新
- モダンな UI/UX

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **Azure サービス**: Azure Blob Storage, Azure App Service, Managed Identity
- **認証**: Azure Identity (@azure/identity)
- **ストレージ**: Azure Storage Blob (@azure/storage-blob)

## 前提条件

- Node.js 20.x 以上
- Azure サブスクリプション
- Azure Storage Account
- Azure App Service (本番環境用)

## ローカル開発環境のセットアップ

### 1. リポジトリのクローン

\`\`\`bash
git clone <repository-url>
cd nextjs-azure-image-gallery
\`\`\`

### 2. 依存関係のインストール

\`\`\`bash
npm install
\`\`\`

### 3. 環境変数の設定

\`.env.local\` ファイルを作成し、以下の変数を設定します：

\`\`\`env
AZURE_STORAGE_ACCOUNT_NAME=your-storage-account-name
AZURE_STORAGE_CONTAINER_NAME=images
\`\`\`

### 4. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

ブラウザで http://localhost:3000 を開いてアプリケーションを確認できます。

## Azure 環境のセットアップ

### 1. Azure Storage Account の作成

\`\`\`bash
# リソースグループを作成
az group create --name myResourceGroup --location "Japan East"

# Storage Account を作成
az storage account create \\
  --name mystorageaccount \\
  --resource-group myResourceGroup \\
  --location "Japan East" \\
  --sku Standard_LRS
\`\`\`

### 2. Blob Container の作成

\`\`\`bash
# Container を作成
az storage container create \\
  --name images \\
  --account-name mystorageaccount \\
  --public-access off
\`\`\`

### 3. Azure App Service の作成

\`\`\`bash
# App Service Plan を作成
az appservice plan create \\
  --name myAppServicePlan \\
  --resource-group myResourceGroup \\
  --location "Japan East" \\
  --sku S1 \\
  --is-linux

# Web App を作成
az webapp create \\
  --resource-group myResourceGroup \\
  --plan myAppServicePlan \\
  --name myImageGalleryApp \\
  --runtime "NODE:20-lts"
\`\`\`

### 4. Managed Identity の設定

\`\`\`bash
# System-assigned Managed Identity を有効にする
az webapp identity assign \\
  --name myImageGalleryApp \\
  --resource-group myResourceGroup

# 出力される principalId をメモしておく
\`\`\`

### 5. Storage Account への権限付与

\`\`\`bash
# Storage Blob Data Reader ロールを割り当て
az role assignment create \\
  --assignee <principalId> \\
  --role "Storage Blob Data Reader" \\
  --scope "/subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.Storage/storageAccounts/<storage-account-name>"
\`\`\`

### 6. アプリケーションの設定

App Service の設定で以下の環境変数を設定します：

\`\`\`

AZURE_STORAGE_ACCOUNT_NAME=mystorageaccount
AZURE_STORAGE_CONTAINER_NAME=images

## Azure Developer CLI を使用したデプロイ

Azure Developer CLI（azd）を使用すると、インフラストラクチャとアプリケーションを一度にデプロイできます。

### 前提条件

- [Azure Developer CLI](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd) のインストール
- Azure CLI のインストールとログイン
- Azure サブスクリプションへのアクセス

### 1. Azure Developer CLI の初期化

```bash
# プロジェクトディレクトリで azd を初期化
azd init

# または、このリポジトリをクローンした場合
azd auth login
```

### 2. 環境変数の設定

`.env.example` を `.env` にコピーして、必要な値を設定：

```bash
cp .env.example .env
```

`.env` ファイルを編集：

```env
AZURE_ENV_NAME=nextjs-image-gallery-prod
AZURE_LOCATION=japaneast
AZURE_SUBSCRIPTION_ID=your-subscription-id
```

### 3. デプロイの実行

```bash
# インフラストラクチャとアプリケーションを一度にデプロイ
azd up
```

このコマンドは以下を実行します：
1. Azure リソースの作成（Storage Account, App Service Plan, Web App）
2. Managed Identity の設定
3. Storage Account への権限付与
4. アプリケーションのビルドとデプロイ

### 4. アプリケーションの更新

コードを変更した後、アプリケーションのみを再デプロイ：

```bash
azd deploy
```

### 5. リソースの削除

不要になったリソースを削除：

```bash
azd down
```

### 6. サンプル画像のアップロード

デプロイ後にサンプル画像をアップロードして動作を確認：

```bash
# サンプル画像をBlob Storageにアップロード
./scripts/upload-sample-images.sh
```

### 7. 便利なスクリプト

プロジェクトには以下のスクリプトが含まれています：

```bash
# 自動デプロイスクリプト
./scripts/deploy.sh [environment-name]

# サンプル画像アップロード
./scripts/upload-sample-images.sh
```

## Infrastructure as Code (Bicep)

このプロジェクトでは、Azure Bicep を使用してインフラストラクチャを定義しています。

### ファイル構成

```
infra/
├── main.bicep                 # メインのBicepテンプレート
├── resources.bicep            # リソース定義
├── main.parameters.json       # パラメータファイル
└── abbreviations.json         # リソース名の略語定義
```

### 作成されるリソース

- **Resource Group**: すべてのリソースを含むリソースグループ
- **Storage Account**: 画像ファイルを保存するBlob Storage
- **Blob Container**: 画像ファイル用のコンテナ（`images`）
- **App Service Plan**: Web アプリケーション用のホスティングプラン
- **Web App**: Next.js アプリケーションをホストするApp Service
- **Managed Identity**: App Service用のシステム割り当てID
- **Role Assignment**: Storage Account への読み取り権限

### 手動でのインフラストラクチャデプロイ

Azure CLI を使用して手動でデプロイすることも可能です：

```bash
# リソースグループの作成
az group create --name rg-nextjs-image-gallery --location japaneast

# Bicep テンプレートのデプロイ
az deployment group create 
  --resource-group rg-nextjs-image-gallery 
  --template-file infra/resources.bicep 
  --parameters environmentName=prod location=japaneast
```

## 従来のデプロイ方法

\`\`\`

## デプロイ

### GitHub Actions を使用したデプロイ

1. GitHub リポジトリに Publish Profile を追加：
   - Azure Portal で App Service を開く
   - 「公開プロファイルの取得」をクリック
   - ダウンロードしたファイルの内容を GitHub Secrets の \`AZUREAPPSERVICE_PUBLISHPROFILE\` に設定

2. \`.github/workflows/azure-webapps-node.yml\` の \`YOUR_APP_SERVICE_NAME\` を実際の App Service 名に変更

3. \`main\` ブランチにプッシュすると自動デプロイが実行される

### 手動デプロイ

\`\`\`bash
# ビルド
npm run build

# Azure にデプロイ
az webapp deploy \\
  --resource-group myResourceGroup \\
  --name myImageGalleryApp \\
  --src-path .
\`\`\`

## ディレクトリ構造

\`\`\`
nextjs-azure-image-gallery/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── images/
│   │   │       └── route.ts          # 画像一覧 API
│   │   ├── page.tsx                   # メインページ
│   │   └── layout.tsx                 # レイアウト
│   ├── components/
│   │   └── ImageGallery.tsx           # 画像ギャラリーコンポーネント
│   └── lib/
│       ├── azure-blob.ts              # Azure Blob Storage ユーティリティ
│       └── mock-data.ts               # 開発用モックデータ
├── infra/                             # Infrastructure as Code (Bicep)
│   ├── main.bicep                     # メインテンプレート
│   ├── resources.bicep                # リソース定義
│   ├── main.parameters.json           # デプロイパラメータ
│   └── abbreviations.json             # リソース名略語定義
├── scripts/                           # デプロイ・管理スクリプト
│   ├── deploy.sh                      # 自動デプロイスクリプト
│   └── upload-sample-images.sh        # サンプル画像アップロード
├── .azd/                              # Azure Developer CLI設定
│   └── hooks/
│       ├── preup.sh                   # デプロイ前処理
│       └── postup.sh                  # デプロイ後処理
├── .github/
│   └── workflows/
│       └── azure-webapps-node.yml     # GitHub Actions ワークフロー
├── azure.yaml                         # Azure Developer CLI設定
├── .env.example                       # 環境変数テンプレート
├── .env.local                         # 環境変数（ローカル開発用）
├── web.config                         # Azure App Service 設定
├── server.js                          # App Service用サーバー
└── next.config.ts                     # Next.js 設定
\`\`\`

## トラブルシューティング

### 認証関連の問題

#### localhost リダイレクト問題

`./scripts/deploy.sh` を実行時に localhost にリダイレクトされる問題が発生する場合：

1. **VSCode や Cloud Shell 環境での解決方法**:
   ```bash
   # デバイスコード認証を使用
   az login --use-device-code
   azd auth login --use-device-code
   ```

2. **修正されたデプロイスクリプトの使用**:
   本プロジェクトのデプロイスクリプトは自動的にデバイスコード認証を使用するように修正されています。

3. **環境変数での制御**:
   ```bash
   export AZURE_CORE_NO_COLOR=true
   export AZURE_CORE_ONLY_SHOW_ERRORS=true
   ```

#### 認証状態の確認

```bash
# Azure CLI の認証状態確認
az account show

# Azure Developer CLI の認証状態確認
azd auth login --check-status
```

### Azure Developer CLI関連

- **azd コマンドが見つからない**: Azure Developer CLI がインストールされているか確認
- **認証エラー**: `azd auth login --use-device-code` と `az login --use-device-code` の両方を実行
- **デプロイ失敗**: ログを確認して、リソース名の競合やクォータ制限をチェック
- **環境変数が見つからない**: `.env` ファイルが正しく設定されているか確認

### 認証エラー

- Managed Identity が正しく設定されているか確認
- Storage Account への適切な権限が付与されているか確認
- 環境変数が正しく設定されているか確認

### 画像が表示されない

- Storage Container にファイルがアップロードされているか確認
- ファイル名が画像拡張子（jpg, jpeg, png, gif, webp）で終わっているか確認
- Next.js の画像設定で外部ドメインが許可されているか確認

### デプロイエラー

- Node.js のバージョンが 20.x であることを確認
- 依存関係が正しくインストールされているか確認
- 環境変数が App Service で設定されているか確認

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。
