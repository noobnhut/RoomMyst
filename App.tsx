import React, { useState, useEffect, useRef, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { GeneratedContent, DatabaseItem, UserProfile } from './types';

// Lazy load components
const Generator = React.lazy(() => import('./components/Generator'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const LoginView = React.lazy(() => import('./components/LoginView'));
const LandingPage = React.lazy(() => import('./components/LandingPage'));
const ArticleViewer = React.lazy(() => import('./components/ArticleViewer'));

const LoadingFallback = () => (
  <div className="min-h-screen w-full bg-neutral-50"></div>
);

const App: React.FC = () => {
  // Auth State
  const [checkingSession, setCheckingSession] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const isMounted = useRef(true);

  // Router State
  // We use window.location.pathname as the source of truth
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Data Synchronization State
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Simple navigation function
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0); // Ensure scroll to top on nav
  };

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Optimized Auth Initialization
  useEffect(() => {
    isMounted.current = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initAuth = async () => {
      try {
        const [{ supabase }, { syncUserProfile }] = await Promise.all([
           import('./services/supabase'),
           import('./services/auth')
        ]);

        if (!supabase) {
          if (isMounted.current) setCheckingSession(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted.current) {
          const profile = await syncUserProfile(session.user);
          if (isMounted.current) setUserProfile(profile);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!isMounted.current) return;

          if (event === 'SIGNED_OUT') {
            setUserProfile(null);
            navigate('/'); // Redirect to landing on logout
          } else if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
             const profile = await syncUserProfile(session.user);
             if (isMounted.current) setUserProfile(profile);
           
             if (window.location.pathname === '/') {
               navigate('/');
             }
          }
        });
        
        authSubscription = subscription;

      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        if (isMounted.current) setCheckingSession(false);
      }
    };

    initAuth();

    return () => {
      isMounted.current = false;
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, []);

  const handleSelectHistoryItem = (item: DatabaseItem) => {
    // Navigate to the dynamic route
    navigate(`/library/${item.id}`);
  };

  const handleLogout = async () => {
    const { signOut } = await import('./services/auth');
    await signOut();
    navigate('/');
  };

  const handleContentSaved = () => {
    setLastUpdated(Date.now());
  };

  const handleNewProject = () => {
    navigate('/generator');
  };

  // -------------------------------------------------------------------------
  // Render Logic
  // -------------------------------------------------------------------------

  if (checkingSession) {
    return <div className="min-h-screen bg-neutral-50"></div>;
  }

  // Route: Landing Page (Root)
  if (currentPath === '/') {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingPage 
          onGetStarted={() => navigate(userProfile ? '/generator' : '/generator')} 
          onLogin={() => navigate('/generator')}
          isLoggedIn={!!userProfile}
        />
      </Suspense>
    );
  }

  // Protected Routes Wrapper
  if (!userProfile) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LoginView />
      </Suspense>
    );
  }

  // Detect Dynamic Route: /library/:id
  const isLibraryDetail = currentPath.startsWith('/library/');
  const libraryDetailId = isLibraryDetail ? currentPath.split('/').pop() : null;

  // App Layout (Navbar + Content)
  return (
    <div className="min-h-screen bg-neutral-50 text-gray-900 selection:bg-gray-900 selection:text-white pb-20">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6">
        
        {/* Persistent Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-gray-200 pb-6">
          <div className="text-center md:text-left flex-1 cursor-pointer" onClick={() => navigate('/')}>
            <h1 className="text-2xl font-display font-bold tracking-tighter text-gray-900">
              Room<span className="text-gray-400">Myst</span>
            </h1>
          </div>
          
          <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
            <button 
              onClick={handleNewProject}
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${currentPath === '/generator' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Generator
            </button>
            <button 
              onClick={() => navigate('/library')}
              // Highlight Library tab if on library root OR viewing an article
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${currentPath === '/library' || isLibraryDetail ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Library
            </button>
             <button 
              onClick={() => window.open('https://aistudio.google.com/generate-speech?model=gemini-2.5-pro-preview-tts', '_blank')}
              className="px-6 py-2 rounded-md text-sm font-bold transition-all text-gray-500 hover:text-gray-900"
            >
              Voiceover ↗
            </button>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-3 bg-white p-2 pl-4 rounded-full border border-gray-200 shadow-sm">
               <div className="md:flex flex-col text-right hidden sm:block">
                 <span className="text-xs font-bold text-gray-900 leading-none">{userProfile.fullname}</span>
               </div>
               {userProfile.avatar ? (
                 <img src={userProfile.avatar} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
               ) : (
                 <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold uppercase">
                   {userProfile.fullname.charAt(0)}
                 </div>
               )}
               <button 
                 onClick={handleLogout}
                 className="ml-2 text-gray-400 hover:text-gray-900 p-1 hover:bg-gray-100 rounded-full transition-colors"
                 title="Log out"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                 </svg>
               </button>
            </div>
          </div>
        </div>

        {/* Content Render based on Route */}
        <Suspense fallback={<LoadingFallback />}>
          {isLibraryDetail && libraryDetailId ? (
            <ArticleViewer 
              id={libraryDetailId} 
              onBack={() => navigate('/library')}
              currentUserId={userProfile.id}
            />
          ) : currentPath === '/library' ? (
            <Dashboard 
              onSelect={handleSelectHistoryItem} 
              onNew={handleNewProject} 
              currentUserId={userProfile.id}
              lastUpdated={lastUpdated} 
            />
          ) : (
            <Generator 
              userProfile={userProfile} 
              onContentSaved={handleContentSaved} 
              // Generator no longer handles initialItem for history, purely for creation now
            />
          )}
        </Suspense>

      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

export default App;