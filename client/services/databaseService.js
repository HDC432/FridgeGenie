import { API_URL, DEBUG } from '../config/database';
import authService from './authService';

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
            console.error('getFamilyItems: familyId is missing');
            throw new Error('familyId is required');
        }

        console.log('getFamilyItems: 开始获取家庭物品，familyId:', familyId);
        const token = await authService.getToken();
        if (!token) {
            console.error('getFamilyItems: 未获取到token');
            throw new Error('Not authenticated');
        }

        const url = `${API_URL}/items/family/${familyId}`;
        console.log('getFamilyItems: 请求URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('getFamilyItems: 服务器响应状态:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('getFamilyItems: 服务器响应错误:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('getFamilyItems: 获取到的原始数据:', data);

        // 确保返回的数据格式正确
        if (!data || !Array.isArray(data.items)) {
            console.error('getFamilyItems: 返回的数据格式不正确:', data);
            throw new Error('返回的数据格式不正确');
        }

        // 过滤掉 Cosmos DB 的内部字段和零数量物品
        const processedItems = data.items
            .filter(item => item.quantity > 0) // 过滤掉零数量物品
            .map(item => {
                const { _rid, _self, _etag, _attachments, _ts, ...cleanItem } = item;
                return cleanItem;
            });

        console.log('getFamilyItems: 处理后的物品列表:', processedItems);
        return { items: processedItems };
    } catch (error) {
        console.error('getFamilyItems: 获取家庭物品失败:', error);
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

        // 获取家庭所有物品
        const familyItems = await getFamilyItems(item.familyId);
        
        // 查找同名的零数量物品
        const zeroQuantityItem = familyItems.items.find(
            existingItem => existingItem.name === item.name && existingItem.quantity === 0
        );

        // 如果找到同名的零数量物品，先删除它
        if (zeroQuantityItem) {
            console.log('找到同名的零数量物品，正在删除:', zeroQuantityItem);
            await deleteItem(zeroQuantityItem.id);
        }

        // 添加新物品
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
        // 如果新数量为0，直接删除物品
        if (newQuantity === 0) {
            console.log('物品数量为0，正在删除物品:', id);
            await deleteItem(id);
            return null;
        }

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

// 获取家庭成员
export const getFamilyMembers = async (familyId) => {
    try {
        const url = `${API_URL}/families/${familyId}/members`;
        if (DEBUG) {
            console.log('请求URL:', url);
        }
        
        const token = await authService.getToken();
        console.log('获取到的token:', token);
        
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
            console.error('服务器响应错误:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('获取到的家庭成员数据:', data);

        return data.data || [];
    } catch (error) {
        console.error('获取家庭成员失败:', error);
        throw error;
    }
}; 