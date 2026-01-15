import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Image, StyleSheet, 
  ActivityIndicator, TextInput, TouchableOpacity 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { database } from "../firebase";
import { ref, get, set } from "firebase/database";

export default function Favorites({ username, onSelectLogement }) {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userEmail, setUserEmail] = useState(null);

  // Récupérer email de l'utilisateur
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const snapshot = await get(ref(database, "users"));
        if (snapshot.exists()) {
          const users = snapshot.val();
          const foundUser = Object.values(users).find(user => user.username === username);
          if (foundUser) setUserEmail(foundUser.email);
        }
      } catch (err) {
        console.log("Erreur récupération utilisateur :", err.message);
      }
    };
    fetchUserEmail();
  }, [username]);

  // Charger favoris
  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      return;
    }
    
    const emailKey = userEmail.replace(/\./g, "_");
    const fetchFavorites = async () => {
      try {
        const snapshot = await get(ref(database, `users/${emailKey}/favorites`));
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Gérer différents formats de données
          let favoritesArray = [];
          if (Array.isArray(data)) {
            favoritesArray = data;
          } else if (typeof data === 'object') {
            favoritesArray = Object.values(data);
          }
          // Filtrer les valeurs null
          favoritesArray = favoritesArray.filter(fav => fav !== null);
          setFavorites(favoritesArray);
          setFilteredFavorites(favoritesArray);
        } else {
          setFavorites([]);
          setFilteredFavorites([]);
        }
      } catch (err) {
        console.log("Erreur récupération favoris :", err.message);
        setFavorites([]);
        setFilteredFavorites([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [userEmail]);

  // Filtrer favoris
  useEffect(() => {
    if (!favorites || favorites.length === 0) {
      setFilteredFavorites([]);
      return;
    }
    
    if (search.trim() === "") {
      setFilteredFavorites(favorites);
      return;
    }
    
    const filtered = favorites.filter(item => {
      if (!item) return false;
      const searchLower = search.toLowerCase();
      return (
        (item.titre && item.titre.toLowerCase().includes(searchLower)) ||
        (item.ville && item.ville.toLowerCase().includes(searchLower)) ||
        (item.quartier && item.quartier.toLowerCase().includes(searchLower)) ||
        (item.type && item.type.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower))
      );
    });
    
    setFilteredFavorites(filtered);
  }, [search, favorites]);

  // Supprimer des favoris
  const removeFavorite = async (item) => {
    if (!userEmail) {
      alert("Veuillez vous connecter pour gérer vos favoris");
      return;
    }
    
    const newFavorites = favorites.filter(fav => fav && fav.id !== item.id);
    setFavorites(newFavorites);
    setFilteredFavorites(newFavorites.filter(fav => fav !== null));
    
    // Sauvegarder dans Firebase
    const emailKey = userEmail.replace(/\./g, "_");
    try {
      await set(ref(database, `users/${emailKey}/favorites`), newFavorites);
    } catch (err) {
      console.log("Erreur suppression favori :", err.message);
      alert("Erreur lors de la suppression");
    }
  };

  const renderCard = ({ item, index }) => {
    if (!item) return null;
    
    // Gérer les images
    const imageUri = item.photos && item.photos[0] 
      ? (item.photos[0].startsWith('data:') || item.photos[0].startsWith('http') 
          ? item.photos[0] 
          : `https://example.com/${item.photos[0]}`)
      : null;

    return (
      <TouchableOpacity 
        onPress={() => onSelectLogement && onSelectLogement(item)}
        activeOpacity={0.8}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          {/* Numéro de l'item */}
          <View style={styles.itemNumber}>
            <Text style={styles.itemNumberText}>{index + 1}</Text>
          </View>
          
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="home" size={40} color="#ddd" />
              <Text style={styles.noImageText}>Pas de photo</Text>
            </View>
          )}
          
          {/* Bouton supprimer favori */}
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              removeFavorite(item);
            }}
          >
            <Ionicons name="heart-dislike" size={24} color="#ff3b30" />
          </TouchableOpacity>
          
          <View style={styles.info}>
            <View style={styles.headerRow}>
              <Text style={styles.title} numberOfLines={1}>
                {item.titre || "Sans titre"}
              </Text>
            </View>
            
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.location} numberOfLines={1}>
                {item.ville || "Ville inconnue"} • {item.quartier || "Quartier inconnu"}
              </Text>
            </View>
            
            <Text style={styles.description} numberOfLines={2}>
              {item.description || "Pas de description disponible"}
            </Text>
            
            <View style={styles.footerRow}>
              <View>
                <Text style={styles.prix}>
                  {item.prix ? `${item.prix.toLocaleString()} DA` : "Prix non disponible"}
                </Text>
                <Text style={styles.perMonth}>/ mois</Text>
              </View>
              
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {item.type ? item.type.toUpperCase() : "N/A"}
                </Text>
              </View>
            </View>
            
            <View style={styles.bottomRow}>
              <View style={[
                styles.disponibleBadge,
                { backgroundColor: item.disponible ? '#e6f7e6' : '#ffe6e6' }
              ]}>
                <Ionicons 
                  name={item.disponible ? "checkmark-circle" : "close-circle"} 
                  size={12} 
                  color={item.disponible ? '#4CAF50' : '#F44336'} 
                />
                <Text style={[
                  styles.disponibleText,
                  { color: item.disponible ? '#4CAF50' : '#F44336' }
                ]}>
                  {item.disponible ? 'Disponible' : 'Non disponible'}
                </Text>
              </View>
              
              <Text style={styles.surface}>
                {item.surface ? `${item.surface} m²` : ""}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FCAF03" />
        <Text style={{ marginTop: 10, color: "#666" }}>Chargement de vos favoris...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="heart" size={28} color="#ff3b30" />
          <Text style={styles.titleHeader}>Mes Favoris</Text>
        </View>
        <Text style={styles.subtitle}>
          {favorites.length} logement{favorites.length !== 1 ? 's' : ''} sauvegardé{favorites.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={22} color="#FCAF03" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher dans mes favoris..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
        {search !== "" && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>

      {filteredFavorites.length === 0 ? (
        <View style={styles.noFavorites}>
          {favorites.length === 0 ? (
            <>
              <Ionicons name="heart-outline" size={80} color="#ddd" />
              <Text style={styles.noFavoritesTitle}>Aucun favori</Text>
              <Text style={styles.noFavoritesText}>
                Ajoutez des logements à vos favoris en cliquant sur l{"'"}icône ❤️
              </Text>
              <Text style={styles.noFavoritesTip}>
                Vos favoris seront sauvegardés même après déconnexion
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="search-outline" size={80} color="#ddd" />
              <Text style={styles.noFavoritesTitle}>Aucun résultat</Text>
              <Text style={styles.noFavoritesText}>
                Aucun favori ne correspond à votre recherche
              </Text>
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => setSearch("")}
              >
                <Text style={styles.clearSearchText}>Effacer la recherche</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item, index) => item && item.id ? item.id.toString() + index.toString() : index.toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {filteredFavorites.length} favori{filteredFavorites.length !== 1 ? 's' : ''} correspondant{filteredFavorites.length !== 1 ? 's' : ''} à votre recherche
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa" 
  },
  loading: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f8f9fa"
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleHeader: { 
    fontSize: 24, 
    fontWeight: "700", 
    marginLeft: 10,
    color: '#1a365d'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#fff", 
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
    paddingHorizontal: 16, 
    borderRadius: 12, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: { 
    flex: 1, 
    height: 48, 
    fontSize: 16, 
    color: "#333" 
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: { 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  itemNumber: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FCAF03',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  itemNumberText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  image: { 
    width: "100%", 
    height: 180,
    backgroundColor: '#f0f0f0'
  },
  noImage: {
    width: "100%", 
    height: 180,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  noImageText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  info: { 
    padding: 16 
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: { 
    fontSize: 18, 
    fontWeight: "700", 
    flex: 1,
    color: '#1a365d'
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  description: { 
    fontSize: 14, 
    color: "#555", 
    marginBottom: 12,
    lineHeight: 20
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  prix: { 
    color: "#FCAF03", 
    fontWeight: "700",
    fontSize: 20,
    lineHeight: 24,
  },
  perMonth: {
    fontSize: 12,
    color: '#888',
    marginTop: -2,
  },
  typeBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f3865',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  disponibleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  disponibleText: { 
    fontWeight: "600", 
    fontSize: 12,
    marginLeft: 4,
  },
  surface: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  noFavorites: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noFavoritesTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#444',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  noFavoritesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  noFavoritesTip: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  clearSearchButton: {
    marginTop: 20,
    backgroundColor: '#FCAF03',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  clearSearchText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  }
});