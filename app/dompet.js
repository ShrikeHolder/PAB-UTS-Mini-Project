import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { db } from "../data/database";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";

// Icons
import EditIcon from "../assets/edit.svg";
import DeleteIcon from "../assets/delete.svg";
import AddIcon from "../assets/add.svg";
import SearchIcon from "../assets/search.svg";

export default function Dompet() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("in");

  // Untuk pemilihan tanggal
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Untuk bisa edit data
  const [editingId, setEditingId] = useState(null);

  // Untuk tampilin Modal
  const [modalVisible, setModalVisible] = useState(false);

  // Untuk filter tanggal
  const [searchDate, setSearchDate] = useState(null);
  const [showSearchDatePicker, setShowSearchDatePicker] = useState(false);

  // Data diambil dari kategori.js
  function loadCategories() {
    const rows = db.getAllSync("SELECT * FROM categories ORDER BY name ASC");
    setCategories(rows);
    if (rows.length > 0 && !selectedCategory) {
      setSelectedCategory(rows[0].id);
    }
  }

  function loadTransactions() {
    const rows = db.getAllSync(`
      SELECT t.*, c.name AS category_name, c.icon AS category_icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      ORDER BY t.id DESC
    `);
    setTransactions(rows);
  }

  function filterTransactionsByDate(date) {
    const rows = db.getAllSync(
      `
      SELECT t.*, c.name AS category_name, c.icon AS category_icon
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE date(t.date) = date(?)
      ORDER BY t.id DESC
    `,
      date.toISOString()
    );
    setTransactions(rows);
  }

  function resetTransactions() {
    setSearchDate(null);
    loadTransactions();
  }

  function openAddModal() {
    setEditingId(null);
    setAmount("");
    setDesc("");
    setSelectedDate(new Date());
    setType("in");
    setModalVisible(true);
  }

  function addOrUpdateTransaction() {
    const a = parseFloat(amount);
    if (!a || !selectedCategory) return;

    if (editingId) {
      db.runSync(
        "UPDATE transactions SET type=?, amount=?, desc=?, date=?, category_id=? WHERE id=?",
        type,
        a,
        desc.trim(),
        selectedDate.toISOString(),
        selectedCategory,
        editingId
      );
    } else {
      db.runSync(
        "INSERT INTO transactions (type, amount, desc, date, category_id) VALUES (?, ?, ?, ?, ?)",
        type,
        a,
        desc.trim(),
        selectedDate.toISOString(),
        selectedCategory
      );
    }

    setModalVisible(false);
    loadTransactions();
  }

  // Untuk konfirmasi hapus
  function deleteTransaction(id) {
    Alert.alert("Hapus Transaksi", "Yakin ingin menghapus transaksi ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          db.runSync("DELETE FROM transactions WHERE id=?", id);
          loadTransactions();
        },
      },
    ]);
  }

  function editTransaction(tx) {
    setEditingId(tx.id);
    setAmount(tx.amount.toString());
    setDesc(tx.desc);
    setType(tx.type);
    setSelectedCategory(tx.category_id);
    setSelectedDate(new Date(tx.date));
    setModalVisible(true);
  }

  useEffect(() => {
    loadCategories();
    loadTransactions();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dompet</Text>

      <View style={styles.historyRow}>
        <Text style={styles.subtitle}>Riwayat</Text>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => setShowSearchDatePicker(true)}
            style={{ marginRight: 12 }}
          >
            <SearchIcon width={26} height={26} />
          </TouchableOpacity>

          <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
            <AddIcon width={26} height={26} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Untuk cari transaksi sesuai tanggal & reset */}
      {searchDate && (
        <View style={{ marginTop: 10 }}>
          <Text>
            Menampilkan transaksi pada: {searchDate.toLocaleDateString()}
          </Text>
          <TouchableOpacity onPress={resetTransactions}>
            <Text style={{ color: "blue" }}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {showSearchDatePicker && (
        <DateTimePicker
          value={searchDate || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event, date) => {
            setShowSearchDatePicker(Platform.OS === "ios");
            if (date) {
              setSearchDate(date);
              filterTransactionsByDate(date);
            }
          }}
        />
      )}

      {/* Transactions List */}
      <FlatList
        data={transactions}
        keyExtractor={(i) => i.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tx}>
            <Text style={styles.txIcon}>{item.category_icon}</Text>

            <View style={{ flex: 1 }}>
              <Text style={styles.txText}>
                {item.desc || item.category_name}
              </Text>
              <Text style={styles.txDate}>
                {new Date(item.date).toLocaleDateString()}{" "}
                {new Date(item.date).toLocaleTimeString()}
              </Text>
            </View>

            <Text
              style={[
                styles.txAmount,
                item.type === "in" ? styles.in : styles.out,
              ]}
            >
              {item.type === "in" ? "+" : "-"} {item.amount}
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => editTransaction(item)}>
                <EditIcon width={24} height={24} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteTransaction(item.id)}
                style={{ marginLeft: 8 }}
              >
                <DeleteIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Modal */}
      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingId ? "Edit Transaksi" : "Tambah Transaksi"}
            </Text>

            <Text style={styles.label}>Jenis Transaksi</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                onPress={() => setType("in")}
                style={[
                  styles.typeBtn,
                  type === "in" && styles.typeBtnActiveIn,
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === "in" && styles.typeTextActive,
                  ]}
                >
                  Pemasukan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType("out")}
                style={[
                  styles.typeBtn,
                  type === "out" && styles.typeBtnActiveOut,
                ]}
              >
                <Text
                  style={[
                    styles.typeText,
                    type === "out" && styles.typeTextActive,
                  ]}
                >
                  Pengeluaran
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Tanggal</Text>
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Text>{selectedDate.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => {
                  setShowDatePicker(Platform.OS === "ios");
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            <Text style={styles.label}>Kategori</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCategory}
                onValueChange={(v) => setSelectedCategory(v)}
              >
                {categories.map((c) => (
                  <Picker.Item
                    key={c.id}
                    label={`${c.icon} ${c.name}`}
                    value={c.id}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Total Harga</Text>
            <TextInput
              placeholder="Jumlah (Rp)"
              keyboardType="numeric"
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.label}>Deskripsi Transaksi</Text>
            <TextInput
              placeholder="Deskripsi..."
              style={[styles.input, { textAlignVertical: "top" }]}
              value={desc}
              onChangeText={setDesc}
              multiline={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={addOrUpdateTransaction}
              >
                <Text style={{ color: "#fff" }}>
                  {editingId ? "Update" : "Simpan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  subtitle: { marginTop: 20, fontSize: 20, fontWeight: "700" },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 16,
  },
  addBtn: { padding: 6 },
  tx: {
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  txIcon: { fontSize: 24, marginRight: 10 },
  txText: { fontWeight: "700" },
  txDate: { color: "#666" },
  txAmount: { fontWeight: "700", marginLeft: 8 },
  in: { color: "green" },
  out: { color: "red" },
  actionButtons: { flexDirection: "row", marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 12 },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  typeRow: { flexDirection: "row", marginTop: 10, gap: 10 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
  },
  typeBtnActiveIn: { backgroundColor: "#d4f8d4", borderColor: "green" },
  typeBtnActiveOut: { backgroundColor: "#ffd4d4", borderColor: "red" },
  typeText: { fontWeight: "600" },
  typeTextActive: { color: "#000" },
  label: { marginTop: 12, fontWeight: "600" },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 6,
    overflow: "hidden",
  },
  input: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
  },
  dateBtn: {
    marginTop: 10,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    alignItems: "center",
  },
  modalButtons: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalBtn: { padding: 12, borderRadius: 6, marginLeft: 10 },
  cancelBtn: { backgroundColor: "#eee" },
  saveBtn: { backgroundColor: "#2f80ed" },
});
