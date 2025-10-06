import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/theme';

export const useAppTheme = () => {
  const { isDarkMode, themeMode, setThemeMode, toggleTheme } = useTheme();
  const colors = getColors(isDarkMode);

  return {
    isDarkMode,
    themeMode,
    setThemeMode,
    toggleTheme,
    colors,
  };
};

export default useAppTheme;