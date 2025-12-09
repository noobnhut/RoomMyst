import React from 'react';
import { Button } from './UIComponents';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  isLoggedIn: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin, isLoggedIn }) => {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-2xl font-display font-bold tracking-tighter">
            Room<span className="text-gray-400">Myst</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={isLoggedIn ? onGetStarted : onLogin}
              className="font-medium text-sm px-5 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {isLoggedIn ? 'Dashboard' : 'Sign In'}
            </button>
            <button 
              onClick={onGetStarted}
              className="font-medium text-sm px-5 py-2 rounded-full bg-gray-900 text-white hover:bg-black transition-colors shadow-lg hover:shadow-gray-900/20"
            >
              Start Creating
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-linear-to-tr from-purple-200/50 via-pink-100/50 to-blue-200/50 blur-[100px] -z-10 rounded-full opacity-70"></div>
        
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-block px-4 py-1.5 rounded-full border border-gray-200 bg-white/50 backdrop-blur text-sm font-medium text-gray-600 mb-4 shadow-sm">
            ✨ Powered by Gemini 2.5 Flash
          </div>
          
          <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight">
            Unlock the mystery of <br/>
            <span className="text-gradient-purple">Viral Content Creation</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Stop staring at a blank screen. RoomMyst combines advanced AI with proven viral frameworks to generate scripts, captions, and hooks in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={onGetStarted}
              className="h-14 px-8 rounded-full bg-gray-900 text-white text-lg font-bold hover:bg-black transition-all hover:scale-105 shadow-xl hover:shadow-gray-900/25 flex items-center gap-2"
            >
              Try for Free 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
           
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-2xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-bold">High-Speed Generation</h3>
              <p className="text-gray-500">Built on Gemini Flash architecture for near-instant results. Generate comprehensive scripts while you pour your coffee.</p>
            </div>
            
            <div className="glass-panel p-8 rounded-2xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h3 className="text-xl font-bold">Style Alchemy</h3>
              <p className="text-gray-500">From cinematic storytelling to punchy sales copy. Choose from 6+ engineered styles designed for specific platforms.</p>
            </div>

            <div className="glass-panel p-8 rounded-2xl space-y-4 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold">Content Library</h3>
              <p className="text-gray-500">Never lose a good idea. Save, edit, and manage your generated content in a secure, personal cloud library.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-900 font-display font-bold">RoomMyst Inc.</div>
          <div className="text-gray-500 text-sm">© 2024 RoomMyst. All rights reserved.</div>
          <div className="flex gap-6 text-sm font-medium text-gray-600">
            {/* <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Twitter</a> */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;