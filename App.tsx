import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { SplashScreenApp } from './src/screens/SplashScreenApp';

export default function App() {
  const [pronto, setPronto] = useState(false);

  if (!pronto) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreenApp onPronto={() => setPronto(true)} />
      </>
    );
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
