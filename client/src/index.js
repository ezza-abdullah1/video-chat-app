import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

import App from './App';
import{ContextProvider} from './SocketContext';
import process from "process"; // Import process polyfill (if needed)

window.process = process; 

const root = ReactDOM.createRoot(document.getElementById('root')); // Correct for React 18
root.render(
    <ContextProvider>
        <App />
    </ContextProvider>
);
