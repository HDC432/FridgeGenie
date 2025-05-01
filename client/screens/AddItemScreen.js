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
import { Picker } from '@react-native-picker/picker';

const { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, BORDER_RADIUS, SHADOW_STYLE, COMMON_STYLES } = theme;

/**
 * Simple date picker component for selecting expiry dates
 * @param {Object} props - Component props
 * @param {Date} props.date - Currently selected date
 * @param {Function} props.onDateChange - Callback when date is changed
 * @param {Function} props.onClose - Callback when picker is closed
 * @returns {JSX.Element} Date picker component
 */
const SimpleDatePicker = ({ date, onDateChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  
  /**
   * Generates array of years for year selector
   * @returns {number[]} Array of years
   */
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  /**
   * Generates array of months (0-11) for month selector
   * @returns {number[]} Array of months
   */
  const generateMonthOptions = () => {
    return Array.from({ length: 12 }, (_, i) => i);
  };

  /**
   * Generates calendar days for the selected month
   * @returns {Array<{date: Date, isCurrentMonth: boolean, isToday: boolean}>} Calendar days
   */
  const generateCalendarDays = () => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add days from previous month
    const firstDayWeekday = firstDay.getDay();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: format(prevDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
      });
    }
    
    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
      });
    }
    
    // Add days from next month
    const remainingDays = 42 - days.length;
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
  const yearOptions = generateYearOptions();
  const monthOptions = generateMonthOptions();

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCurrentMonth(new Date(year, selectedMonth, 1));
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setCurrentMonth(new Date(selectedYear, month, 1));
  };

  const quickSelectOptions = [
    { label: 'Today', days: 0 },
    { label: 'Tomorrow', days: 1 },
    { label: '1 Week', days: 7 },
    { label: '2 Weeks', days: 14 },
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

      {/* Year and Month Selector */}
      <View style={styles.yearMonthSelector}>
        <View style={styles.selectContainer}>
          <Text style={styles.selectLabel}>Year:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedYear.toString()}
              onValueChange={(value) => handleYearChange(Number(value))}
              style={styles.picker}
            >
              {yearOptions.map((year) => (
                <Picker.Item key={year} label={year.toString()} value={year.toString()} />
              ))}
            </Picker>
          </View>
        </View>
        <View style={styles.selectContainer}>
          <Text style={styles.selectLabel}>Month:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMonth.toString()}
              onValueChange={(value) => handleMonthChange(Number(value))}
              style={styles.picker}
            >
              {monthOptions.map((month) => (
                <Picker.Item key={month} label={(month + 1).toString()} value={month.toString()} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* Quick Select Options */}
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

      {/* Week Days Header */}
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <Text key={index} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
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

/**
 * AddItemScreen Component
 * Provides interface for adding new items to the refrigerator.
 * Includes form validation, image upload, and category selection functionality.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.navigation - Navigation object from React Navigation
 * @returns {JSX.Element} AddItemScreen component
 */
const AddItemScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * Increases the quantity by 1
   */
  const increaseQuantity = () => {
    const current = parseInt(quantity, 10) || 0;
    setQuantity((current + 1).toString());
  };

  /**
   * Decreases the quantity by 1 if greater than 1
   */
  const decreaseQuantity = () => {
    const current = parseInt(quantity, 10) || 0;
    if (current > 1) {
      setQuantity((current - 1).toString());
    }
  };

  /**
   * Handles form submission and item creation
   * @async
   * @function handleSubmit
   */
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Add Item</Text>
          <Text style={styles.subtitle}>
            Add a new item to your fridge and set its expiry date
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
                {format(expiryDate, 'yyyy/MM/dd')}
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

      {/* Date Picker Modal */}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: BORDER_RADIUS.LARGE,
    width: '95%',
    maxWidth: 400,
    maxHeight: '90%',
    overflow: 'hidden',
    margin: SPACING.MEDIUM,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  // 简易日期选择器样式
  simpleDatePickerContainer: {
    backgroundColor: COLORS.BACKGROUND,
    width: '100%',
    paddingBottom: SPACING.MEDIUM,
  },
  simpleDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: COLORS.WHITE,
  },
  datePickerTitle: {
    fontSize: FONT_SIZE.MEDIUM,
    fontWeight: FONT_WEIGHT.BOLD,
    color: COLORS.SECONDARY,
    textAlign: 'center',
    flex: 1,
  },
  cancelButton: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: FONT_SIZE.MEDIUM,
    padding: SPACING.SMALL,
    minWidth: 60,
    textAlign: 'center',
  },
  doneButton: {
    color: COLORS.PRIMARY,
    fontWeight: FONT_WEIGHT.BOLD,
    fontSize: FONT_SIZE.MEDIUM,
    padding: SPACING.SMALL,
    minWidth: 60,
    textAlign: 'center',
  },
  yearMonthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.SMALL,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: SPACING.SMALL,
  },
  selectLabel: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.SECONDARY,
    marginRight: SPACING.SMALL,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  pickerContainer: {
    flex: 1,
    maxWidth: 120,
    borderRadius: BORDER_RADIUS.SMALL,
    backgroundColor: COLORS.LIGHT_GRAY,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  quickSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: SPACING.MEDIUM,
    paddingHorizontal: SPACING.SMALL,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    flexWrap: 'wrap',
    gap: SPACING.SMALL,
  },
  quickSelectButton: {
    paddingHorizontal: SPACING.MEDIUM,
    paddingVertical: SPACING.SMALL,
    borderRadius: BORDER_RADIUS.MEDIUM,
    backgroundColor: COLORS.LIGHT_GRAY,
    minWidth: 70,
    alignItems: 'center',
  },
  quickSelectText: {
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.SECONDARY,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.SMALL,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: FONT_WEIGHT.MEDIUM,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: COLORS.WHITE,
    padding: SPACING.MEDIUM,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  calendarDayText: {
    fontSize: FONT_SIZE.MEDIUM,
    color: COLORS.SECONDARY,
    width: '100%',
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    borderRadius: BORDER_RADIUS.CIRCLE,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthDayText: {
    color: COLORS.TEXT_SECONDARY,
  },
  today: {
    backgroundColor: COLORS.LIGHT_GRAY,
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
