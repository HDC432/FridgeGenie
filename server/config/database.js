const { CosmosClient } = require('@azure/cosmos');

// Cosmos DB 配置
const cosmosClient = new CosmosClient({
    endpoint: 'https://fridgegenie-db.documents.azure.com:443/',
    key: 'WOKhsjYMsn4pDid4n9tqZwKV2foZdqbZRPSaKIX68vsI5TtbEy70OqPZgvDn1fh85PL8gVgOjzW8ACDbQO8xHQ=='
});

// 初始化数据库连接
const database = cosmosClient.database('fridgegenie-db');

// 创建或获取容器
const usersContainer = database.container('users');
const familiesContainer = database.container('families');
const itemsContainer = database.container('items');
const healthProfilesContainer = database.container('healthProfiles');

// 确保容器存在
async function ensureContainers() {
    try {
        console.log('正在确保容器存在...');
        await database.containers.createIfNotExists({ 
            id: 'users',
            partitionKey: { paths: ['/id'] }
        });
        console.log('users 容器已就绪');

        await database.containers.createIfNotExists({ 
            id: 'families',
            partitionKey: { paths: ['/id'] }
        });
        console.log('families 容器已就绪');

        await database.containers.createIfNotExists({ 
            id: 'items',
            partitionKey: { paths: ['/familyId'] }
        });
        console.log('items 容器已就绪');

        await database.containers.createIfNotExists({ 
            id: 'healthProfiles',
            partitionKey: { paths: ['/userId'] }
        });
        console.log('healthProfiles 容器已就绪');
    } catch (error) {
        console.error('确保容器存在失败:', error);
        process.exit(1);
    }
}

// 立即执行容器初始化
ensureContainers();

module.exports = {
    usersContainer,
    familiesContainer,
    itemsContainer,
    healthProfilesContainer
}; 