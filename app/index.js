import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

// Screens
import Home from "./home";
import Dompet from "./dompet";
import Kalender from "./kalender";
import Dashboard from "./dashboard";
import Kategori from "./kategori";

// Icons
import HomeIcon from "../assets/home.svg";
import WalletIcon from "../assets/wallet.svg";
import DashboardIcon from "../assets/dashboard.svg";
import CalendarIcon from "../assets/calendar.svg";
import CategoryIcon from "../assets/category.svg";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.main}>
          {page === "dompet" && <Dompet />}
          {page === "kalender" && <Kalender />}
          {page === "dashboard" && <Dashboard />}
          {page === "kategori" && <Kategori />}
          {page === "home" && <Home navigation={setPage} />}
        </View>

        <SafeAreaView style={styles.nav} edges={["bottom"]}>
          <TouchableOpacity
            onPress={() => setPage("home")}
            style={[styles.navBtn, page === "home" && styles.navActive]}
          >
            <HomeIcon
              width={28}
              height={28}
              fill={page === "home" ? "#2f80ed" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPage("dompet")}
            style={[styles.navBtn, page === "dompet" && styles.navActive]}
          >
            <WalletIcon
              width={28}
              height={28}
              fill={page === "dompet" ? "#2f80ed" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPage("kalender")}
            style={[styles.navBtn, page === "kalender" && styles.navActive]}
          >
            <CalendarIcon
              width={28}
              height={28}
              fill={page === "kalender" ? "#2f80ed" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPage("dashboard")}
            style={[styles.navBtn, page === "dashboard" && styles.navActive]}
          >
            <DashboardIcon
              width={28}
              height={28}
              fill={page === "dashboard" ? "#2f80ed" : "#666"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setPage("kategori")}
            style={[styles.navBtn, page === "kategori" && styles.navActive]}
          >
            <CategoryIcon
              width={28}
              height={28}
              fill={page === "kategori" ? "#2f80ed" : "#666"}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
    width: "100%",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
  nav: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  navBtn: {
    flex: 1,
    alignItems: "center",
    padding: 12,
  },
  navActive: {
    backgroundColor: "#eef6ff",
  },
  navText: {
    color: "#666",
  },
  navTextActive: {
    color: "#2f80ed",
    fontWeight: "700",
  },
});
