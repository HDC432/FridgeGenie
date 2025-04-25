import config from '../config/database';

const API_URL = config.apiUrl;

export const getItems = async () => {
    try {
        console.log('正在请求数据，API URL:', API_URL);
        const response = await fetch(`${API_URL}/items`);
        console.log('响应状态:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('服务器响应错误:', errorText);
            throw new Error(`获取数据失败: ${response.status} ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('获取数据时出错:', error);
        throw error;
    }
};

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
            const errorText = await response.text();
            throw new Error(`添加数据失败: ${response.status} ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('添加数据时出错:', error);
        throw error;
    }
};

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
            const errorText = await response.text();
            throw new Error(`更新数据失败: ${response.status} ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('更新数据时出错:', error);
        throw error;
    }
};

export const deleteItem = async (id) => {
    try {
        const response = await fetch(`${API_URL}/items/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`删除数据失败: ${response.status} ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('删除数据时出错:', error);
        throw error;
    }
}; 