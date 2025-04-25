import { API_URL, DEBUG } from '../config/database';

// 获取所有物品
export const getItems = async () => {
    try {
        const url = `${API_URL}/items`;
        if (DEBUG) {
            console.log('请求URL:', url);
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (DEBUG) {
            console.log('API响应数据:', {
                items: data,
                totalItems: data.length
            });
        }
        
        if (!data || !Array.isArray(data)) {
            throw new Error('返回的数据格式不正确');
        }
        
        return data;
    } catch (error) {
        console.error('获取物品列表失败:', error);
        throw error;
    }
};

// 添加新物品
export const addItem = async (item) => {
    try {
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('添加物品失败:', error);
        throw error;
    }
};

// 更新物品
export const updateItem = async (id, item) => {
    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('更新物品失败:', error);
        throw error;
    }
};

// 删除物品
export const deleteItem = async (id) => {
    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('删除物品失败:', error);
        throw error;
    }
}; 