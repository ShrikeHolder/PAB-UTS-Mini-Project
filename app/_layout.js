// app/_layout.js
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDatabase } from "../data/database";
import { GluestackUIProvider } from "@gluestack-ui/themed";

import config from "../gluestack.config";
export default function RootLayout() {
  useEffect(() => {
    initDatabase();
  }, []);

  return (
    <GluestackUIProvider config={config}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
