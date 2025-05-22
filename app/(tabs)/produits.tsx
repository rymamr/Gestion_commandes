import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Card, Button, IconButton, TextInput, Dialog, Portal, Provider, Text, Snackbar } from "react-native-paper";
import axios from "axios";

interface Produit {
  codeProduit: string;
  designation: string;
  suite: string;
  prixAchatHT: number;
  totalHT: number;
  TVA: number; 
}

const API_URL = "http://192.168.1.13/gestion_commandes_api";

const ProduitsScreen = () => {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [codeProduit, setCodeProduit] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [suite, setSuite] = useState<string>("");
  const [prixAchatHT, setPrixAchatHT] = useState<string>("");
  const [totalHT, setTotalHT] = useState<string>("");
  const [TVA, setTVA] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [confirmationVisible, setConfirmationVisible] = useState<boolean>(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [actionType, setActionType] = useState<"delete" | "edit">("delete");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = useCallback(async () => {
    try {
      const response = await axios.get<Produit[]>(`${API_URL}/produits.php`);
      setProduits(response.data);
    } catch (error) {
      showSnackbar("Erreur : Impossible de récupérer les produits.");
    }
  }, []);

  const showConfirmationDialog = (produit: Produit, type: "delete" | "edit") => {
    setSelectedProduit(produit);
    setActionType(type);
    setConfirmationVisible(true);
  };

  const handleConfirmedAction = () => {
    if (!selectedProduit) return;
    if (actionType === "delete") {
      handleDeleteProduit(selectedProduit.codeProduit);
    } else {
      setCodeProduit(selectedProduit.codeProduit);
      setDesignation(selectedProduit.designation);
      setSuite(selectedProduit.suite);
      setPrixAchatHT(selectedProduit.prixAchatHT.toString());
      setTotalHT(selectedProduit.totalHT.toString());
      setTVA(selectedProduit.TVA.toString());
      setEditing(true);
      setVisible(true);
    }
    setConfirmationVisible(false);
  };

  const handleAddOrUpdateProduit = async () => {
    if (!codeProduit || !designation || !prixAchatHT || !totalHT || !TVA) {
      showSnackbar("Erreur : Veuillez remplir tous les champs !");
      return;
    }

    const url = editing 
      ? `${API_URL}/modifier_produit.php`
      : `${API_URL}/ajouter_produit.php`;

    try {
      const response = await axios.post(url, { 
        codeProduit, 
        designation, 
        suite, 
        prixAchatHT: parseFloat(prixAchatHT), 
        totalHT: parseFloat(totalHT), 
        TVA: parseFloat(TVA) 
      });

      if (response.data.success) {
        showSnackbar(editing ? "Produit modifié avec succès !" : "Produit ajouté avec succès !");
        fetchProduits();
        setVisible(false);
        resetForm();
      }
    } catch (error) {
      showSnackbar("Erreur : Une erreur s'est produite.");
    }
  };

  const handleDeleteProduit = async (codeProduit: string) => {
    try {
      const response = await axios.post(`${API_URL}/supp_produit.php`, { codeProduit });
      
      if (response.data.success) {
        setProduits(prev => prev.filter(p => p.codeProduit !== codeProduit));
        showSnackbar("Produit supprimé avec succès !");
      }
    } catch (error) {
      showSnackbar("Erreur : Échec de la suppression.");
    }
  };

  const resetForm = () => {
    setCodeProduit("");
    setDesignation("");
    setSuite("");
    setPrixAchatHT("");
    setTotalHT("");
    setTVA("");
    setEditing(false);
  };

  return (
    <Provider>
      <View style={styles.container}>
        <FlatList
          data={produits}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title title={item.designation} subtitle={`Prix: ${item.totalHT} DA HT, TVA: ${item.TVA}%`} />
              <Card.Actions>
                <IconButton icon="pencil" iconColor="blue" onPress={() => showConfirmationDialog(item, "edit")} />
                <IconButton icon="delete" iconColor="red" onPress={() => showConfirmationDialog(item, "delete")} />
              </Card.Actions>
            </Card>
          )}
        />

        <Button mode="contained" style={styles.addButton} onPress={() => { resetForm(); setVisible(true); }}>
          Ajouter un produit
        </Button>

        {/* Snackbar */}
        <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}>
          {snackbarMessage}
        </Snackbar>

        {/* Dialogues */}
        <Portal>
          <Dialog visible={confirmationVisible} onDismiss={() => setConfirmationVisible(false)}>
            <Dialog.Title>{actionType === "delete" ? "Confirmer la suppression" : "Confirmer la modification"}</Dialog.Title>
            <Dialog.Content>
              <Text>
                {actionType === "delete" 
                  ? `Êtes-vous sûr de vouloir supprimer ${selectedProduit?.designation} ?`
                  : `Voulez-vous modifier ${selectedProduit?.designation} ?`}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmationVisible(false)}>Annuler</Button>
              <Button onPress={handleConfirmedAction}>Confirmer</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>{editing ? "Modifier un produit" : "Nouveau produit"}</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Code Produit" value={codeProduit} onChangeText={setCodeProduit} disabled={editing} style={styles.input} />
              <TextInput label="Désignation" value={designation} onChangeText={setDesignation} style={styles.input} />
              <TextInput label="Suite" value={suite} onChangeText={setSuite} style={styles.input} />
              <TextInput label="Prix Achat HT" value={prixAchatHT} onChangeText={setPrixAchatHT} keyboardType="numeric" style={styles.input} />
              <TextInput label="Total HT" value={totalHT} onChangeText={setTotalHT} keyboardType="numeric" style={styles.input} />
              <TextInput label="TVA" value={TVA} onChangeText={setTVA} keyboardType="numeric" style={styles.input} />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Annuler</Button>
              <Button onPress={handleAddOrUpdateProduit}>Valider</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginVertical: 8, elevation: 4 },
  addButton: { marginTop: 16 },
  input: { marginVertical: 8 },
});

export default ProduitsScreen; 
