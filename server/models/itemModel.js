const { container } = require('../config/database');

class ItemModel {
    static async findAll() {
        const { resources } = await container.items.readAll().fetchAll();
        return resources;
    }

    static async findById(id) {
        const { resource } = await container.item(id).read();
        return resource;
    }

    static async create(item) {
        const { resource } = await container.items.create(item);
        return resource;
    }

    static async update(id, item) {
        const { resource } = await container.item(id).replace(item);
        return resource;
    }

    static async delete(id) {
        await container.item(id).delete();
        return { message: '物品已成功删除' };
    }
}

module.exports = ItemModel; 