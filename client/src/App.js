import React from 'react';
import { 
  Typography, 
  AppBar, 
  Box, 
  Container, 
  CssBaseline, 
  useMediaQuery,
  ThemeProvider, 
  createTheme 
} from '@mui/material';
import VideoPlayer from './components/VideoPlayer';
import Options from './components/Options';
import Notifications from './components/Notifications';

// Create a custom theme resembling Google Meet
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8', // Google blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ea4335', // Google red for hang up
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f3f4', // Light gray background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          padding: '6px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const App = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        overflow: 'hidden'
      }}>
        <AppBar 
          position="static" 
          color="inherit" 
          elevation={0}
          sx={{ 
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)', 
            py: { xs: 0.5, sm: 1 },
            backgroundColor: 'background.paper'
          }}
        >
          <Container maxWidth="lg">
            <Box display="flex" alignItems="center" sx={{ pl: { xs: 1, sm: 2 } }}>
              <Box 
                component="img" 
                src="/api/placeholder/24/24" 
                alt="Video Chat Logo" 
                sx={{ mr: 1 }}
              />
              <Typography 
                variant="h1" 
                color="primary"
                sx={{ 
                  fontSize: { xs: '1.2rem', sm: '1.5rem' },
                  letterSpacing: '-0.5px'
                }}
              >
                Video Meet
              </Typography>
            </Box>
          </Container>
        </AppBar>

        <Container 
          maxWidth="md" 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            py: { xs: 1, sm: 2, md: 3 },
            px: { xs: 1, sm: 2 }
          }}
        >
          <VideoPlayer />
          <Box sx={{ mt: 'auto' }}>
            <Options>
              <Notifications />
            </Options>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;