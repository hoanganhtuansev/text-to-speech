import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { VideoVoiceStandalone } from './components/VideoVoiceStandalone.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <VideoVoiceStandalone />
  </StrictMode>,
);
