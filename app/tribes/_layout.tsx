import { Stack } from "expo-router";

export default function TribesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
          title: "Tribes" 
        }} 
      />
      <Stack.Screen 
        name="create" 
        options={{ 
          headerShown: false,
          title: "Create Tribe" 
        }} 
      />
      <Stack.Screen 
        name="[id]/index" 
        options={{ 
          headerShown: false,
          title: "Tribe Details" 
        }} 
      />
      <Stack.Screen 
        name="[id]/chat" 
        options={{ 
          headerShown: false,
          title: "Tribe Chat" 
        }} 
      />
      <Stack.Screen 
        name="[id]/members" 
        options={{ 
          headerShown: false,
          title: "Tribe Members" 
        }} 
      />
      <Stack.Screen 
        name="[id]/settings" 
        options={{ 
          headerShown: false,
          title: "Tribe Settings" 
        }} 
      />
    </Stack>
  );
}
