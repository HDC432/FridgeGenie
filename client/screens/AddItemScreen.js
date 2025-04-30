import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { addItem } from '../services/databaseService';
import { useAuth } from '../contexts/AuthContext';
import theme from '../styles/theme';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

// 改进的日期选择器实现
const SimpleDatePicker = ({ date, onDateChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // 生成当前月份的日历数据
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // 添加上个月的最后几天
    const firstDayWeekday = firstDay.getDay();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: format(prevDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
      });
    }
    
    // 添加当前月的天数
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
      });
    }
    
    // 添加下个月的前几天
    const remainingDays = 42 - days.length; // 6行7列
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: format(nextDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const quickSelectOptions = [
    { label: '今天', days: 0 },
    { label: '明天', days: 1 },
    { label: '一周后', days: 7 },
    { label: '两周后', days: 14 },
  ];

  return (
    <View style={styles.simpleDatePickerContainer}>
      <View style={styles.simpleDatePickerHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.datePickerTitle}>选择过期日期</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.doneButton}>完成</Text>
        </TouchableOpacity>
      </View>

      {/* 月份导航 */}
      <View style={styles.monthNavigator}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Ionicons name="chevron-back" size={24} color={COLORS.SECONDARY} />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {format(currentMonth, 'yyyy年MM月')}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.SECONDARY} />
        </TouchableOpacity>
      </View>

      {/* 快速选择选项 */}
      <View style={styles.quickSelectContainer}>
        {quickSelectOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickSelectButton}
            onPress={() => {
              const newDate = addDays(new Date(), option.days);
              onDateChange(newDate);
            }}
          >
            <Text style={styles.quickSelectText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 星期标题 */}
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* 日历网格 */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.calendarDay,
              !day.isCurrentMonth && styles.otherMonthDay,
              day.isToday && styles.today,
              format(date, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd') && styles.selectedDay,
            ]}
            onPress={() => onDateChange(day.date)}
          >
            <Text
              style={[
                styles.calendarDayText,
                !day.isCurrentMonth && styles.otherMonthDayText,
                day.isToday && styles.todayText,
                format(date, 'yyyy-MM-dd') === format(day.date, 'yyyy-MM-dd') && styles.selectedDayText,
              ]}
            >
              {day.date.getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const AddItemScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // 增减数量
  const increaseQuantity = () => {
    const current = parseInt(quantity, 10) || 0;
    setQuantity((current + 1).toString());
  };

  const decreaseQuantity = () => {
    const current = parseInt(quantity, 10) || 0;
    if (current > 1) {
      setQuantity((current - 1).toString());
    }
  };

  // 提交添加物品
  const handleSubmit = async () => {
    try {
      if (!user?.familyId) {
        Alert.alert('错误', '请先加入或创建一个家庭');
        return;
      }

      if (!name || !quantity || !expiryDate) {
        Alert.alert('错误', '请填写必填字段');
        return;
      }

      setLoading(true);

      const newItem = {
        name,
        quantity: parseInt(quantity),
        expiryDate: expiryDate.toISOString(),
        familyId: user.familyId,
        createdAt: new Date().toISOString()
      };

      await addItem(newItem);
      setLoading(false);
      Alert.alert('成功', '物品已添加到冰箱');
      navigation.goBack();
    } catch (error) {
      console.error('添加物品失败:', error);
      setLoading(false);
      Alert.alert('错误', '添加物品失败，请重试');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>添加物品</Text>
          <Text style={styles.subtitle}>
            将新的食品添加到你的冰箱清单中，并设置过期日期
          </Text>

          <View style={styles.formSection}>
            {/* 物品名称 */}
            <Text style={styles.label}>物品名称</Text>
            <TextInput
              style={styles.input}
              placeholder="例如：牛奶、鸡蛋..."
              value={name}
              onChangeText={setName}
            />

            {/* 数量 */}
            <Text style={styles.label}>数量</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={decreaseQuantity}
              >
                <Ionicons name="remove" size={24} color={COLORS.SECONDARY} />
              </TouchableOpacity>
              <View style={styles.quantityInputContainer}>
                <TextInput
                  style={styles.quantityInput}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="number-pad"
                  textAlign="center"
                />
              </View>
              <TouchableOpacity
                style={styles.quantityBtn}
                onPress={increaseQuantity}
              >
                <Ionicons name="add" size={24} color={COLORS.SECONDARY} />
              </TouchableOpacity>
            </View>

            {/* 过期日期 */}
            <Text style={styles.label}>过期日期</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {format(expiryDate, 'yyyy年MM月dd日')}
              </Text>
              <Ionicons name="calendar-outline" size={24} color={COLORS.SECONDARY} />
            </TouchableOpacity>
          </View>

          {/* 提交按钮 */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>添加到冰箱</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 日期选择器模态框 */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <Pressable style={styles.modalContainer} onPress={e => e.stopPropagation()}>
            <SimpleDatePicker
              date={expiryDate}
              onDateChange={setExpiryDate}
              onClose={() => setShowDatePicker(false)}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.LARGE,
  },
  title: {
    fontSize: FONT_SIZE.LARGE,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
    marginTop: SPACING.MEDIUM,
  },
  subtitle: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SMALL,
    marginBottom: SPACING.LARGE,
  },
  formSection: {
    marginTop: SPACING.MEDIUM,
  },
  label: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.MEDIUM,
    color: COLORS.SECONDARY,
    marginBottom: SPACING.SMALL,
    marginTop: SPACING.LARGE,
  },
  input: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  datePickerBtn: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityBtn: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.CIRCLE,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityInputContainer: {
    flex: 1,
    marginHorizontal: SPACING.LARGE,
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  quantityInput: {
    fontSize: FONT_SIZE.LARGE,
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.XXLARGE,
    height: 50,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
  },
  // 模态框样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: BORDER_RADIUS.LARGE, 
    borderTopRightRadius: BORDER_RADIUS.LARGE,
    width: '100%',
  },
  // 简易日期选择器样式
  simpleDatePickerContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderTopLeftRadius: BORDER_RADIUS.LARGE,
    borderTopRightRadius: BORDER_RADIUS.LARGE,
    width: '100%',
  },
  simpleDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  datePickerTitle: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
  },
  cancelButton: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.MEDIUM,
    padding: SPACING.SMALL,
  },
  doneButton: {
    color: COLORS.PRIMARY,
    fontWeight: FONT_WEIGHT.BOLD,
    fontSize: FONT_SIZE.MEDIUM,
    padding: SPACING.SMALL,
  },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.MEDIUM,
  },
  monthText: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  quickSelectButton: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
    backgroundColor: COLORS.LIGHT_GRAY,
  },
  quickSelectText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.SECONDARY,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingVertical: SPACING.SMALL,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.SMALL,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
  },
  otherMonthDay: {
    opacity: 0.5,
  },
  otherMonthDayText: {
    color: COLORS.TEXT_SECONDARY,
  },
  today: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: BORDER_RADIUS.CIRCLE,
  },
  todayText: {
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.PRIMARY,
  },
  selectedDay: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.CIRCLE,
  },
  selectedDayText: {
    color: COLORS.SECONDARY,
    fontWeight: FONT_WEIGHT.BOLD,
  },
});

export default AddItemScreen;
