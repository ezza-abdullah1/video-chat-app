import React from "react";
import { Typography, Box } from "@mui/material";

const Notifications = () => {
  return (
    <Box sx={{ mt: 1, textAlign: "center" }}>
      <Typography variant="caption" color="textSecondary">
        You’re connected to the meeting.
      </Typography>
    </Box>
  );
};

export default Notifications;
