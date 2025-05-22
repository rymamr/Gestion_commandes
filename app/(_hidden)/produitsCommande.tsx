import React, { useEffect, useState } from "react";
import { View, FlatList, Alert, StyleSheet, Text } from "react-native";
import { Card, Button, TextInput, Dialog, Portal, Provider, IconButton } from "react-native-paper";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";

const API_URL = "http://192.168.1.13/gestion_commandes_api/";

const params = useLocalSearchParams();
console.log("🟢 Params reçus dans ProduitsCommandeScreen :", params);

const idCommande = params?.idCommande;
console.log("🟢 idCommande extrait :", idCommande);

const ProduitsCommandeScreen = () => { 
  const { idCommande } = useLocalSearchParams(); // ✅ On récupère idCommande ici

  console.log("🟢 idCommande reçu :", idCommande); // 🔍 Vérifier dans la console 

  // ✅ Vérifie que idCommande est bien défini
  if (!idCommande) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>⚠️ Aucun ID de commande fourni</Text>
      </View>
    );
  }

  // ✅ Typage des produits
  const [produits, setProduits] = useState<
    { codeProduit: string; designation: string; quantite: number; prixUnitaireHT: number }[]
  >([]);
  const [codeProduit, setCodeProduit] = useState("");
  const [quantite, setQuantite] = useState("");
  const [prixUnitaireHT, setPrixUnitaireHT] = useState("");
  const [tva, setTVA] = useState("");

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchProduits();
  }, [idCommande]);

  const fetchProduits = async () => {
    try {
      console.log("🔵 Récupération des produits pour idCommande :", idCommande);
      
      const response = await axios.get(`${API_URL}commande_produit.php?idCommande=${idCommande}`);
  
      console.log("🟢 Réponse API Produits :", response.data);
  
      // Vérifie que data contient bien un tableau
      if (response.data.success && Array.isArray(response.data.data)) {
        setProduits(response.data.data);  // ⬅️ Correction ici
        console.log("✅ Produits enregistrés dans le state :", response.data.data);
      } else {
        console.error("❌ Structure inattendue :", response.data);
      }
    } catch (error) {
      console.error("❌ Erreur API :", error);
      Alert.alert("Erreur", "Impossible de récupérer les produits");
    }
  }; 

  const handleAddProduit = async () => {
    if (!codeProduit || !quantite || !prixUnitaireHT || !tva) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs !");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}commande_produit.php`, {
        idCommande,
        codeProduit,
        quantite: Number(quantite),
        prixUnitaireHT: Number(prixUnitaireHT),
        tva: Number(tva),
      });

      if (response.data.message) {
        Alert.alert("Succès", "Produit ajouté !");
        fetchProduits();
        setVisible(false);
      } else {
        Alert.alert("Erreur", response.data.error || "Erreur inconnue");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur s'est produite.");
    }
  };

  const handleDeleteProduit = async (codeProduit: string) => {
    try {
      const response = await axios.delete(`${API_URL}commande_produit.php`, {
        data: { idCommande, codeProduit },
      });

      if (response.data.message) {
        Alert.alert("Succès", "Produit supprimé !");
        fetchProduits();
      } else {
        Alert.alert("Erreur", response.data.error || "Erreur inconnue");
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de supprimer le produit.");
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
      <FlatList
  data={produits}
  keyExtractor={(item, index) => index.toString()} // 🔄 Corrige la clé si besoin
  renderItem={({ item }) => (
    <Card style={styles.card}>
      <Card.Title title={item.designation} subtitle={`Quantité: ${item.quantite} | Prix: ${item.prixUnitaireHT}DA`} /> 
      <Card.Actions>
        <IconButton icon="delete" iconColor="red" onPress={() => handleDeleteProduit(item.codeProduit)} />
      </Card.Actions>
    </Card>
  )}
/>
        <Button mode="contained" onPress={() => setVisible(true)}>
          Ajouter un produit
        </Button>

        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>Ajouter un produit</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Code du produit" value={codeProduit} onChangeText={setCodeProduit} />
              <TextInput label="Quantité" value={quantite} onChangeText={setQuantite} keyboardType="numeric" />
              <TextInput label="Prix Unitaire HT" value={prixUnitaireHT} onChangeText={setPrixUnitaireHT} keyboardType="numeric" />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Annuler</Button>
              <Button onPress={handleAddProduit}>Enregistrer</Button>
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
});

export default ProduitsCommandeScreen;