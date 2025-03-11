import React from 'react';
import { Typography, AppBar } from '@mui/material';
import { makeStyles } from '@mui/styles';
import VideoPlayer from './components/VideoPlayer';
import Options from './components/Options';
import Notifications from './components/Notifications';

// Fix: Pass `theme` as an argument inside the function
const useStyles = makeStyles((theme) => ({
    appBar: {
        borderRadius: 15,
        margin: '30px auto', // Centering the AppBar
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '600px',
        border: '2px solid black',
        padding: '10px',

        // Fix: Use conditional check to prevent issues with theme
        [`@media (max-width: 600px)`]: {
            width: '90%',
            margin: '20px auto',
        },
    },
    
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        padding: '20px',
        minHeight: '100vh',
    },
}));

const App = () => {
    const classes = useStyles(); // Use styles

    return (
        <div className={classes.wrapper}>
            <AppBar className={classes.appBar} position="static">
                <Typography variant="h2" align="center">
                    VIDEO CHAT
                </Typography>
            </AppBar>
            <VideoPlayer />
            <Options>
                <Notifications />
            </Options>
        </div>
    );
}

export default App;
