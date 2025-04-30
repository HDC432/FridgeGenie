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
import BottomNav from '../components/BottomNav';

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
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const quickSelectOptions = [
    { label: 'Today', days: 0 },
    { label: 'Tomorrow', days: 1 },
    { label: 'Next Week', days: 7 },
    { label: 'Two Weeks Later', days: 14 },
  ];

  return (
    <View style={styles.simpleDatePickerContainer}>
      <View style={styles.simpleDatePickerHeader}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.datePickerTitle}>Select Expiry Date</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.doneButton}>Done</Text>
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
        Alert.alert('Error', 'Please join or create a family first');
        return;
      }

      if (!name || !quantity || !expiryDate) {
        Alert.alert('Error', 'Please fill in all required fields');
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
      Alert.alert('Success', 'Item added to fridge');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to add item:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to add item, please try again');
    }
  };

  // Scan receipt feature
  const handleScanReceipt = () => {
    Alert.alert('Feature Notice', 'Scan receipt feature coming soon');
  };

  // Voice input feature
  const handleVoiceInput = () => {
    Alert.alert('Feature Notice', 'Voice input feature coming soon');
  };

  return (
    <View style={{flex: 1, justifyContent: 'space-between'}}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Add Item</Text>
            <Text style={styles.subtitle}>
              Add new food items to your fridge list and set expiry dates
            </Text>

            <View style={styles.formSection}>
              {/* Item Name */}
              <Text style={styles.label}>Item Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Milk, Eggs..."
                value={name}
                onChangeText={setName}
              />

              {/* Quantity */}
              <Text style={styles.label}>Quantity</Text>
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

              {/* Expiry Date */}
              <Text style={styles.label}>Expiry Date</Text>
              <TouchableOpacity
                style={styles.datePickerBtn}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {format(expiryDate, 'MM/dd/yyyy')}
                </Text>
                <Ionicons name="calendar-outline" size={24} color={COLORS.SECONDARY} />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>Add to Fridge</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Bottom Action Buttons */}
        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={styles.bottomButton} onPress={handleScanReceipt}>
            <View style={styles.bottomButtonIconContainer}>
              <Ionicons name="scan-outline" size={24} color={COLORS.SECONDARY} />
            </View>
            <Text style={styles.bottomButtonText}>Scan Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.bottomButton} onPress={handleVoiceInput}>
            <View style={styles.bottomButtonIconContainer}>
              <Ionicons name="mic-outline" size={24} color={COLORS.SECONDARY} />
            </View>
            <Text style={styles.bottomButtonText}>Voice Input</Text>
          </TouchableOpacity>
        </View>

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
      <BottomNav />
    </View>
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
    paddingBottom: 100, // 为底部按钮留出空间
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
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  bottomButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  bottomButtonIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.LIGHT_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  bottomButtonText: {
    fontSize: FONT_SIZE.SMALL,
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
  // 日期选择器样式
  simpleDatePickerContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.MEDIUM,
    padding: SPACING.MEDIUM,
    width: Platform.OS === 'web' ? 400 : '100%',
    maxWidth: Platform.OS === 'web' ? 400 : '100%',
    alignSelf: 'center',
    ...SHADOW_STYLE.LARGE,
  },
  simpleDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  datePickerTitle: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
  },
  cancelButton: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.MEDIUM,
  },
  doneButton: {
    color: COLORS.PRIMARY,
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  monthNavigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.MEDIUM,
  },
  monthText: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.MEDIUM,
  },
  quickSelectButton: {
    backgroundColor: COLORS.LIGHT_GRAY,
    paddingHorizontal: SPACING.SMALL,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.SMALL,
  },
  quickSelectText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.SECONDARY,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SMALL,
  },
  weekDayText: {
    width: Platform.OS === 'web' ? 40 : 35,
    textAlign: 'center',
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: Platform.OS === 'web' ? 40 : 35,
    height: Platform.OS === 'web' ? 40 : 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  calendarDayText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_PRIMARY,
  },
  otherMonthDay: {
    opacity: 0.5,
  },
  otherMonthDayText: {
    color: COLORS.TEXT_SECONDARY,
  },
  today: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: BORDER_RADIUS.CIRCLE,
  },
  todayText: {
    color: COLORS.PRIMARY,
    fontWeight: FONT_WEIGHT.BOLD,
  },
  selectedDay: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: BORDER_RADIUS.CIRCLE,
  },
  selectedDayText: {
    color: COLORS.WHITE,
    fontWeight: FONT_WEIGHT.BOLD,
  },
});

export default AddItemScreen;
