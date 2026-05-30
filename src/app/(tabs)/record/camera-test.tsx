import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * SIMPLIFIED TEST - Debug expo-camera recordAsync
 * This strips away all complexity to isolate the recording issue
 */
export default function CameraTest() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef(null);

  if (!permission?.granted) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity
          style={{ backgroundColor: '#0a7ea4', padding: 16, borderRadius: 8 }}
          onPress={() => requestPermission()}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Allow Camera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const startRecord = async () => {
    try {
      console.log('=== START RECORD ===');
      console.log('Camera ref:', cameraRef.current);
      console.log('Camera methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(cameraRef.current || {})));
      
      if (!cameraRef.current) {
        Alert.alert('Error', 'Camera ref is null');
        return;
      }

      const cam = cameraRef.current as any;
      console.log('recordAsync exists?', typeof cam.recordAsync);

      if (typeof cam.recordAsync !== 'function') {
        Alert.alert('Error', 'recordAsync is not a function');
        return;
      }

      setIsRecording(true);
      console.log('Calling recordAsync...');
      
      const video = await cam.recordAsync({ maxDuration: 10 });
      console.log('Recording complete:', video);
      
      Alert.alert('Success', `Video recorded: ${video?.uri}`);
      setIsRecording(false);
    } catch (error: any) {
      console.error('=== RECORD ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error?.message);
      console.error('Error code:', error?.code);
      console.error('Full error:', JSON.stringify(error, null, 2));
      
      Alert.alert('Error', `${error?.message || error || 'Unknown error'}`);
      setIsRecording(false);
    }
  };

  const stopRecord = async () => {
    try {
      console.log('=== STOP RECORD ===');
      const cam = cameraRef.current as any;
      
      if (typeof cam.stopRecording !== 'function') {
        Alert.alert('Error', 'stopRecording is not a function');
        return;
      }

      console.log('Calling stopRecording...');
      await cam.stopRecording();
      console.log('Stop record success');
      setIsRecording(false);
    } catch (error: any) {
      console.error('Stop error:', error);
      Alert.alert('Stop Error', error?.message || 'Unknown error');
      setIsRecording(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CameraView ref={cameraRef} style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40 }}>
          <TouchableOpacity
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isRecording ? '#ff4444' : '#0a7ea4',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => (isRecording ? stopRecord() : startRecord())}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {isRecording ? 'STOP' : 'REC'}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: '#fff', marginTop: 16 }}>
            {isRecording ? 'Recording...' : 'Ready'}
          </Text>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}
