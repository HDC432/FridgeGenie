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
import { sendMessageToAI } from '../services/openai';
import { recognizeSpeech, getAudioFormat } from '../services/speechService';
import { API_URL, ERROR_MESSAGES } from '../config';

const AIAssistant = () => {
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
      setRecordingDuration(status.durationMillis / 1000);
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
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限错误', ERROR_MESSAGES.PERMISSION_DENIED);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const audioFormat = getAudioFormat();
      const recordingOptions = {
        ...audioFormat,
        android: {
          ...audioFormat,
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM_16BIT,
        },
        ios: {
          ...audioFormat,
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
        },
      };

      const { recording } = await Audio.Recording.createAsync(
        recordingOptions,
        onRecordingStatusUpdate,
        100
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      // 开始计时
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);
    } catch (error) {
      console.error('录音错误:', error);
      Alert.alert('录音失败', ERROR_MESSAGES.SPEECH_RECOGNITION_ERROR);
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
        throw new Error('录音文件未生成');
      }

      // 使用 Azure Speech Services 进行语音识别
      const text = await recognizeSpeech(uri);
      if (text) {
        setInputText(text);
      } else {
        throw new Error('语音识别结果为空');
      }
    } catch (error) {
      console.error('停止录音错误:', error);
      Alert.alert('语音识别失败', error.message || ERROR_MESSAGES.SPEECH_RECOGNITION_ERROR);
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
      // 解析 AI 的回复，提取操作信息
      const action = parseAIResponse(response);
      
      if (action) {
        // 执行相应的操作
        await executeAction(action);
      }

      // 添加 AI 的回复到消息列表
      const assistantMessage = {
        text: response,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // 使用语音读出 AI 的回复
      speak(response);
    } catch (error) {
      console.error('处理 AI 回复错误:', error);
      const errorMessage = {
        text: ERROR_MESSAGES.SERVER_ERROR,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speak(ERROR_MESSAGES.SERVER_ERROR);
    }
  };

  const parseAIResponse = (response) => {
    // 解析 AI 的回复，提取操作信息
    // 例如：添加物品、删除物品、查询物品等
    const addItemMatch = response.match(/添加(\d+)个(.+)/);
    if (addItemMatch) {
      return {
        type: 'ADD_ITEM',
        quantity: parseInt(addItemMatch[1]),
        item: addItemMatch[2],
      };
    }
    return null;
  };

  const executeAction = async (action) => {
    switch (action.type) {
      case 'ADD_ITEM':
        try {
          const response = await fetch(`${API_URL}/api/items`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: action.item,
              quantity: action.quantity,
            }),
          });

          if (!response.ok) {
            throw new Error('添加物品失败');
          }

          // 更新本地状态或刷新数据
          // 这里可以添加更新本地状态的逻辑
        } catch (error) {
          console.error('执行操作错误:', error);
          throw error;
        }
        break;
      // 可以添加其他操作类型的处理
      default:
        console.log('未知操作类型:', action.type);
    }
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

      <TouchableOpacity style={styles.floatingButton} onPress={toggleChat}>
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