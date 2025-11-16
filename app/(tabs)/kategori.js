import React, { useEffect, useState } from "react";
import { Alert, FlatList } from "react-native";
import {
  Box,
  Text,
  Input,
  InputField,
  Pressable,
  VStack,
  HStack,
  FormControl,
} from "@gluestack-ui/themed";

// Database
import { db } from "../../data/database";

// Icons
import DeleteIcon from "../../assets/delete.svg";

export default function Kategori() {
  const [name, setName] = useState(""); // untuk kasih Nama
  const [icon, setIcon] = useState(""); // untuk bisa pakai Icon untuk kategori
  const [categories, setCategories] = useState([]); // untuk kasih masuk ke Database
  const [editingId, setEditingId] = useState(null); // untuk ubah Data Kategori
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // untuk highlight Row ketika di pencet

  useEffect(() => {
    loadCategories();
  }, []);

  // Tampilin kategories dari Database
  function loadCategories() {
    const rows = db.getAllSync("SELECT * FROM categories ORDER BY id DESC");
    setCategories(rows);
  }

  // Ubah data Kategori
  function addOrUpdateCategory() {
    if (!name.trim() || !icon.trim()) return;

    if (editingId) {
      db.runSync(
        "UPDATE categories SET name = ?, icon = ? WHERE id = ?",
        name.trim(),
        icon,
        editingId
      );
    } else {
      db.runSync(
        "INSERT INTO categories (name, icon) VALUES (?, ?)",
        name.trim(),
        icon
      );
    }

    setName("");
    setIcon("");
    setEditingId(null);
    loadCategories();
  }

  // Untuk konfirmasi hapus
  function deleteCategory(id) {
    Alert.alert("Hapus Kategori", "Yakin ingin menghapus kategori ini?", [
      { text: "Batal", style: "cancel" },
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

  // Untuk highlight Kategori Row ketika di pencet
  function toggleCategorySelection(cat) {
    if (selectedCategoryId === cat.id) {
      setSelectedCategoryId(null);
      setName("");
      setIcon("");
      setEditingId(null);
    } else {
      setSelectedCategoryId(cat.id);
      setName(cat.name);
      setIcon(cat.icon);
      setEditingId(cat.id);
    }
  }

  return (
    <Box flex={1} p="$6">
      <Text fontSize="$4xl" fontWeight="700" textAlign="center" mb="$4">
        Kategori
      </Text>

      <VStack space={12}>
        <FormControl mb="$4">
          <HStack alignItems="center" space={4} mb="$4">
            <Text fontWeight="600">Icon Kategori: </Text>
            <Box flex={1}>
              <Input borderRadius="$full">
                <InputField
                  placeholder="Masukkan emoji untuk Icon"
                  value={icon}
                  onChangeText={setIcon}
                  maxLength={2}
                />
              </Input>
            </Box>
          </HStack>
          <HStack alignItems="center" space={4}>
            <Text fontWeight="600">Nama Kategori: </Text>
            <Box flex={1}>
              <Input borderRadius="$full">
                <InputField
                  placeholder="Nama kategori"
                  value={name}
                  onChangeText={setName}
                />
              </Input>
            </Box>
          </HStack>
        </FormControl>

        {/* Add or Update */}
        <Pressable
          mb="$2"
          bg="$blue500"
          py="$3"
          borderRadius="$full"
          alignItems="center"
          onPress={addOrUpdateCategory}
        >
          <Text color="$white" fontWeight="700">
            {editingId ? "Update Kategori" : "Tambah Kategori"}
          </Text>
        </Pressable>
      </VStack>

      {/* Category List */}
      <Text fontSize="$lg" fontWeight="700" mb="$2">
        Daftar Kategori
      </Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = item.id === selectedCategoryId;

          return (
            <Pressable onPress={() => toggleCategorySelection(item)} mt="$3">
              <Box borderRadius="$full" borderWidth={1} overflow="hidden">
                <HStack
                  alignItems="center"
                  p="$3"
                  space={8}
                  bg={isSelected ? "$blue100" : "$white"}
                >
                  <Text fontSize="$2xl">{item.icon}</Text>
                  <Text fontSize="$lg" flex={1}>
                    {item.name}
                  </Text>

                  <HStack space={4}>
                    <Pressable onPress={() => deleteCategory(item.id)} p="$2">
                      <DeleteIcon width={24} height={24} />
                    </Pressable>
                  </HStack>
                </HStack>
              </Box>
            </Pressable>
          );
        }}
      />
    </Box>
  );
}
