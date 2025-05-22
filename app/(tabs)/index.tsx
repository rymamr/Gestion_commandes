// app/(tabs)/index.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../../context/auth';
import { router } from 'expo-router';

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue, {user} 👋</Text>
      <Button title="Déconnexion" onPress={() => { logout(); router.replace('./(auth)'); }} />
    </View>
  );
} 

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center' },
  title: { fontSize:24, marginBottom:20 },
});
