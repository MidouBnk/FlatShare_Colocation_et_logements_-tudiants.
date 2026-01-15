// app/components/FilterModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Switch
} from "react-native";
import { Ionicons } from '@expo/vector-icons';

const villes = ["Alger", "Oran", "Constantine", "Annaba", "Sétif", "Blida", "Tlemcen"];
const types = ["studio", "appartement", "colocation"];
const equipements = ["WiFi", "Meublé", "Climatisation", "Machine à laver", "Cuisine équipée"];

const FilterModal = ({ visible, onClose, onApply }) => {
  const [filters, setFilters] = useState({
    ville: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    equipements: [],
    disponibleOnly: false
  });

  const toggleEquipement = (equip) => {
    setFilters(prev => ({
      ...prev,
      equipements: prev.equipements.includes(equip)
        ? prev.equipements.filter(e => e !== equip)
        : [...prev.equipements, equip]
    }));
  };

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({
      ville: "",
      type: "",
      minPrice: "",
      maxPrice: "",
      equipements: [],
      disponibleOnly: false
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtres</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1f3865" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Ville */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ville</Text>
              <View style={styles.optionsContainer}>
                {villes.map(ville => (
                  <TouchableOpacity
                    key={ville}
                    style={[
                      styles.option,
                      filters.ville === ville && styles.optionSelected
                    ]}
                    onPress={() => setFilters({...filters, ville})}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.ville === ville && styles.optionTextSelected
                    ]}>
                      {ville}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Type de logement</Text>
              <View style={styles.optionsContainer}>
                {types.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.option,
                      filters.type === type && styles.optionSelected
                    ]}
                    onPress={() => setFilters({...filters, type})}
                  >
                    <Text style={[
                      styles.optionText,
                      filters.type === type && styles.optionTextSelected
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Prix */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Prix (DA/mois)</Text>
              <View style={styles.priceContainer}>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Minimum</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    keyboardType="numeric"
                    value={filters.minPrice}
                    onChangeText={(text) => setFilters({...filters, minPrice: text})}
                  />
                </View>
                <View style={styles.priceSeparator}>
                  <Text>-</Text>
                </View>
                <View style={styles.priceInput}>
                  <Text style={styles.priceLabel}>Maximum</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="30000"
                    keyboardType="numeric"
                    value={filters.maxPrice}
                    onChangeText={(text) => setFilters({...filters, maxPrice: text})}
                  />
                </View>
              </View>
            </View>

            {/* Équipements */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Équipements</Text>
              <View style={styles.equipementsContainer}>
                {equipements.map(equip => (
                  <TouchableOpacity
                    key={equip}
                    style={[
                      styles.equipement,
                      filters.equipements.includes(equip) && styles.equipementSelected
                    ]}
                    onPress={() => toggleEquipement(equip)}
                  >
                    <Text style={[
                      styles.equipementText,
                      filters.equipements.includes(equip) && styles.equipementTextSelected
                    ]}>
                      {equip}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Disponibilité */}
            <View style={styles.section}>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Disponible seulement</Text>
                <Switch
                  value={filters.disponibleOnly}
                  onValueChange={(value) => setFilters({...filters, disponibleOnly: value})}
                  trackColor={{ false: "#ccc", true: "#FCAF03" }}
                  thumbColor={filters.disponibleOnly ? "#fff" : "#f4f3f4"}
                />
              </View>
            </View>
          </ScrollView>

          {/* Boutons d'action */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
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
    maxHeight: 400,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  priceSeparator: {
    paddingHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
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
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  resetButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    alignItems: "center",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#FCAF03",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
  },
});

export default FilterModal;