import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, Alert, StyleSheet, Platform } from "react-native";
import { Card, Button, IconButton, TextInput, Dialog, Portal, Provider } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "axios";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";


const API_URL = "http://192.168.1.13/gestion_commandes_api/"; // Modifier selon l'IP de ton serveur

interface Commande { 
  idCommande: number;
  codeClient: string;
  dateCommande: string;
  totalHT: number;
  totalTTC: number;
  TVA: number;
}

const CommandesScreen = () => {
  const router = useRouter();
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [codeClient, setCodeClient] = useState("");
  const [dateCommande, setDateCommande] = useState(new Date());
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
    fetchCommandes();
  }, [refreshKey]);

  const fetchCommandes = useCallback(async () => {
    try {
      const response = await axios.get<Commande[]>(`${API_URL}commandes.php`);
      setCommandes(response.data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les commandes");
    }
  }, []);

  const handleAddOrUpdateCommande = async () => {
    console.log("✅ Bouton Enregistrer cliqué !");
    if (!codeClient || !totalHT || !totalTTC || !TVA) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }
  
    const formattedDate = dateCommande.toISOString().split("T")[0];
    const url = editing ? `${API_URL}modifier_commande.php` : `${API_URL}ajouter_commande.php`;
  
    console.log("📩 Données envoyées à l'API :", {
      idCommande: currentId,
      codeClient,
      dateCommande: formattedDate,
      totalHT,
      totalTTC,
      TVA,
    });
    
    try {
      const response = await axios.post(url, {
        idCommande: currentId,
        codeClient,
        dateCommande: formattedDate,
        totalHT,
        totalTTC,
        TVA,
      });
    
      console.log("🔄 Réponse de l'API :", response.data);
    
      if (response.data.success) {
        fetchCommandes(); // Mettre à jour la liste
        resetForm();
        
        // Fermer le dialogue après un court délai pour éviter les problèmes avec les alertes
        setTimeout(() => {
          setVisible(false);
        }, 100); // 100ms devraient suffire
        
        Alert.alert("Succès", editing ? "Commande modifiée !" : "Commande ajoutée !");
      } else {
        Alert.alert("Erreur", response.data.message || "Erreur inconnue");
      }
    } catch (error) {
      console.error("❌ Erreur Axios :", error);
      Alert.alert("Erreur", "Une erreur s'est produite, vérifiez la console.");
    }
  };
  
  
  const handleDeleteCommande = async (idCommande: number) => {
    try {
      const response = await axios.post(`${API_URL}supp_commande.php`, { idCommande });
      if (response.data.success) {
        Alert.alert("Succès", "Commande supprimée");
        fetchCommandes();
      } else {
        Alert.alert("Erreur", response.data.message || "Erreur inconnue");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer");
    }
  };

  const resetForm = () => {
    setCodeClient("");
    setDateCommande(new Date());
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
          data={commandes}
          keyExtractor={(item) => item.idCommande.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title title={`Commande #${item.idCommande}`} subtitle={`Date: ${item.dateCommande} - Total: ${item.totalTTC}DA`} />
              <Card.Actions>
              <Button
  mode="outlined"
  onPress={() => router.push(`/produitsCommande?idCommande=${item.idCommande}`)} 
>
  Voir les produits
</Button>
                <IconButton
                  icon="pencil"
                  iconColor="blue"
                  onPress={() => {
                    setCurrentId(item.idCommande);
                    setCodeClient(item.codeClient);
                    setDateCommande(new Date(item.dateCommande));
                    setTotalHT(item.totalHT.toString());
                    setTotalTTC(item.totalTTC.toString());
                    setTVA(item.TVA.toString());
                    setEditing(true);
                    setVisible(true);
                  }}
                />
                <IconButton icon="delete" iconColor="red" onPress={() => handleDeleteCommande(item.idCommande)} />
              </Card.Actions>
            </Card>
          )}
        />

        <Button mode="contained" onPress={() => { resetForm(); setVisible(true); }}>Faire une commande</Button>

        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>{editing ? "Modifier une commande" : "Faire une commande"}</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Code Client" value={codeClient} onChangeText={setCodeClient} />
              <TextInput label="Total HT" value={totalHT} onChangeText={setTotalHT} keyboardType="numeric" />
              <TextInput label="Total TTC" value={totalTTC} onChangeText={setTotalTTC} keyboardType="numeric" />
              <TextInput label="Montant TVA" value={TVA} onChangeText={setTVA} keyboardType="numeric" />
              <Button mode="outlined" onPress={() => setShowDatePicker(true)}>{dateCommande.toLocaleDateString()}</Button>
              {showDatePicker && (
                <DateTimePicker
                  value={dateCommande}
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setDateCommande(selectedDate);
                    }
                    setShowDatePicker(false);
                  }}
                />
              )}
              <Button mode="outlined" onPress={() => router.push(`/nouvelleCommande?codeClient=${codeClient}`)}>
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
              <Button mode="contained" onPress={handleAddOrUpdateCommande}>Enregistrer</Button>
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

export default CommandesScreen; 