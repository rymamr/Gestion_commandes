import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, Alert, StyleSheet, ScrollView } from "react-native";
import { Card, Button, TextInput, Checkbox, Dialog, Portal, Provider, Text } from "react-native-paper";
import axios from "axios";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";

const API_URL = "http://192.168.1.13/gestion_commandes_api/";

interface Produit {
  codeProduit: string;
  designation: string;
  totalHT: number;
}

interface SelectedProduct {
  quantite: number;
  prixUnitaireHT: number; 
  TVA: number;
}

const nouvelleProforma = () => {
  const [codeClient, setCodeClient] = useState<string>("");
  const [dateProforma] = useState(new Date());
  const [produits, setProduits] = useState<Produit[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, SelectedProduct>>({});
  const [visible, setVisible] = useState<boolean>(false);
  const [confirmationVisible, setConfirmationVisible] = useState<boolean>(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ codeClient?: string }>();

  useEffect(() => {
    const codeClientParam = params.codeClient;
    if (codeClientParam) {
      setCodeClient(codeClientParam);
    }
    fetchProduits();
  }, [params.codeClient]);

  const fetchProduits = useCallback(async () => {
    try {
      const response = await axios.get<Produit[]>(`${API_URL}/produits.php`);
      setProduits(response.data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer les produits.");
    }
  }, []);

  const handleToggleProduct = (codeProduit: string, prixUnitaireHT: number) => {
    setSelectedProducts((prev: Record<string, SelectedProduct>) => {
      const newSelection = { ...prev };
      if (newSelection[codeProduit]) {
        delete newSelection[codeProduit]; // Retirer si déjà sélectionné
      } else {
        newSelection[codeProduit] = { quantite: 0, prixUnitaireHT, TVA: 19.00};
      }
      return newSelection;
    });
  };

  const handleChangeQuantity = (codeProduit: string, text: string) => {
    setSelectedProducts((prev: Record<string, SelectedProduct>) => ({
      ...prev,
      [codeProduit]: { 
        ...prev[codeProduit], 
        quantite: parseInt(text) || 0 
      },
    }));
  };

  const handleSubmitCommande = () => {
    if (!codeClient) {
      Alert.alert("Erreur", "Veuillez entrer un code client");
      return;
    }

    if (Object.keys(selectedProducts).length === 0) {
      Alert.alert("Erreur", "Veuillez sélectionner au moins un produit");
      return;
    }

    if (Object.values(selectedProducts).some((product) => product.quantite <= 0)) {
      Alert.alert("Erreur", "Veuillez spécifier une quantité positive pour chaque produit");
      return;
    }

    setConfirmationVisible(true);
  };

  const handleConfirmedAction = async () => {
    const commandeData = {
      codeClient,
      dateProforma: dateProforma.toISOString().split("T")[0],
      produits: Object.entries(selectedProducts).map(([codeProduit, { quantite, prixUnitaireHT, TVA }]) => ({
        codeProduit,
        quantite,
        prixUnitaireHT,
        TVA,
      })),
    };
  
    try {
      const response = await axios.post(`${API_URL}ajouter_commande.php`, commandeData);
      
      if (response.data.success) {
        // Fermer le dialogue de confirmation
        setConfirmationVisible(false);
        
        // Réinitialiser le formulaire
        setSelectedProducts({});
        setCodeClient("");
  
        // Redirection immédiate sans alerte
        router.replace({
          pathname: "/commandes",
          params: { refresh: Date.now() } // Force le rafraîchissement
        });
      }
    } catch (error) {
      // Gestion d'erreur...
    }
  };
  
  return (
    <Provider>
      <ScrollView style={styles.container}>
        <TextInput
          label="Code Client"
          value={codeClient}
          editable={false}
        />

        <FlatList
          data={produits}
          keyExtractor={(item) => item.codeProduit}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title 
                title={item.designation} 
                subtitle={`Prix: ${item.totalHT}DA`} 
              />
              <Card.Actions>
                <Checkbox
                  status={selectedProducts[item.codeProduit] ? "checked" : "unchecked"}
                  onPress={() => handleToggleProduct(item.codeProduit, item.totalHT)}
                />
                {selectedProducts[item.codeProduit] && (
                  <TextInput
                    label="Quantité"
                    keyboardType="numeric"
                    style={{ width: 80 }}
                    value={selectedProducts[item.codeProduit]?.quantite.toString() || ""}
                    onChangeText={(text) => handleChangeQuantity(item.codeProduit, text)}
                  />
                )}
              </Card.Actions>
            </Card>
          )}
        />

        <Button mode="contained" onPress={handleSubmitCommande}>
          Valider la proforma
        </Button>

        {/* Dialogue de confirmation */}
        <Portal>
          <Dialog visible={confirmationVisible} onDismiss={() => setConfirmationVisible(false)}>
            <Dialog.Title>Confirmer la proforma</Dialog.Title>
            <Dialog.Content>
              <Text>Êtes-vous sûr de vouloir valider cette proforma ?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmationVisible(false)}>Annuler</Button>
              <Button onPress={handleConfirmedAction}>Confirmer</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </Provider>
  );
};
 
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 10, padding: 10 },
});

export default nouvelleProforma;