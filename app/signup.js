import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ImageBackground, KeyboardAvoidingView, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { database } from './firebase';
import { ref, set } from 'firebase/database';

const SignUp = ({ onSignInPress }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    if (!username || !email || !phone || !password) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const userId = email.replace('.', '_');

    set(ref(database, 'users/' + userId), { username, email, phone, password })
      .then(() => {
        alert('Inscription réussie !');
        onSignInPress();
      })
      .catch(err => alert('Erreur : ' + err.message));
  };

  return (
    <ImageBackground source={require('../assets/IMG.png')} style={styles.background}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Inscription</Text>
            <Text style={styles.subtitle}>Créer un compte !</Text>
          </View>

          <View style={styles.form}>

            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#FCAF03" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Nom d'utilisateur"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#000"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#FCAF03" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Adresse e-mail"
                style={styles.input}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#000"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#FCAF03" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Numéro de téléphone"
                style={styles.input}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholderTextColor="#000"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#FCAF03" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Mot de passe"
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#000"
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
              <Text style={styles.buttonText}>S{"'"}INSCRIRE</Text>
            </TouchableOpacity>

            <View style={styles.bottomText}>
              <Text style={styles.bottomTextNormal}>
                Vous avez déjà un compte ?{' '}
                <Text style={styles.bottomTextLink} onPress={onSignInPress}>Se connecter</Text>
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
  buttonText: { fontFamily: 'DM-Bold', fontWeight: '600', fontSize: 18, color: '#000' },
  bottomText: { alignItems: 'center', marginTop: 10 },
  bottomTextNormal: { color: '#000', fontSize: 16, fontFamily: 'DM-Bold' },
  bottomTextLink: { color: '#FCAF03', fontSize: 16, fontWeight: 'bold', fontFamily: 'DM-Bold' },
});

export default SignUp;
