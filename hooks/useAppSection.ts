import { useEffect, useState } from "react";
import { usePathname, useRouter } from "expo-router";
import { saveLastAppSection, getLastAppSection } from "@utils/secureStorage";

// Define app section types for better organization
export type AppSection = "main";

// Define app section paths for routing
export const AppSectionPaths = {
  main: "/(main)/",
};

/**
 * Hook to track and remember the last visited app section
 * Note: Redirection is handled by AuthStateCheck in _layout.tsx
 *
 * @returns Object containing the last saved app section path and utility methods
 */
export function useAppSection() {
  const [lastAppSection, setLastAppSection] = useState<AppSection | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Determine which main section a path belongs to
  const getMainSection = (path: string): AppSection | null => {
    if (path.includes("/(main)")) return "main";
    return "main"; // Default to main section for corriding app
  };

  // Navigate to the default path for a section
  const getDefaultPathForSection = (section: AppSection): string => {
    return AppSectionPaths[section] || AppSectionPaths.main;
  };

  // Load last app section on mount
  useEffect(() => {
    const loadLastSection = async () => {
      try {
        // Get the last app section from secure storage
        const lastSection = await getLastAppSection();

        // Parse the stored section string into our AppSection type
        let appSection: AppSection | null = null;

        // For the corriding app, we only have the main section
        appSection = "main";

        // Update state with the last section
        setLastAppSection(appSection);
        setIsInitialLoad(false);
      } catch (error) {
        console.error("Error loading last section:", error);
        setIsInitialLoad(false);
      }
    };

    loadLastSection();
  }, []);

  // Save section when path changes
  useEffect(() => {
    if (!pathname || isInitialLoad) return;

    const mainSection = getMainSection(pathname);

    if (mainSection) {
      saveLastAppSection(mainSection);
      setLastAppSection(mainSection);
    }
  }, [pathname, isInitialLoad]);

  return {
    lastAppSection,
    currentSection: pathname ? getMainSection(pathname) : null,
    isInitialLoad,
    getDefaultPathForSection,
    navigateToSection: (section: AppSection) => {
      const path = getDefaultPathForSection(section);
      router.push(path as any);
    },
  };
}
