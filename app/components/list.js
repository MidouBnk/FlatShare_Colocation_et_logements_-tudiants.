import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, Image, StyleSheet, 
  ActivityIndicator, TextInput, TouchableOpacity 
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { database } from "../firebase";
import { ref, get, set } from "firebase/database";

export default function List({ username, onSelectLogement, filters = {} }) {
  const [logements, setLogements] = useState([]);
  const [filteredLogements, setFilteredLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
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

  // Charger logements
  useEffect(() => {
    const fetchLogements = async () => {
      try {
        const snapshot = await get(ref(database, "logements"));
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Convertir l'objet en tableau
          const logementsArray = Object.values(data);
          setLogements(logementsArray);
        } else {
          console.log("Aucun logement trouvé dans Firebase");
          setLogements([]);
        }
      } catch (err) {
        console.log("Erreur récupération logements :", err.message);
        setLogements([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogements();
  }, []);

  // Charger favoris
  useEffect(() => {
    if (!userEmail) return;
    
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
          setFavorites(favoritesArray.filter(fav => fav !== null));
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.log("Erreur récupération favoris :", err.message);
        setFavorites([]);
      }
    };
    fetchFavorites();
  }, [userEmail]);

  // Filtrer logements
  useEffect(() => {
    let filtered = [...logements];
    
    // Filtre par recherche textuelle
    if (search.trim() !== "") {
      filtered = filtered.filter(item => {
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
    }
    
    // Appliquer les filtres avancés
    if (filters) {
      // Filtre par prix
      if (filters.minPrice && !isNaN(filters.minPrice)) {
        filtered = filtered.filter(item => item.prix >= parseInt(filters.minPrice));
      }
      if (filters.maxPrice && !isNaN(filters.maxPrice)) {
        filtered = filtered.filter(item => item.prix <= parseInt(filters.maxPrice));
      }
      
      // Filtre par ville
      if (filters.ville && filters.ville !== "") {
        filtered = filtered.filter(item => 
          item.ville && item.ville.toLowerCase() === filters.ville.toLowerCase()
        );
      }
      
      // Filtre par type
      if (filters.type && filters.type !== "") {
        filtered = filtered.filter(item => 
          item.type && item.type.toLowerCase() === filters.type.toLowerCase()
        );
      }
      
      // Filtre par équipements
      if (filters.equipements && filters.equipements.length > 0) {
        filtered = filtered.filter(item => {
          if (!item.equipements) return false;
          return filters.equipements.every(equip => 
            item.equipements.includes(equip)
          );
        });
      }
      
      // Filtre par disponibilité
      if (filters.disponibleOnly) {
        filtered = filtered.filter(item => item.disponible === true);
      }
    }
    
    setFilteredLogements(filtered);
  }, [search, logements, filters]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FCAF03" />
        <Text style={{ marginTop: 10, color: "#666" }}>Chargement des logements...</Text>
      </View>
    );
  }

  // Toggle favori
  const toggleFavorite = async (item) => {
    if (!userEmail) {
      alert("Veuillez vous connecter pour ajouter aux favoris");
      return;
    }

    let newFavorites;
    const isFavorite = favorites.some(fav => fav && fav.id === item.id);
    
    if (isFavorite) {
      newFavorites = favorites.filter(fav => fav && fav.id !== item.id);
    } else {
      newFavorites = [...favorites, item];
    }
    
    setFavorites(newFavorites);
    
    // Sauvegarder dans Firebase
    const emailKey = userEmail.replace(/\./g, "_");
    try {
      await set(ref(database, `users/${emailKey}/favorites`), newFavorites);
    } catch (err) {
      console.log("Erreur sauvegarde favoris :", err.message);
      alert("Erreur lors de la sauvegarde des favoris");
    }
  };

  const renderCard = ({ item }) => {
    if (!item) return null;
    
    const isFavorite = favorites.some(fav => fav && fav.id === item.id);
    
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
      >
        <View style={styles.card}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="home" size={50} color="#ddd" />
              <Text style={styles.noImageText}>Pas de photo</Text>
            </View>
          )}
          
          {/* Badge favori en superposition */}
          <TouchableOpacity 
            style={styles.favoriteBadge}
            onPress={(e) => {
              e.stopPropagation();
              toggleFavorite(item);
            }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? "#ff3b30" : "#fff"}
            />
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
            
            {/* Équipements (afficher seulement les 2 premiers) */}
            {item.equipements && item.equipements.length > 0 && (
              <View style={styles.equipementsRow}>
                {item.equipements.slice(0, 2).map((equip, index) => (
                  <View key={index} style={styles.equipementBadge}>
                    <Ionicons name="checkmark" size={10} color="#4CAF50" />
                    <Text style={styles.equipementText}>{equip}</Text>
                  </View>
                ))}
                {item.equipements.length > 2 && (
                  <Text style={styles.moreEquipements}>+{item.equipements.length - 2}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={22} color="#FCAF03" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un logement..."
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
      
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {filteredLogements.length} logement{filteredLogements.length !== 1 ? 's' : ''} trouvé{filteredLogements.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {filteredLogements.length === 0 ? (
        <View style={styles.noResults}>
          <Ionicons name="home-outline" size={70} color="#ddd" />
          <Text style={styles.noResultsTitle}>
            {logements.length === 0 
              ? "Aucun logement disponible" 
              : "Aucun résultat"}
          </Text>
          <Text style={styles.noResultsSubtitle}>
            {logements.length === 0 
              ? "Les logements seront bientôt disponibles" 
              : "Essayez de modifier vos critères de recherche"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLogements}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
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
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#fff", 
    margin: 16,
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
  resultsInfo: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
    fontWeight: '500'
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  card: { 
    backgroundColor: "#fff", 
    marginBottom: 16, 
    borderRadius: 16, 
    overflow: "hidden",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  image: { 
    width: "100%", 
    height: 200,
    backgroundColor: '#f0f0f0'
  },
  noImage: {
    width: "100%", 
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  noImageText: {
    marginTop: 8,
    color: '#999',
    fontSize: 14
  },
  favoriteBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  equipementsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  equipementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  equipementText: {
    fontSize: 11,
    color: '#555',
    marginLeft: 4,
    fontWeight: '500',
  },
  moreEquipements: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    lineHeight: 20,
  }
});