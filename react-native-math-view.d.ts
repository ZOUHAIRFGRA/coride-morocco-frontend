declare module 'react-native-math-view' {
    import * as React from 'react';
    import { ViewProps, StyleProp, ViewStyle } from 'react-native';
  
    export interface MathViewProps extends ViewProps {
      math: string;
      style?: StyleProp<ViewStyle>;
      resizeMode?: 'cover' | 'contain' | 'stretch';
      color?: string;
      // Add more props as needed from the library's docs
    }
  
    const MathView: React.FC<MathViewProps>;
    export default MathView;
  }