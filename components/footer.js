import { View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";

// Icons
import HomeIcon from "../assets/home.svg";
import WalletIcon from "../assets/wallet.svg";
import DashboardIcon from "../assets/dashboard.svg";
import CalendarIcon from "../assets/calendar.svg";
import CategoryIcon from "../assets/category.svg";

const Footer = ({ changePage }) => {
  return (
    <View style={styles.footer}>
      <View style={styles.iconsView}>
        <TouchableOpacity onPress={() => changePage("home")}>
          <HomeIcon style={styles.iconSvg} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changePage("wallet")}>
          <WalletIcon style={styles.iconSvg} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changePage("dashboard")}>
          <DashboardIcon style={styles.iconSvg} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changePage("calendar")}>
          <CalendarIcon style={styles.iconSvg} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changePage("category")}>
          <CategoryIcon style={styles.iconSvg} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#e6e6e6",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  iconsView: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: width,
  },
  iconSvg: {
    width: 36,
    height: 24,
  },
});

export default Footer;
