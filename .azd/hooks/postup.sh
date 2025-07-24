#!/bin/bash

# Azure Developer CLI postup hook
# このスクリプトは azd up の後に実行されます

echo "Post-deployment configuration..."

# サンプル画像をアップロードする場合のサンプルコード
# echo "Uploading sample images to blob storage..."
# az storage blob upload --account-name $AZURE_STORAGE_ACCOUNT_NAME --container-name $AZURE_STORAGE_CONTAINER_NAME --name sample.jpg --file ./public/next.svg --auth-mode login

echo "Deployment completed successfully!"
echo "Your application is available at: $WEB_APP_URL"
echo ""
echo "Next steps:"
echo "1. Upload images to the blob storage container: $AZURE_STORAGE_CONTAINER_NAME"
echo "2. Access your application at: $WEB_APP_URL"
echo "3. Check application logs: az webapp log tail --name $WEB_APP_NAME --resource-group $AZURE_RESOURCE_GROUP"
