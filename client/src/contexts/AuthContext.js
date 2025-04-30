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
      // Only clear storage if it's definitely an authentication error
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
    // Don't automatically logout here, let the user decide whether to login again
  }
}; 