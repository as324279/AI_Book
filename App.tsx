import React, { useEffect, useState } from 'react';
import SplashScreen from './src/screens/SplashScreen';
import StartScreen from './src/screens/StartScreen';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000); // 2초 후 전환
    return () => clearTimeout(timer);
  }, []);

  return isLoading ? <SplashScreen /> : <StartScreen />;
}