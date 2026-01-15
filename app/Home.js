// app/Home.js - UPDATED WITH MYADS
import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView } from "react-native";
import { Ionicons } from '@expo/vector-icons';

import List from "./components/list";
import Profile from "./components/profile";
import Favorites from "./components/favorites";
import MyAds from "./components/MyAds"; // NOUVEAU
import LogementDetail from "./components/LogementDetail";
import FilterModal from "./components/FilterModal";

export default function Home({ username, onLogout }) {
  const [screen, setScreen] = useState("list");
  const [selectedLogement, setSelectedLogement] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  const handleSelectLogement = (logement) => {
    setSelectedLogement(logement);
    setScreen("detail");
  };

  const handleBack = () => {
    setScreen("list");
    setSelectedLogement(null);
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
    setShowFilters(false);
  };

  const renderScreen = () => {
    switch (screen) {
      case "list": 
        return (
          <List 
            username={username} 
            onSelectLogement={handleSelectLogement}
            filters={activeFilters}
          />
        );
      case "profile": 
        return <Profile username={username} onLogout={onLogout} />;
      case "favorites": 
        return <Favorites username={username} onSelectLogement={handleSelectLogement} />;
      case "myAds": // NOUVEAU
        return <MyAds username={username} onSelectLogement={handleSelectLogement} onBack={() => setScreen("list")} onNavigate={(screen) => setScreen(screen)} />;
      case "detail": 
        return <LogementDetail logement={selectedLogement} onBack={handleBack} />;
      default: 
        return <List username={username} onSelectLogement={handleSelectLogement} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        {screen !== "detail" && screen !== "myAds" && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {screen === "list" ? "Tous les logements" : 
               screen === "favorites" ? "Mes favoris" : 
               screen === "profile" ? "Mon profil" : ""}
            </Text>
            
            {screen === "list" && (
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilters(true)}
              >
                <Ionicons name="filter-outline" size={24} color="#1f3865" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bouton retour pour détail et MyAds */}
        {(screen === "detail" || screen === "myAds") && (
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons name="arrow-back" size={24} color="#1f3865" />
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {screen === "detail" ? "Détails" : "Mes annonces"}
            </Text>
            <View style={{ width: 60 }} />
          </View>
        )}

        <View style={styles.content}>
          {renderScreen()}
        </View>

        {/* Navigation basse (cachée en détail et myAds) */}
        {(screen !== "detail" && screen !== "myAds") && (
          <View style={styles.navbar}>
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setScreen("list")}
            >
              <Ionicons 
                name="home-outline" 
                size={28} 
                color={screen === "list" ? "#FCAF03" : "#fff"} 
              />
              <Text style={[
                styles.navText, 
                screen === "list" && { color: "#FCAF03" }
              ]}>
                Logements
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setScreen("favorites")}
            >
              <Ionicons 
                name="heart-outline" 
                size={28} 
                color={screen === "favorites" ? "#FCAF03" : "#fff"} 
              />
              <Text style={[
                styles.navText, 
                screen === "favorites" && { color: "#FCAF03" }
              ]}>
                Favoris
              </Text>
            </TouchableOpacity>

            {/* NOUVEAU: Bouton Mes Annonces */}
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setScreen("myAds")}
            >
              <Ionicons 
                name="add-circle-outline" 
                size={28} 
                color={screen === "myAds" ? "#FCAF03" : "#fff"} 
              />
              <Text style={[
                styles.navText, 
                screen === "myAds" && { color: "#FCAF03" }
              ]}>
                Mes Annonces
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => setScreen("profile")}
            >
              <Ionicons 
                name="person-outline" 
                size={28} 
                color={screen === "profile" ? "#FCAF03" : "#fff"} 
              />
              <Text style={[
                styles.navText, 
                screen === "profile" && { color: "#FCAF03" }
              ]}>
                Profil
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal filtre */}
        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          onApply={handleApplyFilters}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f3865',
    flex: 1,
    textAlign: 'center',
  },
  filterButton: {
    padding: 5,
    position: 'absolute',
    right: 15,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  backText: {
    marginLeft: 5,
    color: '#1f3865',
    fontSize: 16,
    fontWeight: '500',
  },
  content: { 
    flex: 1 
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#1f3865",
    paddingVertical: 12,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingBottom: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: { 
    alignItems: "center",
    paddingHorizontal: 5,
  },
  navText: { 
    color: "#fff", 
    fontSize: 12, 
    marginTop: 4,
    fontWeight: '500',
  },
});