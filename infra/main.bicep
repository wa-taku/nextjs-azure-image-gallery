targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Name of the storage account')
param storageAccountName string = ''

@description('Name of the App Service Plan')
param appServicePlanName string = ''

@description('Name of the Web App')
param webAppName string = ''

@description('Name of the resource group')
param resourceGroupName string = ''

// リソースグループ名の生成
var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

module resources 'resources.bicep' = {
  name: 'resources'
  scope: rg
  params: {
    location: location
    environmentName: environmentName
    resourceToken: resourceToken
    storageAccountName: storageAccountName
    appServicePlanName: appServicePlanName
    webAppName: webAppName
    tags: tags
  }
}

output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output AZURE_RESOURCE_GROUP string = rg.name
output AZURE_STORAGE_ACCOUNT_NAME string = resources.outputs.storageAccountName
output AZURE_STORAGE_CONTAINER_NAME string = resources.outputs.containerName
output WEB_APP_NAME string = resources.outputs.webAppName
output WEB_APP_URL string = resources.outputs.webAppUrl
