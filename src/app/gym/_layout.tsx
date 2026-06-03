import { Stack } from 'expo-router';

export default function GymLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="video-preview" 
        options={{
          title: 'Review Video',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="exercise-select" 
        options={{
          title: 'Select Exercise',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="results" 
        options={{
          title: 'Results',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
