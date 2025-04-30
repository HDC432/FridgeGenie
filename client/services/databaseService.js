import { API_URL, DEBUG } from '../config/database';
import authService from './authService';

// Get all items
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

// Get family items
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
        console.log('Family items data received:', data);

        // Ensure correct data format
        if (!data || !Array.isArray(data.items)) {
            console.error('Invalid data format:', data);
            throw new Error('Invalid data format');
        }

        // Filter out Cosmos DB internal fields and zero quantity items
        const processedItems = data.items
            .filter(item => item.quantity > 0) // Filter out zero quantity items
            .map(item => {
                const { _rid, _self, _etag, _attachments, _ts, ...cleanItem } = item;
                return cleanItem;
            });

        return { items: processedItems };
    } catch (error) {
        console.error('Failed to get family items:', error);
        throw error;
    }
};

// Add new item
export const addItem = async (item) => {
    try {
        if (!item.familyId) {
            throw new Error('familyId is required');
        }

        const token = await authService.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        // Get all family items
        const familyItems = await getFamilyItems(item.familyId);
        
        // Find zero quantity item with same name
        const zeroQuantityItem = familyItems.items.find(
            existingItem => existingItem.name === item.name && existingItem.quantity === 0
        );

        // If found zero quantity item with same name, delete it first
        if (zeroQuantityItem) {
            console.log('Found zero quantity item with same name, deleting:', zeroQuantityItem);
            await deleteItem(zeroQuantityItem.id);
        }

        // Add new item
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

// Update item
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

// Delete item
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

// Get single item
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
        console.error('Failed to get item:', error);
        throw error;
    }
};

// Update item quantity
export const updateItemQuantity = async (id, newQuantity) => {
    try {
        // If new quantity is 0, delete the item
        if (newQuantity === 0) {
            console.log('Item quantity is 0, deleting item:', id);
            await deleteItem(id);
            return null;
        }

        // First get current item
        const currentItem = await getItemById(id);

        // Update quantity
        const updatedItem = {
            ...currentItem,
            quantity: newQuantity,
            updatedAt: new Date().toISOString()
        };

        // Use PUT method to update the entire item
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
        console.error('Failed to update item quantity:', error);
        throw error;
    }
};

// Get family members
export const getFamilyMembers = async (familyId) => {
    try {
        const url = `${API_URL}/families/${familyId}/members`;
        if (DEBUG) {
            console.log('Request URL:', url);
        }
        
        const token = await authService.getToken();
        console.log('Token received:', token);
        
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
            console.error('Server response error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Family members data received:', data);

        return data.data || [];
    } catch (error) {
        console.error('Failed to get family members:', error);
        throw error;
    }
}; 