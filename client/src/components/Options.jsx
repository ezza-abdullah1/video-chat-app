import React, { useState, useContext } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  Container,
  Paper,
} from "@mui/material";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Assignment, Phone, PhoneDisabled } from "@mui/icons-material";
import { styled, useTheme } from "@mui/material/styles";

import { SocketContext } from "../SocketContext";

// Styled Components using MUI v5
const Root = styled("form")({
  display: "flex",
  flexDirection: "column",
});

const PaperStyled = styled(Paper)({
  padding: "10px 20px",
  border: "2px solid black",
});

const Options = ({ children }) => {
  const { me, callAccepted, name, setName, callEnded, leaveCall, callUser } =
    useContext(SocketContext);
  const [idToCall, setIdToCall] = useState("");
  const theme = useTheme(); // Get theme for breakpoints

  return (
    <Container
      sx={{
        width: "600px",
        margin: "35px 0",
        padding: 0,
        [theme.breakpoints.down("xs")]: { width: "80%" },
      }}
    >
      <PaperStyled elevation={10}>
        <Root noValidate autoComplete="off">
          <Grid
            container
            sx={{
              width: "100%",
              [theme.breakpoints.down("xs")]: { flexDirection: "column" },
            }}
          >
            {/* Account Info Section */}
            <Grid item xs={12} md={6} sx={{ padding: 2 }}>
              <Typography gutterBottom variant="h6">
                Account Info
              </Typography>
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
              {console.log("Current ID (me):", me)}
<CopyToClipboard text={me} onCopy={() => console.log("Copied:", me)}>
  <Button
    variant="contained"
    color="primary"
    fullWidth
    sx={{ mt: 2 }}
    startIcon={<Assignment fontSize="large" />}
  >
    Copy Your ID
  </Button>
</CopyToClipboard>

            </Grid>

            {/* Call Section */}
            <Grid item xs={12} md={6} sx={{ padding: 2 }}>
              <Typography gutterBottom variant="h6">
                Make a call
              </Typography>
              <TextField
                label="ID to call"
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
                fullWidth
              />
              {callAccepted && !callEnded ? (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PhoneDisabled fontSize="large" />}
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={leaveCall}
                >
                  Hang Up
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Phone fontSize="large" />}
                  fullWidth
                  sx={{ mt: 2 }}

                  onClick={() => {
                    console.log("Calling ID:", idToCall);
                    if (!idToCall) {
                        alert("Please enter a valid ID to call.");
                        return;
                      }
                    callUser(idToCall)}}
                >
                  Call
                </Button>
              )}
            </Grid>
          </Grid>
        </Root>
        {children}
      </PaperStyled>
    </Container>
  );
};

export default Options;
