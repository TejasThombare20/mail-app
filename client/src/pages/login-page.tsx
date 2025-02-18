import React, { useEffect, useState } from 'react';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import {AlertCircle} from "lucide-react"
import { Alert, AlertDescription } from '../components/ui-component/Alert';
import { Button } from '../components/ui-component/Button';
import { firebaseConfig } from '../config/firebaseConfig';


type Props = {}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Loginpage = (props: Props) => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("User signed out successfully.");
        // Optionally, redirect the user to the login page or another route
        navigate("/login");
      })
      .catch((error) => {
        // An error happened during sign-out.
        console.error("Error signing out:", error);
      });
  };

  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     // console.log("user",user)
  //     if (user) {
  //       navigate('/dashboard');
  //     }
  //     console.log("Hello from the dashboard")
  //       handleSignOut();
  //   });

  //   // return () => unsubscribe();
  // }, [navigate]);

  // const handleGoogleSignIn = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError('');

  //     const provider = new GoogleAuthProvider();
      
  //     // Add Gmail API scopes
  //     provider.addScope('https://www.googleapis.com/auth/gmail.send');
  //     provider.addScope('https://www.googleapis.com/auth/gmail.compose');
      
  //     const result = await signInWithPopup(auth, provider);
  //     const credential = GoogleAuthProvider.credentialFromResult(result);



  //     console.log({result ,credential } )
  //     // @ts-ignore
  //     console.log("idtoken : ", result.user?.stsTokenManager) 

  //     const idtoken = await result.user.getIdToken()

  //     console.log("simple-id-token",idtoken)
      
  //     if (!credential) {
  //       throw new Error('Failed to get credentials');
  //     }

  //     // Send token to backend
  //     const response = await fetch('http://localhost:8000/api/auth/google-signin', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         token: await result.user.getIdToken(),
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to authenticate with backend');
  //     }

  //     // const { token } = await response.json();
  //     // localStorage.setItem('token', token);
      
  //     navigate('/dashboard');
  //   } catch (err) {
  //     console.error('Login error:', err);
  //     setError(err instanceof Error ? err.message : 'Failed to sign in');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleGoogleSignIn = async () => {
    try {
      // Get auth URL from backend
      const response = await fetch('http://localhost:8000/api/auth/google/url');
      const { url } = await response.json();

      console.log("url",url)
      
      // Redirect to Google consent screen
      window.location.href = url;
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Email Template Manager
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex justify-center items-center space-x-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
            </Button>
          </div>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              By signing in, you agree to allow this application to send emails on your behalf
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Loginpage