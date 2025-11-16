import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { getTransactionsByMonth } from "../data/queries";

export default function Kalender() {
  const today = new Date();
  const [current, setCurrent] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [monthlyTx, setMonthlyTx] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTotals, setSelectedTotals] = useState({ in: 0, out: 0 });
  const [modalVisible, setModalVisible] = useState(false);

  const year = current.getFullYear();
  const month = current.getMonth();

  // Load transactions when month changes
  useEffect(() => {
    const tx = getTransactionsByMonth(year, month);

    // Group transactions by dateKey: YYYY-MM-DD
    const grouped = {};
    tx.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });
    setMonthlyTx(grouped);
  }, [year, month]);

  function generateGrid() {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const totalCells = Math.ceil((firstDay + totalDays) / 7) * 7;

    const arr = [];
    for (let i = 0; i < totalCells; i++) {
      const day = i - firstDay + 1;
      arr.push(day >= 1 && day <= totalDays ? day : null);
    }
    return arr;
  }

  const grid = useMemo(generateGrid, [current, monthlyTx]);

  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const selectDate = (dateKey) => {
    setSelectedDate(dateKey);
    const tx = monthlyTx[dateKey] || [];
    const totalIn = tx
      .filter((t) => t.type === "in")
      .reduce((s, t) => s + t.amount, 0);
    const totalOut = tx
      .filter((t) => t.type === "out")
      .reduce((s, t) => s + t.amount, 0);
    setSelectedTotals({ in: totalIn, out: totalOut });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Kalender</Text>

      {/* Month Switcher */}
      <View style={styles.monthRow}>
        <TouchableOpacity
          onPress={() => setCurrent(new Date(year, month - 1, 1))}
        >
          <Text style={styles.arrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {current.toLocaleString("id-ID", { month: "long" })} {year}
        </Text>
        <TouchableOpacity
          onPress={() => setCurrent(new Date(year, month + 1, 1))}
        >
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid with Week Headers */}
      <View style={styles.grid}>
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, i) => (
          <View key={`h-${i}`} style={styles.headerCell}>
            <Text style={styles.weekDay}>{d}</Text>
          </View>
        ))}

        {grid.map((day, i) => {
          if (!day) return <View key={`d-${i}`} style={styles.emptyCell} />;

          const dateKey = `${year}-${String(month + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const tx = monthlyTx[dateKey] || [];

          const income = tx
            .filter((t) => t.type === "in")
            .reduce((s, t) => s + t.amount, 0);
          const expense = tx
            .filter((t) => t.type === "out")
            .reduce((s, t) => s + t.amount, 0);

          const isToday = dateKey === todayKey;

          return (
            <TouchableOpacity
              key={`d-${i}`}
              style={[
                styles.cell,
                isToday && styles.todayCell,
                selectedDate === dateKey && styles.selectedCell,
              ]}
              onPress={() => selectDate(dateKey)}
            >
              <Text style={styles.dayNumber}>{day}</Text>
              <View style={styles.dotsContainer}>
                {income > 0 && (
                  <View style={[styles.dot, { backgroundColor: "#2ecc71" }]} />
                )}
                {expense > 0 && (
                  <View style={[styles.dot, { backgroundColor: "#e74c3c" }]} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Untuk tampilin total in & out tanggal tertentu */}
      {selectedDate && (
        <>
          <View style={styles.totalsRow}>
            <View
              style={[
                styles.totalBox,
                {
                  backgroundColor:
                    selectedTotals.in > 0 ? "#e6f9ed" : "#f0f0f0",
                },
              ]}
            >
              <Text
                style={{
                  color: selectedTotals.in > 0 ? "green" : "#999",
                  fontWeight: "700",
                }}
              >
                Pemasukan
              </Text>
              <Text style={{ fontSize: 16 }}>
                +{selectedTotals.in.toLocaleString("id-ID") || "0"}
              </Text>
            </View>

            <View
              style={[
                styles.totalBox,
                {
                  backgroundColor:
                    selectedTotals.out > 0 ? "#ffe6e6" : "#f0f0f0",
                },
              ]}
            >
              <Text
                style={{
                  color: selectedTotals.out > 0 ? "red" : "#999",
                  fontWeight: "700",
                }}
              >
                Pengeluaran
              </Text>
              <Text style={{ fontSize: 16 }}>
                -{selectedTotals.out.toLocaleString("id-ID") || "0"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.showModalBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Tampilkan Semua Transaksi
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
            Riwayat {selectedDate}
          </Text>

          {selectedDate && monthlyTx[selectedDate]?.length > 0 ? (
            <FlatList
              data={monthlyTx[selectedDate]}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={({ item }) => (
                <View style={styles.txItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600" }}>{item.desc}</Text>
                    <Text style={{ color: "#666", fontSize: 12 }}>
                      {item.category_name}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: item.type === "in" ? "green" : "red",
                      fontWeight: "700",
                    }}
                  >
                    {item.type === "in" ? "+" : "-"}{" "}
                    {item.amount.toLocaleString("id-ID")}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={{ textAlign: "center" }}>Tidak ada transaksi</Text>
          )}

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={styles.closeModalBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 12,
    textAlign: "center",
  },
  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  arrow: { fontSize: 26 },
  monthLabel: { fontSize: 20, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  headerCell: {
    width: "14.2857%",
    height: 40,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  weekDay: { fontWeight: "700", color: "#555" },
  cell: {
    width: "14.2857%",
    aspectRatio: 1,
    backgroundColor: "#fff",
    padding: 4,
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  todayCell: {
    borderColor: "#2f80ed",
    borderWidth: 2,
    backgroundColor: "#e6f0ff",
  },
  selectedCell: { borderColor: "#2f80ed", borderWidth: 2 },
  emptyCell: { width: "14.2857%", aspectRatio: 1 },
  dayNumber: { fontWeight: "700" },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 4,
    justifyContent: "center",
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  totalBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  showModalBtn: {
    backgroundColor: "#2f80ed",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 36,
  },
  txItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 8,
  },
  closeModalBtn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#2f80ed",
    borderRadius: 8,
    alignItems: "center",
  },
});
