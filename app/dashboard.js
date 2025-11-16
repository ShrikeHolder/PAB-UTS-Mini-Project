import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { db } from "../data/database";

// Untuk Chart
import { PieChart } from "react-native-chart-kit";

// Untuk bisa atur ukuran Chart
import { Dimensions } from "react-native";

// Icon
import SortIcon from "../assets/sort.svg";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortMode, setSortMode] = useState("none");

  // Ambil dari Database
  const loadTransactions = () => {
    const rows = db.getAllSync(
      `SELECT t.*, c.name AS category_name 
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id`
    );

    setTransactions(rows);

    const inTotal = rows
      .filter((t) => t.type === "in")
      .reduce((a, t) => a + t.amount, 0);

    const outTotal = rows
      .filter((t) => t.type === "out")
      .reduce((a, t) => a + t.amount, 0);

    setTotalIn(inTotal);
    setTotalOut(outTotal);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    let filtered =
      typeFilter === "all"
        ? transactions
        : transactions.filter((t) => t.type === typeFilter);

    const grouped = {};
    filtered.forEach((t) => {
      if (!grouped[t.category_name]) grouped[t.category_name] = 0;
      grouped[t.category_name] += t.amount;
    });

    const data = Object.keys(grouped).map((key, idx) => ({
      name: key,
      amount: grouped[key],
      color: getColor(idx),
      legendFontColor: "#333",
      legendFontSize: 14,
    }));

    setChartData(data);
  }, [transactions, typeFilter]);

  // Untuk tampilin warna kategori
  const getColor = (idx) => {
    const colors = [
      "#2ecc71",
      "#e74c3c",
      "#f1c40f",
      "#3498db",
      "#9b59b6",
      "#e67e22",
    ];
    return colors[idx % colors.length];
  };

  const getTotalAmount = () => {
    return chartData.reduce((sum, item) => sum + item.amount, 0);
  };

  const getFilteredTotal = () => {
    if (typeFilter === "in") return totalIn;
    if (typeFilter === "out") return totalOut;
    return totalIn + totalOut;
  };

  const toggleSort = () => {
    if (sortMode === "none") setSortMode("desc");
    else if (sortMode === "desc") setSortMode("asc");
    else setSortMode("none");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      {/* Pie Chart */}
      {chartData.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>
          Tidak ada data
        </Text>
      ) : (
        <View style={{ width: "100%", alignItems: "center" }}>
          <PieChart
            data={chartData}
            width={screenWidth - 80}
            height={325}
            paddingLeft="80"
            chartConfig={{
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            absolute
            hasLegend={false}
            style={{ transform: [{ scale: 1.15 }] }}
          />
        </View>
      )}

      {/* Filter Buttons */}
      <Text style={styles.subtitle}>Filter Transaksi</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.chartBtn,
            typeFilter === "in" && styles.chartBtnActive,
          ]}
          onPress={() => setTypeFilter("in")}
        >
          <Text
            style={[
              styles.chartBtnText,
              typeFilter === "in" && { color: "#fff" },
            ]}
          >
            Pemasukan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.chartBtn,
            typeFilter === "out" && styles.chartBtnActive,
          ]}
          onPress={() => setTypeFilter("out")}
        >
          <Text
            style={[
              styles.chartBtnText,
              typeFilter === "out" && { color: "#fff" },
            ]}
          >
            Pengeluaran
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total Ins & Outs*/}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>
          {typeFilter === "in"
            ? "Total Pemasukan"
            : typeFilter === "out"
            ? "Total Pengeluaran"
            : "Total Transaksi"}
        </Text>

        <Text
          style={[
            styles.summaryValue,
            {
              color:
                typeFilter === "in"
                  ? "green"
                  : typeFilter === "out"
                  ? "red"
                  : "#000",
            },
          ]}
        >
          Rp {getFilteredTotal().toLocaleString("id-ID")}
        </Text>
      </View>

      {/* Custom Legend + Sort Option*/}
      <View style={{ marginTop: 16, position: "relative" }}>
        {/* Sort Button */}
        <TouchableOpacity
          onPress={toggleSort}
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            backgroundColor: sortMode === "none" ? "#eee" : "#2f80ed",
            padding: 8,
            borderRadius: 10,
            zIndex: 10,
          }}
        >
          <SortIcon
            width={18}
            height={18}
            fill={sortMode === "none" ? "#333" : "#fff"}
          />
        </TouchableOpacity>

        {/* Custom Legends */}
        {[...chartData]
          .sort((a, b) => {
            if (sortMode === "desc") return b.amount - a.amount;
            if (sortMode === "asc") return a.amount - b.amount;
            return 0;
          })
          .map((item, index) => {
            const total = getTotalAmount();
            const percent = ((item.amount / total) * 100).toFixed(1);

            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                  paddingRight: 32,
                }}
              >
                <View
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: item.color,
                    marginRight: 8,
                    borderRadius: 4,
                  }}
                />
                <Text style={{ fontSize: 14 }}>
                  {item.name} ({percent}%):{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    Rp {item.amount.toLocaleString("id-ID")}
                  </Text>
                </Text>
              </View>
            );
          })}
      </View>
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
    width: "100%",
  },
  totalBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
  },
  totalLabel: { fontWeight: "600", marginBottom: 6 },
  totalValue: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontWeight: "600", marginBottom: 6 },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  chartBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 4,
    alignItems: "center",
  },
  chartBtnActive: { backgroundColor: "#2f80ed", borderColor: "#2f80ed" },
  chartBtnText: { fontWeight: "700", color: "#000" },
  summaryBox: {
    marginTop: 5,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
  },
});
