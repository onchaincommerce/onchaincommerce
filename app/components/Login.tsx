"use client";

import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Login: React.FC = () => {
  const { login, ready, authenticated } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (authenticated) {
    return <div>You're already logged in!</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your accoun
          </h2>
        </div>
        <div>
          <button
            onClick={login}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with Privy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;