import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Buffer } from 'buffer';
import { sendMessageToAI } from '../services/openai';
import { recognizeSpeech, getAudioFormat } from '../services/speechService';
import { API_URL, ERROR_MESSAGES } from '../config';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import { addItem, getFamilyItems, deleteItem, updateItem } from '../../services/databaseService';
import { useNavigation } from '@react-navigation/native';

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
        language: 'zh-CN',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (err) {
      console.error('语音合成错误:', err);
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
        // Execute the corresponding action
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

      // Add AI's response to message list
      const assistantMessage = {
        text: operationResult || response,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Read out AI's response
      speak(operationResult || response);

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

      switch (action.type) {
        case 'ADD_ITEM':
          const newItem = {
            name: action.item,
            quantity: action.quantity,
            familyId: user.familyId,
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 7 days
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
            throw new Error('查询物品失败');
          }

          const itemData = await queryResponse.json();
          const queryConfirmation = `${action.item} 当前数量为 ${itemData.quantity}`;
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
    // Match "ADD X Y" pattern
    const addItemMatch = response.match(/ADD (\d+) (.+)/i);
    if (addItemMatch) {
      return {
        type: 'ADD_ITEM',
        quantity: parseInt(addItemMatch[1]),
        item: addItemMatch[2].trim(),
      };
    }

    // Match "DELETE X" pattern
    const deleteItemMatch = response.match(/DELETE (.+)/i);
    if (deleteItemMatch) {
      return {
        type: 'DELETE_ITEM',
        item: deleteItemMatch[1].trim(),
      };
    }

    // Match "UPDATE X TO Y" pattern
    const updateItemMatch = response.match(/UPDATE (.+) TO (\d+)/i);
    if (updateItemMatch) {
      return {
        type: 'UPDATE_ITEM',
        item: updateItemMatch[1].trim(),
        quantity: parseInt(updateItemMatch[2]),
      };
    }

    // Match "QUERY X" pattern
    const queryItemMatch = response.match(/QUERY (.+)/i);
    if (queryItemMatch) {
      return {
        type: 'QUERY_ITEM',
        item: queryItemMatch[1].trim(),
      };
    }

    return null;
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
      console.error('发送消息错误:', error);
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
          <Text style={styles.headerText}>AI Assistant</Text>
          <TouchableOpacity onPress={toggleChat}>
            <Ionicons name="close" size={24} color="#333" />
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
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          )}
        </ScrollView>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
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
              color={isRecording ? "#fff" : "#007AFF"} 
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
        </KeyboardAvoidingView>
      </Animated.View>

      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={toggleChat}
      >
        <Ionicons name="chatbubble" size={24} color="#fff" />
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
    backgroundColor: '#007AFF',
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
  },
  chatContainer: {
    position: 'absolute',
    bottom: 80,
    right: 0,
    width: 300,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  messageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  voiceButtonActive: {
    backgroundColor: '#007AFF',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
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
    color: '#007AFF',
  },
});

export default AIAssistant; 