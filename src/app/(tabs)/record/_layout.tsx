import { Stack } from 'expo-router';

export default function RecordLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="camera" />
      <Stack.Screen name="processing" />
      <Stack.Screen name="results" />
    </Stack>
  );
}
