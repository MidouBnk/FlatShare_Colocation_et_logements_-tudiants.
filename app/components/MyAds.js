import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  Dimensions,
  SafeAreaView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { database } from "../firebase";
import { ref, get, set, remove } from "firebase/database";

const { width } = Dimensions.get('window');

const MyAds = ({ username, onSelectLogement, onBack, onNavigate }) => {
  const [myLogements, setMyLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLogement, setSelectedLogement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeScreen, setActiveScreen] = useState("myAds"); // Pour gérer l'icône active

  // Formulaire pour nouveau logement
  const [newLogement, setNewLogement] = useState({
    titre: "",
    description: "",
    type: "studio",
    ville: "",
    quartier: "",
    prix: "",
    surface: "",
    disponible: true,
    equipements: [],
  });

  const villes = ["Alger", "Oran", "Constantine", "Annaba", "Sétif", "Blida", "Tlemcen", "Batna", "Bejaia", "Skikda", "Mostaganem", "Djelfa"];
  const types = ["studio", "appartement", "colocation"];
  const equipementsList = ["WiFi", "Meublé", "Climatisation", "Machine à laver", "Cuisine équipée", "Chauffage", "Eau chaude", "Jardin", "Parking", "Balcon", "Terrasse"];

  // Récupérer email de l'utilisateur
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const snapshot = await get(ref(database, "users"));
        if (snapshot.exists()) {
          const users = snapshot.val();
          const usersArray = Object.values(users);
          const foundUser = usersArray.find(user => user.username === username);
          if (foundUser) {
            setUserEmail(foundUser.email);
            fetchMyLogements(foundUser.email);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.log("Erreur récupération utilisateur :", err.message);
        setLoading(false);
      }
    };
    fetchUserEmail();
  }, [username]);

  // Charger mes annonces
  const fetchMyLogements = async (email) => {
    try {
      const snapshot = await get(ref(database, "logements"));
      if (snapshot.exists()) {
        const allLogements = snapshot.val();
        let logementsArray = [];
        
        if (typeof allLogements === 'object' && allLogements !== null) {
          logementsArray = Object.values(allLogements);
        }
        
        const filtered = logementsArray.filter(logement => 
          logement && logement.proprietaire === email
        );
        
        setMyLogements(filtered);
      } else {
        setMyLogements([]);
      }
    } catch (err) {
      console.log("Erreur récupération mes logements :", err.message);
      setMyLogements([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle équipement
  const toggleEquipement = (equipement) => {
    setNewLogement(prev => ({
      ...prev,
      equipements: prev.equipements.includes(equipement)
        ? prev.equipements.filter(e => e !== equipement)
        : [...prev.equipements, equipement]
    }));
  };

  // Valider le formulaire
  const validateForm = () => {
    if (!newLogement.titre.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un titre");
      return false;
    }
    if (!newLogement.ville) {
      Alert.alert("Erreur", "Veuillez sélectionner une ville");
      return false;
    }
    if (!newLogement.quartier.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un quartier");
      return false;
    }
    if (!newLogement.prix || isNaN(newLogement.prix) || parseInt(newLogement.prix) <= 0) {
      Alert.alert("Erreur", "Veuillez saisir un prix valide");
      return false;
    }
    return true;
  };

  // Générer un nouvel ID unique
  const generateNewId = () => {
    if (myLogements.length === 0) return 51;
    const maxId = Math.max(...myLogements.map(l => l.id || 0));
    return maxId + 1;
  };

  // Trouver la prochaine clé disponible dans Firebase
  const findNextKey = (logementsObject) => {
    const keys = Object.keys(logementsObject).map(Number);
    if (keys.length === 0) return "0";
    const maxKey = Math.max(...keys);
    return (maxKey + 1).toString();
  };

  // Ajouter un logement
  const handleAddLogement = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const newId = generateNewId();
      const logementData = {
        id: newId,
        titre: newLogement.titre,
        description: newLogement.description,
        type: newLogement.type,
        ville: newLogement.ville,
        quartier: newLogement.quartier,
        prix: parseInt(newLogement.prix),
        surface: newLogement.surface ? parseInt(newLogement.surface) : null,
        disponible: newLogement.disponible,
        equipements: newLogement.equipements,
        proprietaire: userEmail,
        photos: ["https://www.stephanemillet.fr/public/img/big/Cam2jpg_620fc4006a745.jpg"]
      };

      const snapshot = await get(ref(database, "logements"));
      let currentLogements = {};
      
      if (snapshot.exists()) {
        currentLogements = snapshot.val();
      }
      
      const nextKey = findNextKey(currentLogements);
      currentLogements[nextKey] = logementData;
      
      await set(ref(database, "logements"), currentLogements);
      
      Alert.alert("Succès", "Votre logement a été ajouté avec succès !");
      setShowAddModal(false);
      resetForm();
      fetchMyLogements(userEmail);
      
    } catch (err) {
      Alert.alert("Erreur", "Une erreur est survenue : " + err.message);
      console.error("Erreur ajout logement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modifier un logement
  const handleEditLogement = async () => {
    if (!selectedLogement || !validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedData = {
        ...selectedLogement,
        titre: newLogement.titre,
        description: newLogement.description,
        type: newLogement.type,
        ville: newLogement.ville,
        quartier: newLogement.quartier,
        prix: parseInt(newLogement.prix),
        surface: newLogement.surface ? parseInt(newLogement.surface) : null,
        disponible: newLogement.disponible,
        equipements: newLogement.equipements,
      };

      const snapshot = await get(ref(database, "logements"));
      let currentLogements = {};
      
      if (snapshot.exists()) {
        currentLogements = snapshot.val();
      }
      
      let keyToUpdate = null;
      for (const key in currentLogements) {
        if (currentLogements[key] && currentLogements[key].id === selectedLogement.id) {
          keyToUpdate = key;
          break;
        }
      }
      
      if (keyToUpdate) {
        currentLogements[keyToUpdate] = updatedData;
        await set(ref(database, "logements"), currentLogements);
        
        Alert.alert("Succès", "Votre logement a été modifié avec succès !");
        setShowEditModal(false);
        resetForm();
        fetchMyLogements(userEmail);
      } else {
        Alert.alert("Erreur", "Logement non trouvé");
      }
      
    } catch (err) {
      Alert.alert("Erreur", "Une erreur est survenue : " + err.message);
      console.error("Erreur modification logement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Supprimer un logement
  const handleDeleteLogement = (logement) => {
    Alert.alert(
      "Confirmer la suppression",
      `Voulez-vous vraiment supprimer "${logement.titre || 'cette annonce'}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              const snapshot = await get(ref(database, "logements"));
              
              if (!snapshot.exists()) {
                Alert.alert("Erreur", "Aucun logement trouvé");
                return;
              }
              
              const currentLogements = snapshot.val();
              let keyToDelete = null;
              
              for (const key in currentLogements) {
                if (currentLogements[key] && currentLogements[key].id === logement.id) {
                  keyToDelete = key;
                  break;
                }
              }
              
              if (!keyToDelete) {
                for (const key in currentLogements) {
                  const item = currentLogements[key];
                  if (item && 
                      item.proprietaire === logement.proprietaire &&
                      item.titre === logement.titre) {
                    keyToDelete = key;
                    break;
                  }
                }
              }
              
              if (!keyToDelete) {
                Alert.alert("Erreur", "Annonce non trouvée dans la base de données");
                return;
              }
              
              const updatedLogements = { ...currentLogements };
              delete updatedLogements[keyToDelete];
              
              await set(ref(database, "logements"), updatedLogements);
              setMyLogements(prev => prev.filter(item => item.id !== logement.id));
              
              Alert.alert("Succès", "L'annonce a été supprimée avec succès !");
              
            } catch (err) {
              console.error("Erreur détaillée suppression:", err);
              Alert.alert("Erreur", "Impossible de supprimer : " + err.message);
            }
          }
        }
      ]
    );
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewLogement({
      titre: "",
      description: "",
      type: "studio",
      ville: "",
      quartier: "",
      prix: "",
      surface: "",
      disponible: true,
      equipements: [],
    });
    setSelectedLogement(null);
  };

  // Ouvrir modal d'édition
  const openEditModal = (logement) => {
    setSelectedLogement(logement);
    setNewLogement({
      titre: logement.titre || "",
      description: logement.description || "",
      type: logement.type || "studio",
      ville: logement.ville || "",
      quartier: logement.quartier || "",
      prix: logement.prix ? logement.prix.toString() : "",
      surface: logement.surface ? logement.surface.toString() : "",
      disponible: logement.disponible !== undefined ? logement.disponible : true,
      equipements: logement.equipements || [],
    });
    setShowEditModal(true);
  };

  const renderLogement = ({ item, index }) => {
    if (!item) return null;
    
    const imageUri = item.photos && item.photos[0] 
      ? (item.photos[0].startsWith('data:') || item.photos[0].startsWith('http') 
          ? item.photos[0] 
          : item.photos[0])
      : null;

    return (
      <TouchableOpacity 
        onPress={() => onSelectLogement && onSelectLogement(item)}
        activeOpacity={0.8}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="home" size={40} color="#ddd" />
            </View>
          )}
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={(e) => {
                e.stopPropagation();
                openEditModal(item);
              }}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteLogement(item);
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.titre || "Sans titre"}
            </Text>
            
            <View style={styles.cardLocation}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.cardLocationText} numberOfLines={1}>
                {item.ville || "Ville inconnue"} • {item.quartier || "Quartier inconnu"}
              </Text>
            </View>
            
            <View style={styles.cardFooter}>
              <Text style={styles.cardPrice}>
                {item.prix ? `${item.prix.toLocaleString()} DA` : "Prix non disponible"}
              </Text>
              
              <View style={[
                styles.statusBadge,
                { backgroundColor: item.disponible ? '#e6f7e6' : '#ffe6e6' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: item.disponible ? '#4CAF50' : '#F44336' }
                ]}>
                  {item.disponible ? 'Disponible' : 'Indisponible'}
                </Text>
              </View>
            </View>
            
            <View style={styles.cardDetails}>
              <View style={styles.typeBadge}>
                <Ionicons name="home-outline" size={12} color="#1f3865" />
                <Text style={styles.typeText}>
                  {item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : "N/A"}
                </Text>
              </View>
              
              {item.surface && (
                <View style={styles.surfaceBadge}>
                  <Ionicons name="expand-outline" size={12} color="#FCAF03" />
                  <Text style={styles.surfaceText}>{item.surface} m²</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FCAF03" />
          <Text style={styles.loadingText}>Chargement de vos annonces...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header avec bouton retour */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons name="arrow-back" size={24} color="#1f3865" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Mes Annonces</Text>
            <Text style={styles.subtitle}>
              {myLogements.length} annonce{myLogements.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          {myLogements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={80} color="#ddd" />
              <Text style={styles.emptyTitle}>Aucune annonce</Text>
              <Text style={styles.emptyText}>
                Publiez votre première annonce pour louer votre logement
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.emptyButtonText}>Ajouter une annonce</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={myLogements}
              keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
              renderItem={renderLogement}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <Text style={styles.listHeader}>
                  {myLogements.length} annonce{myLogements.length !== 1 ? 's' : ''} publiée{myLogements.length !== 1 ? 's' : ''}
                </Text>
              }
            />
          )}
        </View>

        {/* Barre de navigation avec 4 boutons */}
        <View style={styles.navbar}>
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => onNavigate && onNavigate("list")}
          >
            <Ionicons 
              name="home-outline" 
              size={28} 
              color={activeScreen === "list" ? "#FCAF03" : "#fff"} 
            />
            <Text style={[
              styles.navText, 
              activeScreen === "list" && { color: "#FCAF03" }
            ]}>
              Logements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => onNavigate && onNavigate("favorites")}
          >
            <Ionicons 
              name="heart-outline" 
              size={28} 
              color={activeScreen === "favorites" ? "#FCAF03" : "#fff"} 
            />
            <Text style={[
              styles.navText, 
              activeScreen === "favorites" && { color: "#FCAF03" }
            ]}>
              Favoris
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => onNavigate && onNavigate("myAds")}
          >
            <Ionicons 
              name="add-circle" 
              size={28} 
              color={activeScreen === "myAds" ? "#FCAF03" : "#fff"} 
            />
            <Text style={[
              styles.navText, 
              activeScreen === "myAds" && { color: "#FCAF03" }
            ]}>
              Mes Annonces
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.navItem} 
            onPress={() => onNavigate && onNavigate("profile")}
          >
            <Ionicons 
              name="person-outline" 
              size={28} 
              color={activeScreen === "profile" ? "#FCAF03" : "#fff"} 
            />
            <Text style={[
              styles.navText, 
              activeScreen === "profile" && { color: "#FCAF03" }
            ]}>
              Profil
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal d'ajout */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowAddModal(false);
            resetForm();
          }}
        >
          <FormModal
            title="Nouvelle annonce"
            logement={newLogement}
            setLogement={setNewLogement}
            villes={villes}
            types={types}
            equipementsList={equipementsList}
            toggleEquipement={toggleEquipement}
            onClose={() => {
              setShowAddModal(false);
              resetForm();
            }}
            onSubmit={handleAddLogement}
            isSubmitting={isSubmitting}
            submitText="Publier l'annonce"
          />
        </Modal>

        {/* Modal d'édition */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowEditModal(false);
            resetForm();
          }}
        >
          <FormModal
            title="Modifier l'annonce"
            logement={newLogement}
            setLogement={setNewLogement}
            villes={villes}
            types={types}
            equipementsList={equipementsList}
            toggleEquipement={toggleEquipement}
            onClose={() => {
              setShowEditModal(false);
              resetForm();
            }}
            onSubmit={handleEditLogement}
            isSubmitting={isSubmitting}
            submitText="Enregistrer les modifications"
          />
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// Composant FormModal
const FormModal = ({ 
  title, 
  logement, 
  setLogement, 
  villes, 
  types, 
  equipementsList, 
  toggleEquipement,
  onClose,
  onSubmit,
  isSubmitting,
  submitText
}) => {
  return (
    <View style={modalStyles.modalContainer}>
      <View style={modalStyles.modalContent}>
        <View style={modalStyles.modalHeader}>
          <Text style={modalStyles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
            <Ionicons name="close" size={24} color="#1f3865" />
          </TouchableOpacity>
        </View>

        <ScrollView style={modalStyles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Titre de l{"'"}annonce *</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Ex: Studio meublé proche université"
              value={logement.titre}
              onChangeText={(text) => setLogement({...logement, titre: text})}
            />
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Description</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.textArea]}
              placeholder="Décrivez votre logement..."
              value={logement.description}
              onChangeText={(text) => setLogement({...logement, description: text})}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Type de logement *</Text>
            <View style={modalStyles.optionsContainer}>
              {types.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    modalStyles.option,
                    logement.type === type && modalStyles.optionSelected
                  ]}
                  onPress={() => setLogement({...logement, type})}
                >
                  <Text style={[
                    modalStyles.optionText,
                    logement.type === type && modalStyles.optionTextSelected
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Ville *</Text>
            <View style={modalStyles.optionsContainer}>
              {villes.map(ville => (
                <TouchableOpacity
                  key={ville}
                  style={[
                    modalStyles.option,
                    logement.ville === ville && modalStyles.optionSelected
                  ]}
                  onPress={() => setLogement({...logement, ville})}
                >
                  <Text style={[
                    modalStyles.optionText,
                    logement.ville === ville && modalStyles.optionTextSelected
                  ]}>
                    {ville}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Quartier *</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Ex: Plateau, Hydra, Cité universitaire..."
              value={logement.quartier}
              onChangeText={(text) => setLogement({...logement, quartier: text})}
            />
          </View>

          <View style={modalStyles.row}>
            <View style={[modalStyles.formGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={modalStyles.label}>Prix (DA/mois) *</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="Ex: 12000"
                keyboardType="numeric"
                value={logement.prix}
                onChangeText={(text) => setLogement({...logement, prix: text})}
              />
            </View>
            
            <View style={[modalStyles.formGroup, { flex: 1 }]}>
              <Text style={modalStyles.label}>Surface (m²)</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="Ex: 25"
                keyboardType="numeric"
                value={logement.surface}
                onChangeText={(text) => setLogement({...logement, surface: text})}
              />
            </View>
          </View>

          <View style={modalStyles.formGroup}>
            <Text style={modalStyles.label}>Équipements</Text>
            <View style={modalStyles.equipementsContainer}>
              {equipementsList.map(equip => (
                <TouchableOpacity
                  key={equip}
                  style={[
                    modalStyles.equipement,
                    logement.equipements.includes(equip) && modalStyles.equipementSelected
                  ]}
                  onPress={() => toggleEquipement(equip)}
                >
                  <Text style={[
                    modalStyles.equipementText,
                    logement.equipements.includes(equip) && modalStyles.equipementTextSelected
                  ]}>
                    {equip}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={modalStyles.formGroup}>
            <View style={modalStyles.switchContainer}>
              <Text style={modalStyles.label}>Disponible à la location</Text>
              <Switch
                value={logement.disponible}
                onValueChange={(value) => setLogement({...logement, disponible: value})}
                trackColor={{ false: "#ccc", true: "#FCAF03" }}
                thumbColor={logement.disponible ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>
        </ScrollView>

        <View style={modalStyles.actionButtons}>
          <TouchableOpacity 
            style={modalStyles.cancelButton} 
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={modalStyles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={modalStyles.submitButton} 
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={modalStyles.submitButtonText}>{submitText}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  container: { 
    flex: 1, 
    backgroundColor: "#f5f5f5" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f3865',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#FCAF03',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listHeader: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  noImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: 'rgba(31, 56, 101, 0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f3865',
    marginBottom: 8,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLocationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FCAF03',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f3865',
    marginLeft: 4,
  },
  surfaceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff8e6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  surfaceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FCAF03',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCAF03',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  emptyButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Styles pour la navbar avec 4 boutons
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

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f3865",
  },
  scrollView: {
    maxHeight: 500,
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  option: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  optionSelected: {
    backgroundColor: "#FCAF03",
    borderColor: "#FCAF03",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
  },
  optionTextSelected: {
    color: "#000",
    fontWeight: "600",
  },
  equipementsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  equipement: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  equipementSelected: {
    backgroundColor: "#e8f0fe",
    borderColor: "#1f3865",
  },
  equipementText: {
    fontSize: 14,
    color: "#666",
  },
  equipementTextSelected: {
    color: "#1f3865",
    fontWeight: "600",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    alignItems: "center",
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#FCAF03",
  },
  submitButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
    marginLeft: 8,
  },
});

export default MyAds;