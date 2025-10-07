import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: "Home" 
        }} 
      />
      <Stack.Screen 
        name="offer" 
        options={{ 
          headerShown: false,
          title: "Offer Ride" 
        }} 
      />
      <Stack.Screen 
        name="rides" 
        options={{ 
          headerShown: false,
          title: "My Rides" 
        }} 
      />
      <Stack.Screen 
        name="messages" 
        options={{ 
          headerShown: false,
          title: "Messages" 
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: false,
          title: "Settings" 
        }} 
      />
    </Stack>
  );
}