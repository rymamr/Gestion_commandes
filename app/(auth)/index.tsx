import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, Alert, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity, Image,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/auth';

const colors = {
  background: "#cfcfcf",
  primary: "#C00000", 
  accent: "#1F1F1F",
  inputBg: "#FFFFFF",
  border: "#DDD", 
  greyText: "#666666",
};

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { login, user } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  const handleAuth = async () => {
    const url = isLogin
      ? 'http://192.168.1.13/gestion_commandes_api/login.php'
      : 'http://192.168.1.13/gestion_commandes_api/register.php';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        login(data.email || email);
        Alert.alert('Succès', isLogin ? 'Connexion réussie' : 'Inscription réussie');
      } else {
        Alert.alert('Erreur', data.message || 'Une erreur est survenue');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Image
          source={require('../../assets/logoMS_Contact.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>MS Contact</Text>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <Text style={styles.title}>{isLogin ? 'Connexion' : 'Inscription'}</Text>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor={colors.greyText}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              placeholder="Mot de passe"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholderTextColor={colors.greyText}
            />
            <Button
              title={isLogin ? 'Se connecter' : "S'inscrire"}
              color={colors.primary}
              onPress={handleAuth}
            />
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.switch}>
                {isLogin
                  ? "Pas de compte ? S'inscrire"
                  : "Déjà un compte ? Se connecter"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  logo: {
    width: 200,
    height: 100,
    marginRight: 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.inputBg,
    color: colors.accent,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switch: {
    color: colors.primary,
    marginTop: 12,
    textAlign: 'center',
  },
});
