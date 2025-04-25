import { API_URL, DEBUG } from '../config/database';

// 获取所有物品
export const getItems = async (page = 1, limit = 5) => {
    try {
        const url = `${API_URL}/items?page=${page}&limit=${limit}`;
        if (DEBUG) {
            console.log('请求URL:', url);
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
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

        // 计算分页信息
        const totalItems = items.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = items.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage: limit
            }
        };
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
        const url = `${API_URL}/items/${id}`;
        if (DEBUG) {
            console.log('删除物品请求URL:', url);
        }
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        // 检查响应状态
        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorData.message || '删除失败';
            } catch (e) {
                errorMessage = await response.text() || '删除失败';
            }
            console.error('删除物品失败，响应内容:', errorMessage);
            throw new Error(`删除失败: ${errorMessage}`);
        }
        
        // 尝试解析响应
        let data;
        try {
            data = await response.json();
        } catch (e) {
            // 如果响应为空，返回成功状态
            if (response.status === 204) {
                return {
                    success: true,
                    message: '物品已成功删除',
                    id
                };
            }
            throw new Error('无法解析服务器响应');
        }
        
        if (DEBUG) {
            console.log('删除物品成功，响应数据:', data);
        }
        
        return data;
    } catch (error) {
        console.error('删除物品失败:', error);
        throw error;
    }
}; 