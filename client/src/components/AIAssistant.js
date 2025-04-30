import React, { useState, useRef, useEffect } from 'react';
import chrono from 'chrono-node';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Buffer } from 'buffer';
import { sendMessageToAI, estimateExpiryDate } from '../services/openai';
import { recognizeSpeech, getAudioFormat } from '../services/speechService';
import { API_URL, ERROR_MESSAGES } from '../config';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { addItem, getFamilyItems, deleteItem, updateItem } from '../../services/databaseService';
import { useNavigation } from '@react-navigation/native';

const chineseNumMap = {
  '一': 1, '二': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8,
  '九': 9, '十': 10
};

function chineseToNumber(str) {
  if (str.length === 1) {
    return chineseNumMap[str] || 0;
  }
  // "十三""十五"等
  if (str[0] === '十') {
    return 10 + (chineseNumMap[str[1]] || 0);
  }
  // "二十""三十"等
  if (str[str.length - 1] === '十') {
    return (chineseNumMap[str[0]] || 0) * 10;
  }
  // "二十三""三十一"等
  if (str.length === 3 && str[1] === '十') {
    return (chineseNumMap[str[0]] || 0) * 10 + (chineseNumMap[str[2]] || 0);
  }
  return 0;
}

const AIAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef();
  const recordingTimerRef = useRef(null);
  const windowHeight = Dimensions.get('window').height;
  const navigation = useNavigation();

  // Add date utility functions
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Add relative date handling function
  const getRelativeDateString = (daysToAdd) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    return getLocalDateString(targetDate);
  };

  // Add default date handling function
  const getDefaultDateString = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    // Default to 7 days later
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + 7);
    return getLocalDateString(targetDate);
  };

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recording]);

  const onRecordingStatusUpdate = (status) => {
    if (status.isRecording) {
      const duration = status.durationMillis / 1000;
      setRecordingDuration(duration);
      console.log('Recording duration:', duration);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    Animated.spring(slideAnim, {
      toValue: isOpen ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const startRecording = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Error', ERROR_MESSAGES.PERMISSION_DENIED);
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false
      });

      // Create and prepare recording
      const newRecording = new Audio.Recording();
      try {
        await newRecording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: 2,
            audioEncoder: 3,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
            sampleRate: 16000,
            numberOfChannels: 1,
            bitRate: 64000,
            linearPCM: false,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 64000,
          }
        });

        await newRecording.startAsync();
        console.log('Recording started');
        
        setRecording(newRecording);
        setIsRecording(true);
        setRecordingDuration(0);
        
        // Set up status update listener
        newRecording.setOnRecordingStatusUpdate(onRecordingStatusUpdate);
        
        // Start timer as backup
        recordingTimerRef.current = setInterval(() => {
          setRecordingDuration(prev => prev + 0.1);
        }, 100);
      } catch (error) {
        console.error('Recording preparation error:', error);
        if (newRecording) {
          try {
            await newRecording.stopAndUnloadAsync();
          } catch (cleanupError) {
            console.error('Error cleaning up recording:', cleanupError);
          }
        }
        throw error;
      }
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Recording Error', ERROR_MESSAGES.SPEECH_RECOGNITION_ERROR);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setRecordingDuration(0);

      if (!uri) {
        throw new Error('Recording file was not generated');
      }

      console.log('Starting speech recognition for recording:', uri);
      const text = await recognizeSpeech(uri);
      
      if (!text) {
        throw new Error('No text was recognized from the recording');
      }

      console.log('Speech recognition result:', text);
      setInputText(text);
      
      // Automatically send the message if text was recognized
      const userMessage = {
        text: text,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const aiResponse = await sendMessageToAI(text);
        await handleAIResponse(aiResponse);
      } catch (error) {
        console.error('Error sending message to AI:', error);
        const errorMessage = {
          text: ERROR_MESSAGES.SERVER_ERROR,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorMessage]);
        speak(ERROR_MESSAGES.SERVER_ERROR);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Recording stop error:', error);
      Alert.alert(
        'Speech Recognition Error',
        error.message || ERROR_MESSAGES.SPEECH_RECOGNITION_ERROR,
        [{ text: 'OK' }]
      );
    }
  };

  const speak = async (text) => {
    try {
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (err) {
      console.error('Speech synthesis error:', err);
    }
  };

  const handleAIResponse = async (response) => {
    try {
      if (!user || !user.familyId) {
        throw new Error('Please log in to manage items');
      }

      // Parse AI response to extract action information
      const action = parseAIResponse(response);
      let operationResult = '';
      
      if (action) {
        if (action.type === 'CHAT') {
          // For chat messages, use the original response directly
          operationResult = response;
        } else {
          // Execute the corresponding action for specific commands
          await executeAction(action);
          
          // Generate success message based on action type
          switch (action.type) {
            case 'ADD_ITEM':
              operationResult = `Successfully added ${action.quantity} ${action.item}(s) to your fridge.`;
              break;
            case 'DELETE_ITEM':
              operationResult = `Successfully deleted ${action.item} from your fridge.`;
              break;
            case 'UPDATE_ITEM':
              operationResult = `Successfully updated ${action.item} quantity to ${action.quantity}.`;
              break;
          }
        }
      } else {
        // If no action was parsed, use the original response
        operationResult = response;
      }

      // Add AI's response to message list
      const assistantMessage = {
        text: operationResult,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Read out AI's response
      speak(operationResult);

      // Refresh the home screen if needed
      if (action && (action.type === 'ADD_ITEM' || action.type === 'DELETE_ITEM' || action.type === 'UPDATE_ITEM')) {
        navigation.setParams({ refresh: Date.now() });
      }
    } catch (error) {
      console.error('Error handling AI response:', error);
      const errorMessage = {
        text: error.message || ERROR_MESSAGES.SERVER_ERROR,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speak(error.message || ERROR_MESSAGES.SERVER_ERROR);
      
      // Show alert for authentication errors
      if (error.message.includes('authenticated') || error.message.includes('log in')) {
        Alert.alert(
          'Authentication Error',
          'Please log in to continue',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    }
  };

  const executeAction = async (action) => {
    try {
      if (!user || !user.familyId) {
        throw new Error('User or family information not found');
      }

      console.log('Executing action:', action);

      switch (action.type) {
        case 'CHAT':
          // For chat messages, just return the message as is
          return action.message;

        case 'ADD_ITEM': {
          let expiryDate;
          if (action.expiryDate) {
            // 如果有指定日期，直接使用
            expiryDate = action.expiryDate;
            console.log('Using specified expiry date:', expiryDate);
          } else {
            // 如果没有指定日期，使用AI估算
            const daysToExpiry = await estimateExpiryDate(action.item);
            expiryDate = getRelativeDateString(daysToExpiry);
            console.log('Estimated expiry date:', expiryDate, 'based on days:', daysToExpiry);
          }

          const newItem = {
            name: action.item,
            quantity: action.quantity,
            familyId: user.familyId,
            expiryDate: expiryDate,
            category: 'Other',
            location: 'Default',
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          console.log('Adding new item:', newItem);
          const result = await addItem(newItem);
          console.log('Add item result:', result);
          
          if (!result) {
            throw new Error('Failed to add item');
          }
          break;
        }
        case 'DELETE_ITEM':
          // First find the item by name in the family's items
          const { items } = await getFamilyItems(user.familyId);
          const itemToDelete = items.find(item => 
            item.name.toLowerCase() === action.item.toLowerCase()
          );
          
          if (!itemToDelete) {
            throw new Error(`Item "${action.item}" not found in your fridge`);
          }
          
          const deleteResult = await deleteItem(itemToDelete.id);
          if (!deleteResult) {
            throw new Error('Failed to delete item');
          }
          break;

        case 'UPDATE_ITEM':
          // First find the item by name
          const { items: updateItems } = await getFamilyItems(user.familyId);
          const itemToUpdate = updateItems.find(item => 
            item.name.toLowerCase() === action.item.toLowerCase()
          );
          
          if (!itemToUpdate) {
            throw new Error(`Item "${action.item}" not found in your fridge`);
          }
          
          const updatedItem = {
            ...itemToUpdate,
            quantity: action.quantity,
            familyId: user.familyId,
            updatedAt: new Date().toISOString()
          };
          
          const updateResult = await updateItem(itemToUpdate.id, updatedItem);
          if (!updateResult) {
            throw new Error('Failed to update item');
          }
          break;

        case 'QUERY_ITEM':
          const queryResponse = await fetch(`${API_URL}/items/name/${encodeURIComponent(action.item)}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
          });

          if (!queryResponse.ok) {
            throw new Error('Failed to query item');
          }

          const itemData = await queryResponse.json();
          const queryConfirmation = `Current quantity of ${action.item} is ${itemData.quantity}`;
          await speak(queryConfirmation);
          setMessages(prev => [
            ...prev,
            { text: queryConfirmation, sender: 'assistant', timestamp: new Date().toISOString() },
          ]);
          break;

        default:
          console.log('No action needed');
      }
    } catch (error) {
      console.error('Action execution error:', error);
      throw error;
    }
  };

  const parseAIResponse = (response) => {
    console.log('Original AI Response:', response);

    // Helper function to validate and format date
    const validateAndFormatDate = (dateInput) => {
      try {
        if (!dateInput) return null;

        let date;

        if (typeof dateInput === 'string') {
          // Parse date string to local time
          const [year, month, day] = dateInput.split('-').map(Number);
          date = new Date(year, month - 1, day); // Use local timezone
        } else if (dateInput instanceof Date) {
          date = new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
        } else {
          return null;
        }

        // Ensure it's a valid date
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', dateInput);
          return null;
        }

        // Return formatted YYYY-MM-DD (avoid timezone offset)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        console.log('Formatted date:', formattedDate);
        return formattedDate;
      } catch (e) {
        console.warn('Date formatting error:', e);
        return null;
      }
    };

    // Helper function to parse natural language date
    const parseNaturalLanguageDate = (dateText) => {
      if (!dateText) return null;
      console.log('Original date text:', dateText);

      // Step 1: Convert Chinese numbers to Arabic numbers
      // "May 15th" → "5月15号"
      const normalized = dateText.replace(
        /[一二三四五六七八九十]{1,3}/g,
        (m) => chineseToNumber(m)
      );

      try {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const nextYear = now.getFullYear() + 1;  // Next year

        // Check if date should use next year
        const shouldUseNextYear = (month, day) => {
          const thisYear = now.getFullYear();
          const dateThisYear = new Date(thisYear, month - 1, day);
          dateThisYear.setHours(0, 0, 0, 0);
          return dateThisYear < now;
        };

        // Step 2: Check for explicit year
        const hasExplicitYear = normalized.includes('next year') || /\d{4}年/.test(normalized);
        
        // Step 3: Chinese "Month Day" format
        const chineseMatch = normalized.match(/(\d{1,2})月\s*(\d{1,2})[号日]?/);
        if (chineseMatch) {
          const month = parseInt(chineseMatch[1], 10);
          const day = parseInt(chineseMatch[2], 10);
          // If no explicit year and date has passed this year, use next year
          const year = hasExplicitYear ? now.getFullYear() : 
                      shouldUseNextYear(month, day) ? nextYear : now.getFullYear();
          console.log('Parsed Chinese date:', { year, month, day, shouldUseNextYear: shouldUseNextYear(month, day) });
          return getLocalDateString(new Date(year, month - 1, day));
        }

        // Step 4: English "Month Day" format
        const engMatch = normalized.match(
          /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i
        );
        if (engMatch) {
          const monthNames = {
            jan: 0, january: 0, feb: 1, february: 1,
            mar: 2, march: 2, apr: 3, april: 3,
            may: 4, jun: 5, june: 5, jul: 6, july: 6,
            aug: 7, august: 7, sep: 8, sept: 8, september: 8,
            oct: 9, october: 9, nov: 10, november: 10,
            dec: 11, december: 11
          };
          const month = monthNames[engMatch[1].toLowerCase()] + 1;
          const day = parseInt(engMatch[2], 10);
          // If no explicit year and date has passed this year, use next year
          const year = hasExplicitYear ? now.getFullYear() : 
                      shouldUseNextYear(month, day) ? nextYear : now.getFullYear();
          console.log('Parsed English date:', { year, month, day, shouldUseNextYear: shouldUseNextYear(month, day) });
          return getLocalDateString(new Date(year, month - 1, day));
        }

        // Step 5: Relative dates (X days later, next week, etc.)
        const relativeDayMatch = normalized.match(/(\d+)(?:天|日)后/);
        if (relativeDayMatch) {
          const days = parseInt(relativeDayMatch[1], 10);
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() + days);
          console.log('Parsed relative date:', { days, targetDate });
          return getLocalDateString(targetDate);
        }

        if (normalized.includes('next week')) {
          const targetDate = new Date(now);
          targetDate.setDate(now.getDate() + 7);
          console.log('Parsed next week:', { targetDate });
          return getLocalDateString(targetDate);
        }

        // Step 6: Other natural language, use chrono-node
        const chronoParsed = chrono.parseDate(normalized, now, { forwardDate: true });
        if (chronoParsed) {
          chronoParsed.setHours(0, 0, 0, 0);
          // If no explicit year and date has passed this year, use next year
          if (!hasExplicitYear && chronoParsed < now) {
            chronoParsed.setFullYear(nextYear);
          }
          console.log('Parsed with chrono:', { date: chronoParsed, shouldUseNextYear: chronoParsed < now });
          return getLocalDateString(chronoParsed);
        }

        console.warn('No matching date pattern found:', normalized);
        return null;
      } catch (e) {
        console.warn('Date parsing error:', e);
        return null;
      }
    };

    // Step 1: Try strict ADD pattern with EXPIRES
    const addItemMatch = response.match(/ADD (\d+) (.+?)(?:\s+EXPIRES\s+(\d{4}-\d{2}-\d{2}))?\s*$/i);
    if (addItemMatch) {
      console.log('Matched strict ADD pattern:', addItemMatch);
      const [_, quantity, item, expiryDate] = addItemMatch;
      // Use matched date directly, no conversion needed
      return {
        type: 'ADD_ITEM',
        quantity: parseInt(quantity),
        item: item.trim(),
        expiryDate: expiryDate || null,
      };
    }

    // Step 2: Try relaxed ADD pattern with natural language expiry date
    const softAddMatch = response.match(/add\s+(\d+)\s+(.+?)(?:,?\s*(?:expires?|expiring|to expire)?\s*(?:in|on|by)?\s*(.+))?$/i);
    if (softAddMatch) {
      console.log('Matched relaxed ADD pattern:', softAddMatch);
      const [_, quantity, item, expiryText] = softAddMatch;
      let parsedExpiry = null;
      
      if (expiryText) {
        // Check if it contains a complete date format (YYYY-MM-DD)
        const dateMatch = expiryText.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          parsedExpiry = dateMatch[1];
          console.log('Found formatted date in expiry text:', parsedExpiry);
        } else {
          // If not complete format, use natural language parsing
          parsedExpiry = parseNaturalLanguageDate(expiryText);
          console.log('Parsed natural language date:', parsedExpiry);
        }
      }

      return {
        type: 'ADD_ITEM',
        quantity: parseInt(quantity),
        item: item.trim(),
        expiryDate: parsedExpiry,
      };
    }

    // DELETE X
    const deleteMatch = response.match(/DELETE\s+(.+)/i);
    if (deleteMatch) {
      console.log('Matched DELETE pattern:', deleteMatch);
      return { type: 'DELETE_ITEM', item: deleteMatch[1].trim() };
    }

    // UPDATE X TO Y
    const updateMatch = response.match(/UPDATE\s+(.+?)\s+TO\s+(\d+)/i);
    if (updateMatch) {
      console.log('Matched UPDATE pattern:', updateMatch);
      return {
        type: 'UPDATE_ITEM',
        item: updateMatch[1].trim(),
        quantity: parseInt(updateMatch[2]),
      };
    }

    // QUERY X
    const queryMatch = response.match(/QUERY\s+(.+)/i);
    if (queryMatch) {
      console.log('Matched QUERY pattern:', queryMatch);
      return { type: 'QUERY_ITEM', item: queryMatch[1].trim() };
    }

    console.log('No pattern matched, returning original response.');
    return { type: 'CHAT', message: response };
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await sendMessageToAI(inputText);
      await handleAIResponse(aiResponse);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        text: ERROR_MESSAGES.SERVER_ERROR,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speak(ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.chatContainer,
          {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
            opacity: slideAnim,
          },
        ]}
      >
        <View style={styles.chatHeader}>
          <Text style={styles.headerText}>✨ FridgeGenie</Text>
          <TouchableOpacity onPress={toggleChat}>
            <Ionicons name="close" size={24} color="#FFC107" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.sender === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <Text style={[
                styles.messageText,
                message.sender === 'assistant' && styles.assistantMessageText,
              ]}>
                {message.text}
              </Text>
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFC107" />
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Let's talk about food! ⭐️"
              multiline
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={[styles.voiceButton, isRecording && styles.voiceButtonActive]} 
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons 
                name={isRecording ? "mic" : "mic-outline"} 
                size={24} 
                color={isRecording ? "#fff" : "#FFC107"} 
              />
              {isRecording && (
                <Text style={styles.recordingDuration}>
                  {recordingDuration.toFixed(1)}s
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
              onPress={sendMessage}
              disabled={isLoading}
            >
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={toggleChat}
      >
        <Image 
          source={require('../../assets/images/ai.png')}
          style={styles.floatingButtonImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 9999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 10000,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  floatingButtonImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  chatContainer: {
    position: 'absolute',
    bottom: 80,
    right: 0,
    width: 300,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
    borderWidth: 1,
    borderColor: '#FFC107',
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FFC107',
    backgroundColor: '#FFF8E1',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFC107',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#FFFFFF',
    paddingBottom: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFC107',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  messageText: {
    color: '#fff',
    fontSize: 15,
  },
  assistantMessageText: {
    color: '#333',
    fontSize: 15,
  },
  inputContainer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFC107',
    backgroundColor: '#FFF8E1',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: -5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFC107',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  voiceButtonActive: {
    backgroundColor: '#FFC107',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  recordingDuration: {
    position: 'absolute',
    bottom: -20,
    fontSize: 12,
    color: '#FFC107',
  },
});

export default AIAssistant; 