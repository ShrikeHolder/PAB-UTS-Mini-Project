import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "../data/database";

// Icons
import EditIcon from "../assets/edit.svg";
import DeleteIcon from "../assets/delete.svg";

const ICONS = ["📦", "🍔", "🛒", "💡", "🚗", "🎁"];

export default function Kategori() {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null); // Track editing category

  function loadCategories() {
    const rows = db.getAllSync("SELECT * FROM categories ORDER BY id DESC");
    setCategories(rows);
  }

  function addOrUpdateCategory() {
    if (!name.trim()) return;

    if (editingId) {
      db.runSync(
        "UPDATE categories SET name = ?, icon = ? WHERE id = ?",
        name.trim(),
        selectedIcon,
        editingId
      );
    } else {
      db.runSync(
        "INSERT INTO categories (name, icon) VALUES (?, ?)",
        name.trim(),
        selectedIcon
      );
    }

    setName("");
    setSelectedIcon(ICONS[0]);
    setEditingId(null);
    loadCategories();
  }

  // Untuk konfirmasi hapus
  function deleteCategory(id) {
    Alert.alert("Hapus Kategori", "Yakin ingin menghapus kategori ini?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          db.runSync("DELETE FROM categories WHERE id = ?", id);
          loadCategories();
        },
      },
    ]);
  }

  function editCategory(cat) {
    setName(cat.name);
    setSelectedIcon(cat.icon);
    setEditingId(cat.id);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kategori</Text>

      {/* Name input */}
      <TextInput
        style={styles.input}
        placeholder="Nama kategori"
        value={name}
        onChangeText={setName}
      />

      {/* Icon picker dropdown */}
      <Text style={styles.label}>Pilih Icon:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedIcon}
          onValueChange={(itemValue) => setSelectedIcon(itemValue)}
        >
          {ICONS.map((ic) => (
            <Picker.Item key={ic} label={`${ic} ${ic}`} value={ic} />
          ))}
        </Picker>
      </View>

      {/* Add / Update button */}
      <TouchableOpacity style={styles.primary} onPress={addOrUpdateCategory}>
        <Text style={styles.primaryText}>
          {editingId ? "Update Kategori" : "Tambah Kategori"}
        </Text>
      </TouchableOpacity>

      {/* Categories list */}
      <Text style={styles.subtitle}>Daftar Kategori</Text>
      <FlatList
        data={categories}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={styles.itemName}>{item.name}</Text>

            {/* Edit & Delete */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => editCategory(item)}
                style={styles.iconBtn}
              >
                <EditIcon width={24} height={24} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteCategory(item.id)}
                style={styles.iconBtn}
              >
                <DeleteIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
    width: "100%",
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 12,
  },
  label: { marginTop: 12, fontWeight: "600" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 8,
  },
  primary: {
    backgroundColor: "#2f80ed",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  subtitle: { marginTop: 20, fontSize: 18, fontWeight: "700" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginTop: 10,
  },
  itemIcon: { fontSize: 24, marginRight: 12 },
  itemName: { fontSize: 18, flex: 1 },
  actionButtons: { flexDirection: "row" },
  iconBtn: { marginLeft: 8 },
});
