import { useState, useCallback, useEffect, useMemo } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { theme } from './theme';
import { CreativeCanvasStudio } from './components/canvas/CreativeCanvasStudio';
import { PersonaSelector, WorkflowSelector } from './components/onboarding';
import { FashionStudio } from './components/studios/fashion';
import { SocialStudio } from './components/studios/social';
import { MoodboardsStudio } from './components/studios/moodboards';
import { InteriorDesignStudio } from './components/studios/interior';
import { StorytellerStudio } from './components/studios/storyteller';
import { AppNavigation } from './components/navigation';
import { AssetLibraryPage, InspirationGalleryPage } from './components/asset-library';
import {
  type PersonaType,
  type WorkflowTemplate,
} from './data/workflowTemplates';

// ============================================================================
// ONBOARDING STATE PERSISTENCE
// ============================================================================

const ONBOARDING_KEY = 'creative-canvas-onboarding';

interface OnboardingState {
  completed: boolean;
  persona?: PersonaType;
}

const getOnboardingState = (): OnboardingState => {
  try {
    const stored = localStorage.getItem(ONBOARDING_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  return { completed: false };
};

const setOnboardingState = (state: OnboardingState) => {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
};

// ============================================================================
// APP CONTENT WITH ROUTING
// ============================================================================

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [onboardingState, setOnboardingStateLocal] = useState<OnboardingState>(getOnboardingState);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(
    onboardingState.persona || null
  );
  const [pendingWorkflow, setPendingWorkflow] = useState<WorkflowTemplate | null>(null);

  // Redirect to onboarding if not completed and on root
  useEffect(() => {
    if (!onboardingState.completed && location.pathname === '/') {
      navigate('/welcome', { replace: true });
    }
  }, [onboardingState.completed, location.pathname, navigate]);

  const handleSelectPersona = useCallback((persona: PersonaType) => {
    setSelectedPersona(persona);
    navigate('/welcome/workflows');
  }, [navigate]);

  const handleSelectWorkflow = useCallback((workflow: WorkflowTemplate) => {
    // Mark onboarding as complete and save persona
    const newState: OnboardingState = {
      completed: true,
      persona: selectedPersona || undefined,
    };
    setOnboardingState(newState);
    setOnboardingStateLocal(newState);

    // Store workflow to load
    setPendingWorkflow(workflow);

    // Navigate to main app
    navigate('/');
  }, [selectedPersona, navigate]);

  const handleSkipOnboarding = useCallback(() => {
    // Mark onboarding as complete
    const newState: OnboardingState = {
      completed: true,
      persona: selectedPersona || 'general',
    };
    setOnboardingState(newState);
    setOnboardingStateLocal(newState);

    // Navigate to main app
    navigate('/');
  }, [selectedPersona, navigate]);

  const handleBackToPersonas = useCallback(() => {
    navigate('/welcome');
  }, [navigate]);

  // Clear pending workflow after it's been loaded
  const handleWorkflowLoaded = useCallback(() => {
    setPendingWorkflow(null);
  }, []);

  // Determine if navigation should be hidden (onboarding pages)
  const hideNavigation = useMemo(() => {
    return location.pathname.startsWith('/welcome');
  }, [location.pathname]);

  return (
    <Box sx={{ width: '100vw', height: '100vh', overflow: 'hidden', display: 'flex' }}>
      {/* Left Navigation */}
      <AppNavigation hidden={hideNavigation} />

      {/* Main Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Routes>
        {/* Onboarding - Persona Selection */}
        <Route
          path="/welcome"
          element={
            <PersonaSelector
              onSelectPersona={handleSelectPersona}
              onSkip={handleSkipOnboarding}
            />
          }
        />

        {/* Onboarding - Workflow Selection */}
        <Route
          path="/welcome/workflows"
          element={
            selectedPersona ? (
              <WorkflowSelector
                persona={selectedPersona}
                onSelectWorkflow={handleSelectWorkflow}
                onBack={handleBackToPersonas}
                onSkipToEmptyCanvas={handleSkipOnboarding}
              />
            ) : (
              <Navigate to="/welcome" replace />
            )
          }
        />

        {/* Main App - Canvas */}
        <Route
          path="/"
          element={
            <CreativeCanvasStudio
              initialWorkflow={pendingWorkflow}
              onWorkflowLoaded={handleWorkflowLoaded}
              userPersona={onboardingState.persona}
            />
          }
        />
        <Route
          path="/canvas"
          element={
            <CreativeCanvasStudio
              userPersona={onboardingState.persona}
            />
          }
        />
        <Route
          path="/board/:boardId"
          element={
            <CreativeCanvasStudio
              userPersona={onboardingState.persona}
            />
          }
        />

        {/* Studios */}
        <Route
          path="/studios/fashion/*"
          element={
            <FashionStudio
              onBack={() => navigate('/')}
              onNavigate={{
                toFashion: () => navigate('/studios/fashion'),
                toSocial: () => navigate('/studios/social'),
                toMoodboards: () => navigate('/studios/moodboards'),
                toCanvas: () => navigate('/canvas'),
              }}
            />
          }
        />
        <Route
          path="/studios/social/*"
          element={
            <SocialStudio
              onBack={() => navigate('/')}
            />
          }
        />
        <Route
          path="/studios/moodboards/*"
          element={
            <MoodboardsStudio
              onBack={() => navigate('/')}
            />
          }
        />
        <Route
          path="/studios/interior/*"
          element={
            <InteriorDesignStudio
              onBack={() => navigate('/')}
            />
          }
        />
        <Route
          path="/studios/storyteller/*"
          element={
            <StorytellerStudio
              onBack={() => navigate('/')}
            />
          }
        />

        {/* Asset Library & Gallery */}
        <Route
          path="/library"
          element={<AssetLibraryPage />}
        />
        <Route
          path="/inspiration"
          element={<InspirationGalleryPage />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
