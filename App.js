import { useRef, useState } from "react";
import { View, DrawerLayoutAndroid, StatusBar, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Components
import Header from "./components/header";
import Footer from "./components/footer";
import Button from "./components/button";
import Separator from "./components/separator";

// Screens
import Home from "./screens/home";
import Wallet from "./screens/wallet";
import Dashboard from "./screens/dashboard";
import Calendar from "./screens/calendar";
import Category from "./screens/category";

const App = () => {
  const [page, setPage] = useState("home");
  const drawer = useRef(null);

  const changePage = (drawer, pageName) => {
    drawer.current.closeDrawer();
    setPage(pageName);
  };

  // Burger
  const navigationView = () => (
    <View style={{ padding: 30, backgroundColor: "#222222", flex: 1 }}>
      <Button text="Home" onPress={() => changePage(drawer, "home")} />
      <Separator height={30} />
      <Button text="Wallet" onPress={() => changePage(drawer, "wallet")} />
      <Separator height={30} />
      <Button
        text="Dashboard"
        onPress={() => changePage(drawer, "dashboard")}
      />
      <Separator height={30} />
      <Button text="Calendar" onPress={() => changePage(drawer, "calendar")} />
      <Separator height={30} />
      <Button text="Category" onPress={() => changePage(drawer, "category")} />
      <Separator height={30} />
      <Button text="Close" onPress={() => drawer.current.closeDrawer()} />
    </View>
  );

  // To show the page
  const renderPage = () => {
    switch (page) {
      case "home":
        return <Home />;
      case "wallet":
        return <Wallet />;
      case "dashboard":
        return <Dashboard />;
      case "calendar":
        return <Calendar />;
      case "category":
        return <Category />;
      default:
        return <Home />;
    }
  };

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={300}
      drawerPosition="left"
      renderNavigationView={navigationView}
    >
      <StatusBar style="light" backgroundColor="#AA0002" />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <Header drawer={drawer} page={page} />
        <View style={styles.content}>{renderPage()}</View>
        <Footer changePage={(pageName) => setPage(pageName)} />
      </SafeAreaView>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default App;
