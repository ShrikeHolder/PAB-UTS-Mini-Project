import React, { useState } from "react";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Box, Pressable } from "@gluestack-ui/themed";
import Home from "./home";
import Dompet from "./dompet";
import Kalender from "./kalender";
import Dashboard from "./dashboard";
import Kategori from "./kategori";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <SafeAreaProvider>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <Box flex={1} alignItems="center">
          <Box flex={1} justifyContent="center" maxWidth={960} width="100%">
            {page === "dompet" && <Dompet />}
            {page === "kalender" && <Kalender />}
            {page === "dashboard" && <Dashboard />}
            {page === "kategori" && <Kategori />}
            {page === "home" && <Home navigation={setPage} />}
          </Box>
        </Box>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
