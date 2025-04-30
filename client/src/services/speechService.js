import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { AZURE_SPEECH } from '../config';
import { Buffer } from 'buffer';

export const recognizeSpeech = async (audioUri) => {
  try {
    console.log('Starting speech recognition for audio file:', audioUri);

    // Read the audio file as base64
    const audioData = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (!audioData) {
      throw new Error('Failed to read audio file');
    }

    console.log('Audio file read successfully, length:', audioData.length);

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    // Call Azure Speech Services API
    const response = await fetch(
      `https://${AZURE_SPEECH.REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${AZURE_SPEECH.LANGUAGE}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': AZURE_SPEECH.SUBSCRIPTION_KEY,
          'Content-Type': 'audio/m4a',
          'Accept': 'application/json',
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Speech recognition API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Speech recognition failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Speech recognition result:', result);
    
    if (result.RecognitionStatus === 'Success') {
      return result.DisplayText;
    } else {
      throw new Error(`Speech recognition failed: ${result.RecognitionStatus}`);
    }
  } catch (error) {
    console.error('Speech recognition error:', error);
    throw error;
  }
};

// Get audio format configuration
export const getAudioFormat = () => {
  return {
    android: {
      extension: '.m4a',
      outputFormat: 2,  // MPEG_4
      audioEncoder: 3,  // AAC
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 64000,
    },
    ios: {
      extension: '.m4a',
      outputFormat: 'aac',
      audioQuality: 0.5,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 64000,
      linearPCM: false,
    },
  };
}; 