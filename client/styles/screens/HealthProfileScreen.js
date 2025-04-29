import { StyleSheet, Dimensions } from 'react-native';
import theme from '../../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;
const { width } = Dimensions.get('window');

export default StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  contentContainer: {
    padding: SPACING.MEDIUM,
    paddingTop: SPACING.MEDIUM,
    paddingBottom: 80, // 为保存按钮留出空间
  },
  
  // 卡片式部分样式
  section: {
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
    borderRadius: BORDER_RADIUS.MEDIUM,
    ...SHADOW_STYLE.SMALL,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
    marginBottom: SPACING.LARGE,
  },
  
  // 输入框样式
  input: {
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BORDER_RADIUS.SMALL,
    height: 48,
    marginBottom: SPACING.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
    fontSize: FONT_SIZE.MEDIUM,
  },
  
  // 下拉选择框样式
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BORDER_RADIUS.SMALL,
    height: 48,
    marginBottom: SPACING.MEDIUM,
    paddingHorizontal: SPACING.MEDIUM,
  },
  selectText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
  },
  
  // 选项网格样式
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  // 健康状况选项样式
  conditionItem: {
    width: '48%',
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BORDER_RADIUS.SMALL,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.SMALL,
    marginBottom: SPACING.MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  conditionText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },
  
  // 生活方式选项样式
  dietItem: {
    width: '48%',
    backgroundColor: '#EEEEEE',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BORDER_RADIUS.SMALL,
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.SMALL,
    marginBottom: SPACING.MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  
  // 选中的选项样式
  selectedOption: {
    backgroundColor: COLORS.BACKGROUND,
    borderColor: COLORS.PRIMARY,
    borderWidth: 1,
  },
  
  // 选中的选项文本样式
  selectedOptionText: {
    color: COLORS.PRIMARY,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  
  // 选项文本样式
  optionText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },
  
  // 保存按钮样式
  saveButton: {
    backgroundColor: COLORS.PRIMARY,
    height: 50,
    borderRadius: BORDER_RADIUS.MEDIUM,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.XLARGE,
    ...SHADOW_STYLE.MEDIUM,
  },
  saveButtonText: {
    color: COLORS.SECONDARY,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  
  // 模态框样式
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.LARGE,
    ...SHADOW_STYLE.LARGE,
  },
  modalTitle: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
    marginBottom: SPACING.LARGE,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalOptionText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: SPACING.LARGE,
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.SMALL,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: COLORS.SECONDARY,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  
  // 其他辅助样式
  rowLastItem: {
    marginRight: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.LARGE,
  },
}); 