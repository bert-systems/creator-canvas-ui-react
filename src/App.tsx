import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { CreativeCanvasStudio } from './components/canvas/CreativeCanvasStudio';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<CreativeCanvasStudio />} />
            <Route path="/board/:boardId" element={<CreativeCanvasStudio />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
