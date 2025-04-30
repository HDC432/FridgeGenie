const checkAuth = async () => {
  try {
    const token = await authService.getToken();
    if (!token) {
      setUser(null);
      return;
    }

    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // 只有在明确是认证错误时才清除存储
      if (response.status === 401) {
        await authService.logout();
        setUser(null);
      }
      return;
    }

    const data = await response.json();
    setUser(data);
  } catch (error) {
    console.error('Auth check failed:', error);
    // 不要在这里自动登出，让用户自己决定是否要重新登录
  }
}; 