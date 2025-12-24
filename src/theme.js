import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#000000', // Black for Primary Actions
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#666666', // Gray for Secondary Actions
      light: '#999999',
      dark: '#333333',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa', // Light Gray background
      paper: '#ffffff',   // White paper
    },
    text: {
      primary: '#1a1a1a', // Nearly black
      secondary: '#666666', // Gray
    },
    success: {
      main: '#10b981', // Muted Green
    },
    error: {
      main: '#ef4444', // Muted Red
    },
    warning: {
      main: '#f59e0b', // Muted Orange
    },
    info: {
      main: '#3b82f6', // Muted Blue
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          color: '#ffffff',
          backgroundColor: '#000000',
          '&:hover': {
            backgroundColor: '#333333',
            boxShadow: 'none',
          },
        },
        outlined: {
          borderColor: '#e5e7eb', // Light gray border
          color: '#1a1a1a',
          backgroundColor: '#ffffff',
          '&:hover': {
            backgroundColor: '#f9fafb',
            borderColor: '#d1d5db',
          },
        },
        text: {
          color: '#666666',
          '&:hover': {
            backgroundColor: '#f3f4f6',
            color: '#000000',
          },
        },
        // Variant for 'ghost' or tertiary could map to 'text'
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          border: '1px solid #e5e7eb', // Subtle border
        },
        elevation1: {
          boxShadow: 'none',
        },
        elevation2: {
          boxShadow: 'none',
        },
        elevation3: {
          boxShadow: 'none', // Remove elevation shadows completely for flat look
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Soft shadow for FABs
          backgroundColor: '#ffffff',
          color: '#000000',
          border: '1px solid #e5e7eb',
          '&:hover': {
            backgroundColor: '#f9fafb',
          },
        },
        primary: {
           backgroundColor: '#000000',
           color: '#ffffff',
           '&:hover': {
             backgroundColor: '#333333',
           },
        }
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
           borderRadius: 16,
           boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        }
      }
    }
  },
});

export default theme;
