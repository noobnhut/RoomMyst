import React, { useState } from 'react';
import { Button, Card, Input } from './UIComponents';

const LoginView: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Import only Auth service, avoiding Content/Database logic code
      const { signInWithEmail, signUpWithEmail } = await import('../services/auth');

      if (isRegister) {
        if (!fullname.trim()) throw new Error("Full name is required");
        if (!apiKey.trim()) throw new Error("Gemini API Key is required");
        
        const { encryptData } = await import('../services/crypto');
        const encryptedKey = encryptData(apiKey.trim());

        await signUpWithEmail(email, password, fullname, encryptedKey);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-display font-bold tracking-tighter mb-2 text-gray-900">
            Room<span className="text-gray-400">Myst</span>
          </h1>
          <p className="text-gray-500 text-lg">Content Alchemist.</p>
        </div>

        <Card className="shadow-lg border border-gray-100">
          <div className="space-y-6 py-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 text-center">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-500 text-sm mt-1 text-center">
                {isRegister ? 'Enter your details to join' : 'Sign in to access your dashboard'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <Input 
                    label="Full Name" 
                    placeholder="John Doe" 
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    required={isRegister}
                  />
                  <Input 
                    label="Gemini API Key" 
                    placeholder="AIzaSy..." 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required={isRegister}
                    type="password"
                  />
                  <p className="text-[10px] text-gray-400 -mt-2">Your key is encrypted locally before being stored.</p>
                </>
              )}
              
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs text-center">
                  {error}
                </div>
              )}

              <Button 
                type="submit"
                disabled={loading}
                className="w-full mt-2"
              >
                {loading ? 'Please wait...' : (isRegister ? 'Sign Up' : 'Sign In')}
              </Button>
            </form>
            
            <div className="pt-4 border-t border-gray-100 text-center">
              <button 
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                {isRegister 
                  ? "Already have an account? Sign In" 
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginView;