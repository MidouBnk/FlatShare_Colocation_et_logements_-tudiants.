// app/components/Profile.js - UPDATED WITH BETTER BOTTOM HANDLING
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { database } from "../firebase";
import { ref, get } from "firebase/database";

export default function Profile({ username, onLogout }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const snapshot = await get(ref(database, "users"));
        if (snapshot.exists()) {
          const users = snapshot.val();
          const foundUser = Object.values(users).find(user => user.username === username);
          if (foundUser) {
            setUserData(foundUser);
            
            // Récupérer le nombre de favoris
            const emailKey = foundUser.email.replace(/\./g, "_");
            const favSnapshot = await get(ref(database, `users/${emailKey}/favorites`));
            if (favSnapshot.exists()) {
              const favorites = favSnapshot.val();
              let favoritesArray = [];
              if (Array.isArray(favorites)) {
                favoritesArray = favorites;
              } else if (typeof favorites === 'object') {
                favoritesArray = Object.values(favorites);
              }
              setFavoritesCount(favoritesArray.filter(fav => fav !== null).length);
            }
          }
        }
      } catch (err) {
        console.log("Erreur récupération données utilisateur :", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [username]);

  const handleLogout = () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Déconnexion", onPress: onLogout }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FCAF03" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec photo de profil */}
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileInitials}>
                {userData?.username?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
            <TouchableOpacity style={styles.editPhotoButton}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.username}>{userData?.username || "Utilisateur"}</Text>
          <Text style={styles.email}>{userData?.email || ""}</Text>
          
          <View style={styles.memberSince}>
            <Ionicons name="calendar-outline" size={14} color="#ccc" />
            <Text style={styles.memberSinceText}>Membre depuis Mars 2024</Text>
          </View>
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-circle-outline" size={22} color="#1f3865" />
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="person-outline" size={20} color="#1f3865" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Nom d{"'"}utilisateur</Text>
                <Text style={styles.infoValue}>{userData?.username || "-"}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail-outline" size={20} color="#1f3865" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Adresse email</Text>
                <Text style={styles.infoValue}>{userData?.email || "-"}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="call-outline" size={20} color="#1f3865" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Numéro de téléphone</Text>
                <Text style={styles.infoValue}>{userData?.phone || "Non renseigné"}</Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <Ionicons name="location-outline" size={20} color="#1f3865" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ville</Text>
                <Text style={styles.infoValue}>Alger</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editInfoButton}>
            <Ionicons name="create-outline" size={16} color="#FCAF03" />
            <Text style={styles.editInfoText}>Modifier les informations</Text>
          </TouchableOpacity>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="stats-chart-outline" size={22} color="#1f3865" />
            <Text style={styles.sectionTitle}>Mes statistiques</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#e8f4fd' }]}>
                <Ionicons name="eye-outline" size={24} color="#2196F3" />
              </View>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Consultés</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#f0f7ed' }]}>
                <Ionicons name="heart-outline" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statNumber}>{favoritesCount}</Text>
              <Text style={styles.statLabel}>Favoris</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#fef7e6' }]}>
                <Ionicons name="calendar-outline" size={24} color="#FF9800" />
              </View>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Visites</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#f5e6f9' }]}>
                <Ionicons name="chatbubble-outline" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
          </View>
        </View>

        {/* Paramètres */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={22} color="#1f3865" />
            <Text style={styles.sectionTitle}>Paramètres</Text>
          </View>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="#666" />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" />
                <Text style={styles.settingText}>Sécurité</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#666" />
                <Text style={styles.settingText}>Centre d{"'"}aide</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#666" />
                <Text style={styles.settingText}>À propos</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section déconnexion */}
        <View style={styles.logoutSection}>
          <Text style={styles.logoutTitle}>Déconnexion</Text>
          <Text style={styles.logoutDescription}>
            Vous serez déconnecté de votre compte et devrez vous reconnecter pour accéder à vos données.
          </Text>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={onLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        {/* Espace final */}
        <View style={styles.finalSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // IMPORTANT: Espace pour la navbar + marge
  },
  loading: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f5f5f5"
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  header: {
    backgroundColor: "#1f3865",
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FCAF03",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: '#fff',
  },
  profileInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FCAF03',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 10,
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberSinceText: {
    fontSize: 14,
    color: "#ccc",
    marginLeft: 5,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f3865",
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
  },
  editInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  editInfoText: {
    fontSize: 14,
    color: "#FCAF03",
    fontWeight: "600",
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1f3865",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: 'center',
    marginTop: 5,
  },
  settingsCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
    marginTop: 10,
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff3b30',
    marginBottom: 10,
  },
  logoutDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ff3b30',
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  finalSpacing: {
    height: 30,
  },
});