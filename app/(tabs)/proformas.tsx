import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, Alert, StyleSheet, Platform, Text } from "react-native";
import { Card, Button, IconButton, TextInput, Dialog, Portal, Provider } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRouter } from "expo-router"; 
import { useLocalSearchParams } from "expo-router";


const API_URL = "http://192.168.1.13/gestion_commandes_api/";

interface Proforma {
  idProforma: number;  
  codeClient: string;
  dateProforma: string;
  totalHT: number;
  totalTTC: number;
  TVA: number;
}

const ProformasScreen = () => {
  const router = useRouter(); 
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [codeClient, setCodeClient] = useState("");
  const [dateProforma, setDateProforma] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [totalHT, setTotalHT] = useState("");
  const [totalTTC, setTotalTTC] = useState("");
  const [TVA, setTVA] = useState("");
  const [editing, setEditing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  
  const params = useLocalSearchParams();
  const [produitsSelectionnes, setProduitsSelectionnes] = useState<any[]>([]); // Initialisation vide
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchProformas();
  }, []);
  
  const fetchProformas = useCallback(async () => {
      try {
        const response = await axios.get<Proforma[]>(`${API_URL}proformas.php`);
        setProformas(response.data);
      } catch (error) {
        Alert.alert("Erreur", "Impossible de récupérer les commandes");
      }
    }, []);

  const handleAddOrUpdateProforma = async () => {
    if (!codeClient || !totalHT || !totalTTC || !TVA) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    const formattedDate = dateProforma.toISOString().split("T")[0];
    const url = editing ? `${API_URL}modifier_proforma.php` : `${API_URL}ajouter_proforma.php`;
    
    console.log("📩 Données envoyées à l'API :", {
      idCommande: currentId,
      codeClient,
      dateProforma: formattedDate,
      totalHT,
      totalTTC,
      TVA,
    });

    try {
      const response = await axios.post(url, {
        idProforma: currentId,
        codeClient,
        dateProforma: formattedDate,
        totalHT,
        totalTTC,
        TVA,
      });

      console.log("🔄 Réponse de l'API :", response.data);
          
            if (response.data.success) {
              fetchProformas(); // Mettre à jour la liste
              resetForm();
              
              // Fermer le dialogue après un court délai pour éviter les problèmes avec les alertes
              setTimeout(() => {
                setVisible(false);
              }, 100); // 100ms devraient suffire
              
              Alert.alert("Succès", editing ? "Proforma modifiée !" : "Proforma ajoutée !");
            } else {
              Alert.alert("Erreur", response.data.message || "Erreur inconnue");
            }
          } catch (error) {
            console.error("❌ Erreur Axios :", error);
            Alert.alert("Erreur", "Une erreur s'est produite, vérifiez la console."); 
          }
  };

  const handleDeleteProforma = async (idProforma: number) => {
    try {
      const response = await axios.post(`${API_URL}supp_proforma.php`, { idProforma });
      if (response.data.success) {
        Alert.alert("Succès", "Proforma supprimée");
        fetchProformas();
      } else {
        Alert.alert("Erreur", response.data.message || "Erreur inconnue");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer");
    }
  };

  const resetForm = () => {
    setCodeClient("");
    setDateProforma(new Date());
    setTotalHT("");
    setTotalTTC("");
    setTVA("");
    setEditing(false);
    setCurrentId(null);
  };

  return (
    <Provider>
      <View style={styles.container}>
        <FlatList
          data={proformas}
          keyExtractor={(item) => item.idProforma.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title 
                title={`Proforma #${item.idProforma}`} 
                subtitle={`Client: ${item.codeClient} - Date: ${item.dateProforma} - Total TTC: ${item.totalTTC} DA`}
              />
              <Card.Content>
                <Text>Total HT: {item.totalHT} DA</Text>
                <Text>Montant TVA: {item.TVA} DA</Text>
              </Card.Content> 
              <Card.Actions>
                <IconButton
                  icon="pencil"
                  iconColor="blue"
                  onPress={() => {
                    setCurrentId(item.idProforma);
                    setCodeClient(item.codeClient);
                    setDateProforma(new Date(item.dateProforma));
                    setTotalHT(item.totalHT.toString());
                    setTotalTTC(item.totalTTC.toString());
                    setTVA(item.TVA.toString());
                    setEditing(true);
                    setVisible(true);
                  }}
                />
                <IconButton icon="delete" iconColor="red" onPress={() => handleDeleteProforma(item.idProforma)} />
              </Card.Actions>
            </Card>
          )}
        />

        <Button mode="contained" onPress={() => { resetForm(); setVisible(true); }}>Demander une proforma</Button>
        
        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>{editing ? "Modifier une proforma" : "Demander une proforma"}</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Code Client" value={codeClient} onChangeText={setCodeClient} />
              <TextInput label="Total HT" value={totalHT} onChangeText={setTotalHT} keyboardType="numeric" />
              <TextInput label="Total TTC" value={totalTTC} onChangeText={setTotalTTC} keyboardType="numeric" />
              <TextInput label="Montant TVA" value={TVA} onChangeText={setTVA} keyboardType="numeric" />
              <Button mode="outlined" onPress={() => setShowDatePicker(true)}>{dateProforma.toLocaleDateString()}</Button>
              {showDatePicker && (
                <DateTimePicker
                  value={dateProforma} 
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setDateProforma(selectedDate);
                    }
                    setShowDatePicker(false);
                  }}
                />
              )}
              <Button mode="outlined" onPress={() => router.push(`/nouvelleProforma?codeClient=${codeClient}`)}>
               + Ajouter des produits
              </Button>

              {produitsSelectionnes.length > 0 && (
                <FlatList
                  data={produitsSelectionnes}
                  keyExtractor={(item) => item.codeProduit}
                  renderItem={({ item }) => (
                    <Card style={styles.card}>
                      <Card.Title title={item.designation} subtitle={`Quantité: ${item.quantite}`} />
                    </Card>
                  )}
                />
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Annuler</Button>
              <Button mode="contained" onPress={handleAddOrUpdateProforma}>Enregistrer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 10,
    padding: 10,
  },
});

export default ProformasScreen;
