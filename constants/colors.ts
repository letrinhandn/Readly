const Colors = {
  light: {
    primary: '#6B5B4D',
    secondary: '#9B8578',
    accent: '#D4A574',
    background: '#FBF8F4',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F0EA',
    text: '#2C2420',
    textSecondary: '#7A6E65',
    textTertiary: '#B5A99E',
    border: '#E8E0D8',
    success: '#7BA87F',
    error: '#C97979',
    warning: '#D4A574',
    focus: '#8B7968',
    shadowLight: 'rgba(107, 91, 77, 0.08)',
    shadowMedium: 'rgba(107, 91, 77, 0.12)',
    overlay: 'rgba(44, 36, 32, 0.6)',
  },
  dark: {
    primary: '#D4A574',
    secondary: '#B5956E',
    accent: '#E8C18E',
    background: '#1A1613',
    surface: '#251F1C',
    surfaceSecondary: '#2F2925',
    text: '#F5F0EA',
    textSecondary: '#B5A99E',
    textTertiary: '#7A6E65',
    border: '#3D342F',
    success: '#8BBC8E',
    error: '#E89999',
    warning: '#E8C18E',
    focus: '#C4A989',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    shadowMedium: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

export type ColorScheme = 'light' | 'dark';

export default Colors;
