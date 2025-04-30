import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { AZURE_SPEECH } from '../config';

export const recognizeSpeech = async (audioUri) => {
  try {
    // 读取音频文件
    const audioData = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 调用 Azure Speech Services API
    const response = await fetch(
      `https://${AZURE_SPEECH.REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH.SUBSCRIPTION_KEY,
          'Content-Type': 'audio/wav;codecs=audio/pcm;rate=16000',
          'Accept': 'application/json',
        },
        body: audioData,
      }
    );

    const result = await response.json();
    
    if (result.RecognitionStatus === 'Success') {
      return result.DisplayText;
    } else {
      throw new Error(`语音识别失败: ${result.RecognitionStatus}`);
    }
  } catch (error) {
    console.error('语音识别错误:', error);
    throw error;
  }
};

// 获取音频格式
export const getAudioFormat = () => {
  if (Platform.OS === 'ios') {
    return {
      extension: '.wav',
      sampleRate: 16000,
      numberOfChannels: 1,
      bitDepth: 16,
    };
  } else {
    return {
      extension: '.wav',
      sampleRate: 16000,
      numberOfChannels: 1,
      bitDepth: 16,
    };
  }
}; 