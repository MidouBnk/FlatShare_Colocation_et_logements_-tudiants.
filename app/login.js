import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ImageBackground, KeyboardAvoidingView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, get, child } from "firebase/database";
import { database } from './firebase';

const Login = ({ onSignUpPress, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    const userId = email.replace(".", "_");
    const dbRef = ref(database);

    try {
      const snapshot = await get(child(dbRef, `users/${userId}`));

      if (snapshot.exists()) {
        const userData = snapshot.val();

        if (userData.password === password) {
          onLoginSuccess(userData.username);
        } else {
          alert("Mot de passe incorrect");
        }
      } else {
        alert("Utilisateur introuvable");
      }
    } catch (error) {
      alert("Erreur : " + error.message);
    }
  };

  return (
    <ImageBackground source={require('../assets/IMG.png')} style={styles.background}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}>

          <View style={styles.header}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Connectez-vous !</Text>
          </View>

          <View style={styles.form}>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#FCAF03" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Adresse e-mail"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor="#000"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#FCAF03" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Mot de passe"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholderTextColor="#000"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>SE CONNECTER</Text>
            </TouchableOpacity>

            <View style={styles.bottomText}>
              <Text style={styles.bottomTextNormal}>
                Vous n{"'"}avez pas de compte ?{' '}
                <Text style={styles.bottomTextLink} onPress={onSignUpPress}>Inscrivez-vous</Text>
              </Text>
            </View>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'space-between', resizeMode: 'cover' },
  header: { marginTop: 50, alignItems: 'center' },
  title: { fontSize: 22, color: 'white', fontFamily: 'DM-Bold', marginBottom: 10 },
  subtitle: { fontSize: 40, color: 'white', fontFamily: 'Dancing-Bold', textAlign: 'center' },
  form: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginVertical: 10,
    backgroundColor: 'white'
  },
  input: { flex: 1, paddingVertical: 12, paddingHorizontal: 5, fontSize: 16, color: '#000' },
  button: {
    backgroundColor: '#FCAF03',
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10
  },
  buttonText: { fontWeight: '600', fontSize: 18, color: '#000', fontFamily: 'DM-Bold' },
  bottomText: { alignItems: 'center', marginTop: 10 },
  bottomTextNormal: { color: '#000', fontSize: 16, fontFamily: 'DM-Bold' },
  bottomTextLink: { color: '#FCAF03', fontSize: 16, fontWeight: 'bold', fontFamily: 'DM-Bold' },
});

export default Login;
