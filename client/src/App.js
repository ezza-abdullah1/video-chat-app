import React, { useContext, useState } from "react";
import {
  Typography,
  AppBar,
  Box,
  Container,
  CssBaseline,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import VideoPlayer from "./components/VideoPlayer";
import Options from "./components/Options";
import { SocketContext } from "./SocketContext";

const theme = createTheme({
  palette: {
    primary: { main: "#1a73e8", contrastText: "#ffffff" },
    secondary: { main: "#ea4335", contrastText: "#ffffff" },
    background: { default: "#f1f3f4", paper: "#ffffff" },
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    h1: { fontWeight: 500, fontSize: "1.5rem" },
    h6: { fontWeight: 500, fontSize: "1rem" },
    button: { textTransform: "none", fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 18, padding: "6px 16px" } },
    },
    MuiPaper: {
      styleOverrides: { root: { boxShadow: "0 1px 2px rgba(0,0,0,0.1)" } },
    },
  },
});

// Utility function to generate a random room ID (8-character alphanumeric)
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const App = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // Local state for join form inputs
  const [inputName, setInputName] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { name, setName, roomId, setRoomId } = useContext(SocketContext);

  // If global name and roomId are not set, show join meeting form.
  if (!name || !roomId) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Join Meeting
          </Typography>
          <Box
            component="form"
            sx={{
              mt: 3,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <TextField
              label="Your Name"
              fullWidth
              required
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
            />
            <TextField
              label="Room ID"
              fullWidth
              value={inputRoomId}
              placeholder="Enter room ID or create a new room"
              onChange={(e) => setInputRoomId(e.target.value)}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => {
                  // If room ID is empty, create one.
                  if (!inputRoomId.trim()) {
                    const newRoomId = generateRoomId();
                    setInputRoomId(newRoomId);
                    setSnackbarOpen(true);
                  }
                }}
              >
                Create Room
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Only join if both fields are non-empty.
                  if (inputName.trim() && inputRoomId.trim()) {
                    setName(inputName.trim());
                    setRoomId(inputRoomId.trim());
                  }
                }}
              >
                Join Meeting
              </Button>
            </Box>
          </Box>
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity="success"
            >
              Room created with ID: {inputRoomId}
            </Alert>
          </Snackbar>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "background.default",
          overflow: "hidden",
        }}
      >
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
            py: { xs: 0.5, sm: 1 },
            backgroundColor: "background.paper",
          }}
        >
          <Container maxWidth="lg">
            <Box display="flex" alignItems="center" sx={{ pl: { xs: 1, sm: 2 } }}>
              <img
                src="/api/placeholder/24/24"
                alt="Video Chat Logo"
                style={{ marginRight: 8 }}
              />
              <Typography
                variant="h1"
                color="primary"
                sx={{
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                  letterSpacing: "-0.5px",
                }}
              >
                Video Meet
              </Typography>
            </Box>
          </Container>
        </AppBar>

        <Container
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            py: { xs: 1, sm: 2, md: 3 },
            px: { xs: 1, sm: 2 },
          }}
        >
          <VideoPlayer />
          <Box sx={{ mt: "auto" }}>
            <Options />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
