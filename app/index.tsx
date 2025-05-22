import React from 'react';
import { useAuth } from '../context/auth';
import { Redirect } from 'expo-router';

export default function RootRedirect() {
  const { isLoggedIn } = useAuth();
  return <Redirect href="/(auth)" />;
} 
 