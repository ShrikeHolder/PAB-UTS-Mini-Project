import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { db } from "../data/database";

export default function Home() {
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [totalTx, setTotalTx] = useState(0);
  const [filteredTx, setFilteredTx] = useState([]);
  const [viewMode, setViewMode] = useState("both"); //untuk bisa kasih inactive tombol Lihat In&Out
  const [period, setPeriod] = useState("daily"); //Daily,Weekly,Monthly filter

  useEffect(() => {
    const transactions = db.getAllSync("SELECT * FROM transactions");

    let inSum = 0;
    let outSum = 0;

    transactions.forEach((t) => {
      if (t.type === "in") inSum += t.amount;
      else if (t.type === "out") outSum += t.amount;
    });

    setTotalIn(inSum);
    setTotalOut(outSum);
    setTotalTx(transactions.length);
  }, []);

  const filterByPeriod = () => {
    const all = db.getAllSync("SELECT * FROM transactions ORDER BY date DESC");

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let result = [];

    if (period === "daily") {
      result = all.filter((t) => {
        const d = new Date(t.date);
        return (
          d.getDate() === today.getDate() &&
          d.getMonth() === today.getMonth() &&
          d.getFullYear() === today.getFullYear()
        );
      });
    }

    if (period === "weekly") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 7);

      result = all.filter((t) => {
        const d = new Date(t.date);
        return d >= sevenDaysAgo && d <= today;
      });
    }

    if (period === "monthly") {
      result = all.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
    }

    setFilteredTx(result);
  };

  useEffect(() => {
    filterByPeriod();
  }, [period]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Selamat Datang</Text>

      {/* TOTAL BOX (IN + OUT or filtered)  */}
      <View style={styles.bigCard}>
        {viewMode === "both" ? (
          <>
            <Text style={styles.bigLabel}>Total Pemasukan</Text>
            <Text style={[styles.bigValue, { color: "green" }]}>
              Rp {totalIn.toLocaleString("id-ID")}
            </Text>

            <View style={{ height: 14 }} />

            <Text style={styles.bigLabel}>Total Pemasukan</Text>
            <Text style={[styles.bigValue, { color: "red" }]}>
              Rp {totalOut.toLocaleString("id-ID")}
            </Text>
          </>
        ) : viewMode === "in" ? (
          <>
            <Text style={styles.bigLabel}>Total Pemasukan</Text>
            <Text style={[styles.bigValue, { color: "green" }]}>
              Rp {totalIn.toLocaleString("id-ID")}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.bigLabel}>Total Pengeluaran</Text>
            <Text style={[styles.bigValue, { color: "red" }]}>
              Rp {totalOut.toLocaleString("id-ID")}
            </Text>
          </>
        )}
      </View>

      {/* Tombol Filter In & Out */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.optionBtn,
            viewMode === "in" && styles.optionBtnActive,
          ]}
          onPress={() => setViewMode(viewMode === "in" ? "both" : "in")}
        >
          <Text
            style={[
              styles.optionText,
              viewMode === "in" && styles.optionTextActive,
            ]}
          >
            Lihat Pemasukan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            viewMode === "out" && styles.optionBtnActive,
          ]}
          onPress={() => setViewMode(viewMode === "out" ? "both" : "out")}
        >
          <Text
            style={[
              styles.optionText,
              viewMode === "out" && styles.optionTextActive,
            ]}
          >
            Lihat Pengeluaran
          </Text>
        </TouchableOpacity>
      </View>

      {/*  Total Transactions  */}
      <View style={[styles.bigCard, { marginTop: 16 }]}>
        <Text style={styles.bigLabel}>Jumlah Transaksi</Text>
        <Text style={styles.bigValue}>{totalTx} transaksi</Text>
      </View>

      {/*  Daily | Weekly | Monthly  */}
      <View style={[styles.row, { marginTop: 20 }]}>
        {["daily", "weekly", "monthly"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.timeBtn, period === item && styles.timeBtnActive]}
            onPress={() => setPeriod(item)}
          >
            <Text
              style={[
                styles.timeText,
                period === item && styles.timeTextActive,
              ]}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <View style={{ marginTop: 20, paddingBottom: 25 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
          Transaksi{" "}
          {period === "daily"
            ? "Hari Ini"
            : period === "weekly"
            ? "7 Hari Terakhir"
            : "Bulan Ini"}
        </Text>

        {filteredTx.length === 0 ? (
          <Text style={{ color: "#777" }}>Tidak ada transaksi.</Text>
        ) : (
          filteredTx.map((t, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#fff",
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#eee",
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "700" }}>
                {t.title || "(Tanpa Judul)"}
              </Text>
              <Text style={{ color: "#666", marginTop: 4 }}>{t.date}</Text>

              <Text
                style={{
                  marginTop: 6,
                  fontSize: 16,
                  fontWeight: "700",
                  color: t.type === "in" ? "green" : "red",
                }}
              >
                Rp {t.amount.toLocaleString("id-ID")}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#f8f9fb",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 12,
    textAlign: "center",
    width: "100%",
  },

  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
  },

  bigCard: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
  },

  bigLabel: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  bigValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },

  /** Top Box Buttons */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  optionBtn: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
  },

  optionBtnActive: {
    backgroundColor: "#2f80ed",
    borderColor: "#2f80ed",
  },

  optionText: {
    fontWeight: "700",
    color: "#000",
  },

  optionTextActive: {
    color: "#fff",
  },

  /** Daily | Weekly | Monthly */
  timeBtn: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    alignItems: "center",
  },

  timeBtnActive: {
    backgroundColor: "#2f80ed",
    borderColor: "#2f80ed",
  },

  timeText: {
    fontWeight: "700",
    color: "#000",
  },

  timeTextActive: {
    color: "#fff",
  },
});
