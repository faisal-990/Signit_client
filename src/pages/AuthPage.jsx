import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function AuthPage({ mode }) {
  const { isAuthenticated, handleGoogleLogin } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4 py-8">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white border border-blue-100 rounded-2xl shadow-2xl p-6 sm:p-8 md:p-10 flex flex-col gap-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-blue-700 tracking-tight mb-2">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        <div className="text-center text-gray-500 text-base mb-2">
          {isLogin
            ? 'Welcome back! Sign in to your account.'
            : 'Create your free SignIt account with Google.'}
        </div>
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg text-base sm:text-lg shadow transition duration-200 mb-2"
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48" fill="currentColor">
            <g>
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C36.68 2.68 30.77 0 24 0 14.82 0 6.71 5.82 2.69 14.09l7.98 6.2C12.33 13.13 17.68 9.5 24 9.5z" />
              <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.6C43.98 37.13 46.1 31.36 46.1 24.55z" />
              <path fill="#FBBC05" d="M9.67 28.29c-1.13-3.36-1.13-6.93 0-10.29l-7.98-6.2C-1.1 17.18-1.1 30.82 1.69 39.91l7.98-6.2z" />
              <path fill="#EA4335" d="M24 46c6.48 0 11.92-2.15 15.89-5.85l-7.19-5.6c-2.01 1.35-4.6 2.15-8.7 2.15-6.32 0-11.67-3.63-13.33-8.59l-7.98 6.2C6.71 42.18 14.82 48 24 48z" />
              <path fill="none" d="M0 0h48v48H0z" />
            </g>
          </svg>
          {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
        </button>
        {/* Example email/password form for demonstration (if you add one) */}
        {/* <form className="flex flex-col gap-4">
          <input type="email" placeholder="Email" className="px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-800 placeholder-gray-400 shadow-sm transition" />
          <input type="password" placeholder="Password" className="px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-gray-800 placeholder-gray-400 shadow-sm transition" />
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow transition">{mode === 'login' ? 'Login' : 'Register'}</button>
        </form> */}
        <div className="text-center text-gray-600 text-sm sm:text-base">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                Register
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
