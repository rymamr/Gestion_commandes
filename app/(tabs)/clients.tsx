import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Card, Button, IconButton, TextInput, Dialog, Portal, Provider, Text, Snackbar } from "react-native-paper";
import axios from "axios";

interface Client {
  codeClient: string;
  nomClient: string; 
  prenomClient: string;
  dateNaissance: string | null;
  email: string | null;
  telephone: string | null;
}

const API_URL = "http://192.168.1.13/gestion_commandes_api";

const ClientsScreen = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [codeClient, setCodeClient] = useState<string>("");
  const [nomClient, setNomClient] = useState<string>("");
  const [prenomClient, setPrenomClient] = useState<string>("");
  const [dateNaissance, setDateNaissance] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");
  const [editing, setEditing] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [confirmationVisible, setConfirmationVisible] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [actionType, setActionType] = useState<"delete" | "edit">("delete");
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = useCallback(async () => {
    try {
      const response = await axios.get<Client[]>(`${API_URL}/clients.php`);
      setClients(response.data);
    } catch (error) {
      showSnackbar("Erreur : Impossible de récupérer les clients.");
    }
  }, []);

  const showConfirmationDialog = (client: Client, type: "delete" | "edit") => {
    setSelectedClient(client);
    setActionType(type);
    setConfirmationVisible(true);
  };

  const handleConfirmedAction = () => {
    if (!selectedClient) return;
    if (actionType === "delete") {
      handleDeleteClient(selectedClient.codeClient);
    } else {
      setCodeClient(selectedClient.codeClient);
      setNomClient(selectedClient.nomClient);
      setPrenomClient(selectedClient.prenomClient);
      setDateNaissance(selectedClient.dateNaissance || "");
      setEmail(selectedClient.email || "");
      setTelephone(selectedClient.telephone || "");
      setEditing(true);
      setVisible(true);
    }
    setConfirmationVisible(false);
  };

  const handleAddOrUpdateClient = async () => {
    if (!codeClient || !nomClient || !prenomClient || !dateNaissance || !email || !telephone) {
      showSnackbar("Erreur : Veuillez remplir tous les champs !");
      return;
    }

    const url = editing 
      ? `${API_URL}/modifier_client.php`
      : `${API_URL}/ajouter_client.php`;

    try {
      const response = await axios.post(url, { codeClient, nomClient, prenomClient, dateNaissance, email, telephone, });
      
      if (response.data.success) {
        showSnackbar(editing ? "Client modifié avec succès !" : "Client ajouté avec succès !");
        fetchClients();
        setVisible(false);
        resetForm();
      }
    } catch (error) {
      showSnackbar("Erreur : Une erreur s'est produite.");
    }
  };

  const handleDeleteClient = async (clientCode: string) => {
    try {
      const response = await axios.post(`${API_URL}/supp_client.php`, { codeClient: clientCode });
      
      if (response.data.success) {
        setClients(prev => prev.filter(c => c.codeClient !== clientCode));
        showSnackbar("Client supprimé avec succès !");
      }
    } catch (error) {
      showSnackbar("Erreur : Échec de la suppression.");
    }
  };

  const resetForm = () => {
    setCodeClient("");
    setNomClient("");
    setPrenomClient("");
    setDateNaissance("");
    setEmail("");
    setTelephone("");
    setEditing(false);
  };

  return (
    <Provider>
      <View style={styles.container}>
        <FlatList
          data={clients}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title title={`${item.nomClient} ${item.prenomClient}`} subtitle={`Code: ${item.codeClient}`} />
              <Card.Actions>
                <IconButton icon="pencil" iconColor="blue" onPress={() => showConfirmationDialog(item, "edit")} />
                <IconButton icon="delete" iconColor="red" onPress={() => showConfirmationDialog(item, "delete")} />
              </Card.Actions>
            </Card>
          )}
        />

        <Button mode="contained" style={styles.addButton} onPress={() => { resetForm(); setVisible(true); }}>
          Ajouter un client
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
                  ? `Êtes-vous sûr de vouloir supprimer ${selectedClient?.nomClient} ?`
                  : `Voulez-vous modifier ${selectedClient?.nomClient} ?`}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setConfirmationVisible(false)}>Annuler</Button>
              <Button onPress={handleConfirmedAction}>Confirmer</Button>
            </Dialog.Actions>
          </Dialog>

          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>{editing ? "Modifier client" : "Nouveau client"}</Dialog.Title>
            <Dialog.Content>
              <TextInput label="Code Client" value={codeClient} onChangeText={setCodeClient} disabled={editing} style={styles.input} />
              <TextInput label="Nom Client" value={nomClient} onChangeText={setNomClient} style={styles.input} />
              <TextInput label="Prénom" value={prenomClient} onChangeText={setPrenomClient} style={styles.input} />
              <TextInput label="Date de naissance (YYYY-MM-DD)" value={dateNaissance} onChangeText={setDateNaissance} style={styles.input} />
              <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} keyboardType="email-address" />
              <TextInput label="Téléphone" value={telephone} onChangeText={setTelephone} style={styles.input} keyboardType="phone-pad" />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setVisible(false)}>Annuler</Button>
              <Button onPress={handleAddOrUpdateClient}>Valider</Button> 
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

export default ClientsScreen;