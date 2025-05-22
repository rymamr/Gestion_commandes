import React from "react";
import { Tabs, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/auth"; // Vérifie bien ce chemin

export default function ProtectedTabs() {
  const { isLoggedIn } = useAuth();  // Utilise le contexte pour savoir si l'utilisateur est connecté

  if (!isLoggedIn) {
    return <Redirect href="/(auth)" />;  // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
  }

  return ( 
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#fff",
          paddingBottom: 5,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: any;

          switch (route.name) {
            case "index":
              iconName = "home-outline";
              break;
            case "commandes":
              iconName = "cart-outline";
              break;
            case "clients":
              iconName = "people-outline";
              break;
            case "produits":
              iconName = "pricetag-outline";
              break;
            case "proformas":
              iconName = "cash-outline";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="clients" options={{ title: "Clients" }} />
      <Tabs.Screen name="produits" options={{ title: "Produits" }} />
      <Tabs.Screen name="commandes" options={{ title: "Commandes" }} />
      <Tabs.Screen name="proformas" options={{ title: "Proformas" }} />
    </Tabs>
  );
}
