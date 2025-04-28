/**
 * FridgeGenie 应用主题配置
 * 此文件包含应用全局使用的主题变量，如颜色、尺寸、字体等
 */

// 颜色方案
export const COLORS = {
  // 主要颜色
  PRIMARY: '#FFC107', // 黄色强调色
  SECONDARY: '#1F2B40', // 深蓝色辅助色
  BACKGROUND: '#FFFFFF', // 白色背景
  LIGHT_GRAY: '#F5F7FA', // 浅灰色背景/输入框
  
  // 文字颜色
  TEXT_PRIMARY: '#1F2B40', // 主要文字颜色
  TEXT_SECONDARY: '#666666', // 次要文字颜色
  TEXT_LIGHT: '#999999', // 轻文字颜色
  
  // 状态颜色
  SUCCESS: '#4CAF50', // 绿色 - 保质期 > 7 天
  WARNING: '#FFEB3B', // 黄色 - 保质期 ≤ 7 天
  ALERT: '#FF9800', // 橙色 - 保质期 ≤ 3 天
  DANGER: '#F44336', // 红色 - 保质期 ≤ 1 天
  
  // 互动颜色
  ACCENT: '#2196F3', // 蓝色强调
  DISABLED: '#E0E0E0', // 禁用状态
  
  // 其他
  DIVIDER: '#EEEEEE', // 分隔线
  TRANSPARENT: 'transparent', // 透明
  SHADOW: 'rgba(0, 0, 0, 0.1)', // 阴影颜色
};

// 字体大小
export const FONT_SIZE = {
  TINY: 12,
  SMALL: 14,
  MEDIUM: 16,
  LARGE: 18,
  XLARGE: 20,
  XXLARGE: 24,
  XXXLARGE: 28,
};

// 字体权重
export const FONT_WEIGHT = {
  LIGHT: '300',
  REGULAR: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700',
};

// 间距尺寸
export const SPACING = {
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  XLARGE: 20,
  XXLARGE: 24,
  XXXLARGE: 32,
};

// 圆角尺寸
export const BORDER_RADIUS = {
  SMALL: 4,
  MEDIUM: 8,
  LARGE: 12,
  XLARGE: 16,
  ROUNDED: 25, // 圆形按钮
  CIRCLE: 1000, // 完全圆形
};

// 阴影样式
export const SHADOW_STYLE = {
  SMALL: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 1,
  },
  MEDIUM: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  LARGE: {
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
};

// 常用样式组合
export const COMMON_STYLES = {
  CONTAINER: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  SCREEN_PADDING: {
    padding: SPACING.LARGE,
  },
  CENTER: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ROW: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  CARD: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.LARGE,
    ...SHADOW_STYLE.MEDIUM,
  },
  BUTTON: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.ROUNDED,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  BUTTON_TEXT: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
  },
  INPUT: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    height: 48,
    paddingHorizontal: SPACING.MEDIUM,
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.TEXT_PRIMARY,
  },
  HEADER_TITLE: {
    fontSize: FONT_SIZE.XXLARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.TEXT_PRIMARY,
  },
  SECTION_TITLE: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.SEMIBOLD,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.MEDIUM,
  },
};

export default {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  SPACING,
  BORDER_RADIUS,
  SHADOW_STYLE,
  COMMON_STYLES,
}; 