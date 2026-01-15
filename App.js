import React, { useState } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import Login from "./app/login";
import SignUp from "./app/signup";
import Home from "./app/Home";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [username, setUsername] = useState("");

  const handleLoginSuccess = (name) => {
    setUsername(name);
    setScreen("home");
  };

  const handleLogout = () => {
    setScreen("login");
    setUsername("");
  };

  return (
    <View style={styles.container}>
      {screen === "login" && (
        <Login
          onSignUpPress={() => setScreen("signup")}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {screen === "signup" && (
        <SignUp onSignInPress={() => setScreen("login")} />
      )}

      {screen === "home" && (
        <Home username={username} onLogout={handleLogout} />
      )}

      <StatusBar barStyle="light-content" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }
});
