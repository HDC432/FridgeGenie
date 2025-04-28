import { API_URL, DEBUG } from '../config/database';

// 获取所有物品
export const getItems = async () => {
    try {
        const url = `${API_URL}/items`;
        if (DEBUG) {
            console.log('请求URL:', url);
        }
        
        // 添加超时设置
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('服务器响应错误:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const items = await response.json();
        if (DEBUG) {
            console.log('API响应数据:', items);
        }
        
        // 检查返回的数据格式
        if (!Array.isArray(items)) {
            console.error('返回的数据格式不正确:', items);
            throw new Error('返回的数据格式不正确');
        }

        // 过滤掉 Cosmos DB 的内部字段
        const processedItems = items.map(item => {
            const { _rid, _self, _etag, _attachments, _ts, ...cleanItem } = item;
            return cleanItem;
        });

        return { items: processedItems };
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error('请求超时');
            throw new Error('请求超时，请检查网络连接');
        }
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
        console.log('发送更新请求:', { id, item });
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const updatedItem = await response.json();
        console.log('更新成功:', updatedItem);
        return updatedItem;
    } catch (error) {
        console.error('更新物品失败:', error);
        throw error;
    }
};

// 删除物品
export const deleteItem = async (id) => {
    try {
        console.log('发送删除请求:', id);
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        // 检查响应状态
        if (response.status === 204 || response.status === 200) {
            console.log('删除成功:', id);
            return true;
        } else {
            throw new Error(`删除失败，状态码: ${response.status}`);
        }
    } catch (error) {
        console.error('删除物品失败:', error);
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