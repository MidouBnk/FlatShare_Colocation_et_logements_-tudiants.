// app/components/LogementDetail.js - COMPLETE FIXED VERSION
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Dimensions,
  SafeAreaView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function LogementDetail({ logement, onBack }) {
  const [currentImage, setCurrentImage] = useState(0);

  if (!logement) {
    return (
      <View style={styles.noLogement}>
        <Ionicons name="home-outline" size={60} color="#ccc" />
        <Text style={styles.noLogementText}>Aucun logement sélectionné</Text>
        <TouchableOpacity style={styles.backButtonEmpty} onPress={onBack}>
          <Ionicons name="arrow-back" size={20} color="#1f3865" />
          <Text style={styles.backTextEmpty}>Retour à la liste</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleContact = () => {
    Alert.alert(
      "Contacter le propriétaire",
      `Voulez-vous contacter ${logement.proprietaire || "le propriétaire"} ?`,
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Envoyer un email", 
          onPress: () => {
            if (logement.proprietaire) {
              Linking.openURL(`mailto:${logement.proprietaire}`)
                .catch(() => alert("Impossible d'ouvrir l'application email"));
            } else {
              alert("Email du propriétaire non disponible");
            }
          }
        },
        { 
          text: "Appeler", 
          onPress: () => {
            // Vous pouvez ajouter un numéro de téléphone si disponible
            Alert.prompt(
              "Numéro de téléphone",
              "Entrez le numéro de téléphone :",
              [
                { text: "Annuler", style: "cancel" },
                { 
                  text: "Appeler", 
                  onPress: (phone) => {
                    if (phone) {
                      Linking.openURL(`tel:${phone}`)
                        .catch(() => alert("Impossible de composer le numéro"));
                    }
                  }
                }
              ],
              'plain-text',
              '0551234567' // Numéro par défaut
            );
          }
        }
      ]
    );
  };

  const handleReserve = () => {
    Alert.alert(
      "Réservation",
      "Voulez-vous réserver ce logement ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Réserver", 
          onPress: () => {
            Alert.alert(
              "Demande envoyée",
              "Votre demande de réservation a été envoyée au propriétaire. Vous serez contacté prochainement.",
              [{ text: "OK" }]
            );
          }
        }
      ]
    );
  };

  // Gérer l'image
  const imageUri = logement.photos && logement.photos[0] 
    ? (logement.photos[0].startsWith('data:') || logement.photos[0].startsWith('http') 
        ? logement.photos[0] 
        : `https://example.com/${logement.photos[0]}`)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image du logement */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.mainImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="home" size={60} color="#ddd" />
              <Text style={styles.noImageText}>Pas de photo disponible</Text>
            </View>
          )}
          
        </View>

        {/* Informations principales */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>
              {logement.titre || "Sans titre"}
            </Text>
            <Text style={styles.price}>
              {logement.prix ? `${logement.prix.toLocaleString()} DA` : "Prix non indiqué"}
              <Text style={styles.perMonth}>/mois</Text>
            </Text>
          </View>

          {/* Localisation */}
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.locationText} numberOfLines={2}>
              {logement.ville || "Ville inconnue"} • {logement.quartier || "Quartier inconnu"}
            </Text>
          </View>

          {/* Badges d'information */}
          <View style={styles.badgesContainer}>
            <View style={[
              styles.badge,
              { backgroundColor: logement.disponible ? '#e6f7e6' : '#ffe6e6' }
            ]}>
              <Ionicons 
                name={logement.disponible ? "checkmark-circle" : "close-circle"} 
                size={14} 
                color={logement.disponible ? '#4CAF50' : '#F44336'} 
              />
              <Text style={[
                styles.badgeText,
                { color: logement.disponible ? '#4CAF50' : '#F44336' }
              ]}>
                {logement.disponible ? 'Disponible' : 'Non disponible'}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: '#e8f0fe' }]}>
              <Ionicons name="home-outline" size={14} color="#1f3865" />
              <Text style={[styles.badgeText, { color: '#1f3865' }]}>
                {logement.type ? logement.type.toUpperCase() : 'N/A'}
              </Text>
            </View>

            <View style={[styles.badge, { backgroundColor: '#fff8e6' }]}>
              <Ionicons name="expand-outline" size={14} color="#FCAF03" />
              <Text style={[styles.badgeText, { color: '#FCAF03' }]}>
                {logement.surface ? `${logement.surface} m²` : 'Surface N/A'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {logement.description || "Pas de description disponible pour ce logement."}
            </Text>
          </View>

          {/* Équipements */}
          {logement.equipements && logement.equipements.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Équipements inclus</Text>
              <View style={styles.equipmentsGrid}>
                {logement.equipements.map((equip, index) => (
                  <View key={index} style={styles.equipmentItem}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                    <Text style={styles.equipmentText}>{equip}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Informations de contact */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <View style={styles.contactCard}>
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={20} color="#1f3865" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email du propriétaire</Text>
                  <Text style={styles.contactValue} numberOfLines={1}>
                    {logement.proprietaire || "Non disponible"}
                  </Text>
                </View>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.contactItem}>
                <Ionicons name="person-outline" size={20} color="#1f3865" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Propriétaire</Text>
                  <Text style={styles.contactValue}>
                    {logement.proprietaire ? logement.proprietaire.split('@')[0] : "Inconnu"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.contactButton} 
              onPress={handleContact}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
              <Text style={styles.buttonText}>Contacter</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.reserveButton, 
                !logement.disponible && styles.reserveButtonDisabled
              ]}
              onPress={logement.disponible ? handleReserve : null}
              disabled={!logement.disponible}
            >
              <Ionicons 
                name={logement.disponible ? "calendar-outline" : "calendar"} 
                size={22} 
                color={logement.disponible ? "#fff" : "#999"} 
              />
              <Text style={[
                styles.buttonText,
                !logement.disponible && { color: '#999' }
              ]}>
                {logement.disponible ? 'Réserver une visite' : 'Indisponible'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Note importante */}
          <View style={styles.noteSection}>
            <Ionicons name="information-circle-outline" size={18} color="#666" />
            <Text style={styles.noteText}>
              Pour votre sécurité, rencontrez toujours les propriétaires dans un lieu public
              et ne versez jamais d'argent avant d'avoir visité le logement.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  noLogement: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  noLogementText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 30,
  },
  backButtonEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backTextEmpty: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1f3865',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#1f3865',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f3865',
  },
  shareButton: {
    padding: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: 280,
    backgroundColor: '#f0f0f0',
  },
  noImage: {
    width: width,
    height: 280,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f3865',
    marginRight: 10,
    lineHeight: 30,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FCAF03',
    textAlign: 'right',
  },
  perMonth: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'normal',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f3865',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    textAlign: 'justify',
  },
  equipmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
  },
  equipmentText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#444',
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  actionSection: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f3865',
    padding: 16,
    borderRadius: 12,
    marginRight: 10,
  },
  reserveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCAF03',
    padding: 16,
    borderRadius: 12,
  },
  reserveButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  noteSection: {
    flexDirection: 'row',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1f3865',
    marginTop: 10,
  },
  noteText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});