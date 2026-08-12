import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserData } from '../context/UserContext';
import { PostData } from '../context/PostContext';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { loginUser , loading} = UserData();
  const {fetchPosts} = PostData();

  const submitHandler = (e) => {
    e.preventDefault();
    loginUser(email, password, navigate, fetchPosts);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="w-full max-w-5xl flex shadow-lg rounded-3xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
        <div className="w-full md:w-3/5 p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-teal-600 rounded-2xl mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="font-bold text-3xl md:text-4xl text-slate-800 dark:text-slate-100 mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Login to continue your social journey</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-6">   
            <div className="space-y-5">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 outline-none text-slate-700 dark:text-slate-100 placeholder-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 outline-none text-slate-700 dark:text-slate-100 placeholder-slate-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            <div className="text-center md:hidden pt-4">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">Don't have an account?</p>
              <Link
                to="/register"
                className="text-teal-600 dark:text-teal-400 font-semibold hover:underline transition-colors"
              >
                Create Account →
              </Link>
            </div>
          </form>
        </div>

        {/* Side Panel */}
        <div className="hidden md:flex w-2/5 bg-teal-600 text-white flex-col justify-center items-center p-10 relative overflow-hidden">
          <div className="relative z-10 text-center space-y-6">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold leading-tight">New Here?</h1>
            <p className="text-teal-50 text-base px-4">
              Join our community and connect with friends around the world
            </p>
            <Link
              to="/register"
              className="inline-block mt-6 bg-white text-teal-600 px-8 py-3 rounded-full font-semibold hover:bg-teal-50 transition-colors shadow-sm"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
