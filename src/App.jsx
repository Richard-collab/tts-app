import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import TtsEditor from './pages/TtsEditor';
import Home from './pages/Home';
import theme from './theme';
import './App.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tts-editor" element={<TtsEditor />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
