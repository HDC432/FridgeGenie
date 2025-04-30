// Generate user avatar text
export const generateAvatarText = (username, maxLength = 2) => {
  if (!username) return '?';
  return username
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, maxLength);
};

// 生成随机背景颜色
export const generateAvatarColor = (username) => {
  if (!username) return '#666';
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
  ];
  const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}; 