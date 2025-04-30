import { API_URL, DEBUG } from '../config/database';
import authService from '../services/authService';

// 获取所有物品
export const getItems = async () => {
    try {
        const token = await authService.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const url = `${API_URL}/items`;
        if (DEBUG) {
            console.log('Request URL:', url);
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        return { items: data.items || [] };
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('Request timeout, please check your connection');
        }
        console.error('Failed to get items:', error);
        throw error;
    }
};

// 获取家庭物品
export const getFamilyItems = async (familyId) => {
    try {
        if (!familyId) {
            throw new Error('familyId is required');
        }

        const token = await authService.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const url = `${API_URL}/items/family/${familyId}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        return { items: data.items || [] };
    } catch (error) {
        console.error('Failed to get family items:', error);
        throw error;
    }
};

// 添加新物品
export const addItem = async (item) => {
    try {
        if (!item.familyId) {
            throw new Error('familyId is required');
        }

        const token = await authService.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(item),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to add item:', error);
        throw error;
    }
};

// 更新物品
export const updateItem = async (id, item) => {
    try {
        if (!item.familyId) {
            throw new Error('familyId is required');
        }

        const token = await authService.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(item),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Failed to update item:', error);
        throw error;
    }
};

// 删除物品
export const deleteItem = async (id) => {
    try {
        const token = await authService.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        return true;
    } catch (error) {
        console.error('Failed to delete item:', error);
        throw error;
    }
};

// 获取单个物品
export const getItemById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const item = await response.json();
        return item;
    } catch (error) {
        console.error('获取物品失败:', error);
        throw error;
    }
};

// 更新物品数量
export const updateItemQuantity = async (id, newQuantity) => {
    try {
        // 首先获取当前物品
        const currentItem = await getItemById(id);

        // 更新数量
        const updatedItem = {
            ...currentItem,
            quantity: newQuantity,
            updatedAt: new Date().toISOString()
        };

        // 使用 PUT 方法更新整个物品
        const updateResponse = await fetch(`${API_URL}/items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedItem),
        });
        
        if (!updateResponse.ok) {
            throw new Error(`HTTP error! status: ${updateResponse.status}`);
        }
        
        return await updateResponse.json();
    } catch (error) {
        console.error('更新物品数量失败:', error);
        throw error;
    }
}; 