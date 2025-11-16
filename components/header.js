import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

// Icon
import MenuIcon from "../assets/burger.svg";

const Header = ({ drawer, page }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => drawer.current.openDrawer()}>
        <MenuIcon width={24} height={24} />
      </TouchableOpacity>
      <Text style={styles.pageTitle}>{formatPageName(page)}</Text>
      <View style={{ width: 24 }} />
    </View>
  );
};

// State untuk muncul nama Halaman di ditengah Header
const formatPageName = (name) => {
  switch (name) {
    case "home":
      return "Home";
    case "wallet":
      return "Wallet";
    case "dashboard":
      return "Dashboard";
    case "calendar":
      return "Calendar";
    case "category":
      return "Category";
    default:
      return name.charAt(0).toUpperCase() + name.slice(1);
  }
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#6e6e6e",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default Header;
