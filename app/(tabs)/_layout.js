import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Slot, useRouter, usePathname } from "expo-router";
import { Box, Pressable } from "@gluestack-ui/themed";

// Icons
import HomeIcon from "../../assets/home.svg";
import WalletIcon from "../../assets/wallet.svg";
import DashboardIcon from "../../assets/dashboard.svg";
import CalendarIcon from "../../assets/calendar.svg";
import CategoryIcon from "../../assets/category.svg";

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "home", path: "/home", Icon: HomeIcon },
    { name: "dompet", path: "/dompet", Icon: WalletIcon },
    { name: "kalender", path: "/kalender", Icon: CalendarIcon },
    { name: "dashboard", path: "/dashboard", Icon: DashboardIcon },
    { name: "kategori", path: "/kategori", Icon: CategoryIcon },
  ];

  return (
    <SafeAreaProvider>
      <Box flex={1} alignItems="center">
        <Box flex={1} justifyContent="center" width="$full" maxWidth={960}>
          <Slot />
        </Box>

        <Box
          flexDirection="row"
          width="$full"
          justifyContent="space-around"
          alignItems="center"
          borderTopWidth={1}
          borderColor="$borderLight300"
          py="$3"
          px="$2"
          // p="$4"
          bg="$background"
          mb="$6"
        >
          {tabs.map((tab) => {
            const isActive = pathname.startsWith(tab.path);
            const Icon = tab.Icon;
            return (
              <Pressable
                key={tab.name}
                flex={1}
                alignItems="center"
                py="$2"
                bg={isActive ? "$blue100" : "transparent"}
                onPress={() => router.replace(tab.path)}
                accessibilityLabel={`Tab ${tab.name}`}
                _pressed={{ opacity: 0.6 }}
              >
                <Icon
                  width={28}
                  height={28}
                  fill={isActive ? "#2f80ed" : "#666"}
                />
              </Pressable>
            );
          })}
        </Box>
      </Box>
    </SafeAreaProvider>
  );
}
