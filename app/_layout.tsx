import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { useColorScheme, Platform, StatusBar, View, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import StatusBarManagerComponent from "@/components/ui/StatusBarManager";
import { SpeechProvider } from "@/contexts/SpeechContext";
import { UIProvider } from "@/contexts/UIContext";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { useAuth } from "@hooks/useAuth";
import { useUser } from "@hooks/useUser";
import { useAppSection, AppSectionPaths } from "@hooks/useAppSection";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useFonts, Montserrat_400Regular, Montserrat_500Medium, Montserrat_600SemiBold, Montserrat_700Bold } from "@expo-google-fonts/montserrat";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "@/global.css";
import "@/utils/ReactotronConfig";



// Default route if no last section is found
const DEFAULT_ROUTE = AppSectionPaths.main;

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// Handle auth state and routing
function AuthStateCheck() {
  const { isAuthenticated, isLoading, pendingNavigation } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { lastAppSection, getDefaultPathForSection } = useAppSection();

  // Use the user hook to access and potentially fetch user profile data
  const { profile, refetchProfile } = useUser();

  // Ensure we have user profile data when authenticated
  useEffect(() => {
    if (isAuthenticated && !profile && !isLoading) {
      refetchProfile().catch((err) => {
        console.error("Error fetching user profile in layout:", err);
      });
    }
  }, [isAuthenticated, profile, isLoading, refetchProfile]);

  useEffect(() => {
    // Wait until all checks are complete
    if (isLoading || pendingNavigation) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inPublicGroup = segments[0] === "(public)";

    if (isAuthenticated) {
      if (inAuthGroup || inPublicGroup) {
        // Safely handle navigation to last section
        const safeNavigate = () => {
          try {
            // If user has a previously visited section that's valid, use it
            if (lastAppSection) {
              const targetPath = getDefaultPathForSection(lastAppSection);
              router.replace(targetPath as any);
            } else {
              // Default to main screen for corriding app
              router.replace(DEFAULT_ROUTE as any);
            }
          } catch (error) {
            console.error("Navigation error:", error);
            // Fallback to default route
            router.replace(DEFAULT_ROUTE as any);
          }
        };

        safeNavigate();
      }
    } else if (!isAuthenticated && !inAuthGroup && !inPublicGroup) {
      // Redirect to onboarding if not authenticated and trying to access protected routes
      router.replace("/(public)/onboarding");
    }
  }, [isAuthenticated, isLoading, segments, pendingNavigation, lastAppSection]);

  return null;
}

function RootLayoutNav() {
  // Original hooks in their exact order
  const colorScheme = useColorScheme();
  useAppSection();

  // Always ensure hooks are called in every render
  const { isAuthenticated, isLoading } = useAuth();
  // Access user data to ensure it's loaded
  const { profile } = useUser();

  const [fontsLoaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });
  const [isReady, setIsReady] = useState(false);

  // First useEffect - font loading
  useEffect(() => {
    if ((fontsLoaded || fontError) && !isLoading) {
      // Hide the splash screen once everything is loaded
      SplashScreen.hideAsync().catch(() => {
        /* ignore error */
      });
      setIsReady(true);
    }
  }, [fontsLoaded, fontError, isLoading]);

  // Second useEffect - status bar (original)
  useEffect(() => {
    if (Platform.OS === "ios") {
      StatusBar.setBarStyle("dark-content");
    } else if (Platform.OS === "android") {
      StatusBar.setTranslucent(true);
      // Don't set backgroundColor on Android to avoid edge-to-edge warning
      // StatusBar.setBackgroundColor("transparent");
    }
  }, []);

  // Render loading state instead of conditional return
  if (!isReady) {
    return <View style={styles.container} />;
  }

  // Main render
  return (
    <View style={styles.container}>
      <StatusBarManagerComponent 
        style={Platform.OS === "ios" ? "dark" : "light"} 
        backgroundColor={Platform.OS === "ios" ? "transparent" : undefined} 
        translucent={true} 
      />
      <AuthStateCheck />
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
          },
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          // Android-specific settings for proper rendering
          animation: Platform.OS === "android" ? "fade" : "default",
          contentStyle: {
            backgroundColor: "#F8F9FA",
          },
        }}
      />
    </View>
  );
}

// Component to initialize user profile separately from Redux data loading
function AppInitializer({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { profile, refetchProfile, isLoading } = useUser();

  // Attempt to load user profile if authenticated but profile is empty
  useEffect(() => {
    const initializeProfile = async () => {
      if (isAuthenticated && !profile && !isLoading) {
        try {
          await refetchProfile();
        } catch (error) {
          console.error("Failed to load user profile on app initialization:", error);
        }
      }
    };

    initializeProfile();
  }, [isAuthenticated, profile, isLoading, refetchProfile]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GluestackUIProvider>
        <Provider store={store}>
          <SafeAreaProvider>
            <SpeechProvider>
              <UIProvider>
                <AppInitializer>
                  <RootLayoutNav />
                </AppInitializer>
              </UIProvider>
            </SpeechProvider>
          </SafeAreaProvider>
        </Provider>
      </GluestackUIProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
