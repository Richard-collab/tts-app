import { createTheme } from '@mui/material/styles';

// Helper to create consistent gradient button styles
const createGradientBtn = (startColor, endColor, shadowColor) => ({
  background: `linear-gradient(45deg, ${startColor} 30%, ${endColor} 90%)`,
  color: 'white',
  boxShadow: `0 3px 5px 2px ${shadowColor}1a`, // ~10% opacity
  '&:hover': {
    background: `linear-gradient(45deg, ${startColor} 30%, ${endColor} 90%)`,
    boxShadow: `0 10px 20px ${shadowColor}4d`, // ~30% opacity
    transform: 'translateY(-2px)',
  },
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#6C5CE7',
      light: '#A29BFE',
      dark: '#5649C0',
    },
    secondary: {
      main: '#00CEC9',
    },
    success: {
      main: '#00b894',
    },
    error: {
      main: '#FF4757',
    },
    warning: {
      main: '#FFA502',
    },
    info: {
      main: '#1E90FF',
    },
    background: {
      default: '#F9F8FF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3436',
      secondary: '#636E72',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded for a modern look
          textTransform: 'none', // Remove default uppercase
          fontWeight: 600,
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        },
        contained: {
          color: 'white',
          // Generic background removed to allow specific variant gradients
        },
        containedPrimary: createGradientBtn('#6C5CE7', '#A29BFE', '#6C5CE7'),
        containedSecondary: createGradientBtn('#00CEC9', '#81ECEC', '#00CEC9'),
        containedSuccess: createGradientBtn('#00b894', '#55efc4', '#00b894'),
        containedError: createGradientBtn('#FF4757', '#ff7675', '#FF4757'),
        containedWarning: createGradientBtn('#FFA502', '#ffeaa7', '#FFA502'),
        containedInfo: createGradientBtn('#1E90FF', '#74b9ff', '#1E90FF'),

        outlined: {
          '&:hover': {
             transform: 'translateY(-2px)',
             boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
             backgroundColor: 'rgba(108, 92, 231, 0.04)', // Slight tint instead of darken
          }
        },
        text: {
           '&:hover': {
             transform: 'translateY(-2px)',
             backgroundColor: 'rgba(108, 92, 231, 0.04)',
           }
        }
      },
    },
  },
});

export default theme;
