import { createTheme } from '@mui/material/styles';

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
          background: 'linear-gradient(45deg, #6C5CE7 30%, #A29BFE 90%)',
          color: 'white',
          boxShadow: '0 3px 5px 2px rgba(108, 92, 231, .1)',
          '&:hover': {
            background: 'linear-gradient(45deg, #6C5CE7 30%, #A29BFE 90%)', // Keep the same gradient
            boxShadow: '0 10px 20px rgba(108, 92, 231, 0.3)', // Lifted shadow
            transform: 'translateY(-2px)', // Lift up effect
          },
        },
        // Also style outlined/text buttons to have the lift effect without the gradient if desired,
        // but the user specifically asked for "Gradient". I will apply the gradient primarily to "contained" buttons
        // as that's the standard for primary actions.
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
