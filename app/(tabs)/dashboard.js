import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Pressable,
  ScrollView,
  VStack,
  HStack,
} from "@gluestack-ui/themed";

import { PieChart } from "react-native-chart-kit";

// Database
import { db } from "../../data/database";

// Untuk bisa ubah ukuran Chart
import { Dimensions } from "react-native";

// Icons
import SortIcon from "../../assets/sort.svg";
import SortDownIcon from "../../assets/sort-down.svg";
import SortUpIcon from "../../assets/sort-up.svg";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [typeFilter, setTypeFilter] = useState("all"); // untuk filter In/Out
  const [sortMode, setSortMode] = useState("none"); // fiter asc/desc & unfilter

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

  // Untuk kasih warna legends
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

  const getTotalAmount = () =>
    chartData.reduce((sum, item) => sum + item.amount, 0);

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

  const getSortIcon = () => {
    if (sortMode === "desc")
      return <SortDownIcon width={18} height={18} fill="#fff" />;
    if (sortMode === "asc")
      return <SortUpIcon width={18} height={18} fill="#fff" />;
    return <SortIcon width={18} height={18} fill="#333" />;
  };

  return (
    <ScrollView flex={1} p="$6">
      <Text fontSize="$4xl" fontWeight="700" textAlign="center" mb="$4">
        Dashboard
      </Text>

      {chartData.length === 0 ? (
        <Text textAlign="center" mt="$5">
          Tidak ada data
        </Text>
      ) : (
        <Box alignItems="center">
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
            style={{ transform: [{ scale: 1.15 }] }} // Multiplier untuk ukuran Chart
          />
        </Box>
      )}

      <Text fontWeight="600" mb="$2">
        Filter Transaksi
      </Text>
      <HStack space="md" mb="$4">
        {["in", "out"].map((type) => (
          <Pressable
            key={type}
            flex={1}
            py="$3"
            borderRadius="$md"
            borderWidth={1}
            borderColor={typeFilter === type ? "$blue500" : "$gray300"}
            bg={typeFilter === type ? "$blue500" : "$white"}
            alignItems="center"
            onPress={() => setTypeFilter(type)}
          >
            <Text
              fontWeight="700"
              color={typeFilter === type ? "$white" : "$textDark900"}
            >
              {type === "in" ? "Pemasukan" : "Pengeluaran"}
            </Text>
          </Pressable>
        ))}
      </HStack>

      <Box
        mt="$2"
        p="$4"
        borderRadius="$lg"
        borderWidth={1}
        borderColor="$borderLight300"
        bg="$background"
        alignItems="center"
      >
        <Text fontSize="$md" fontWeight="600" mb="$1">
          {typeFilter === "in"
            ? "Total Pemasukan"
            : typeFilter === "out"
            ? "Total Pengeluaran"
            : "Total Transaksi"}
        </Text>
        <Text
          fontSize="$2xl"
          fontWeight="700"
          color={
            typeFilter === "in"
              ? "$green600"
              : typeFilter === "out"
              ? "$red600"
              : "$textDark900"
          }
        >
          Rp {getFilteredTotal().toLocaleString("id-ID")}
        </Text>
      </Box>

      <Box mt="$6" position="relative" mb="$8">
        <Pressable
          onPress={toggleSort}
          position="absolute"
          top={-6}
          right={-6}
          bg={sortMode === "none" ? "transparent" : "$blue500"}
          p="$2"
          borderRadius="$lg"
          zIndex={10}
        >
          {getSortIcon()}
        </Pressable>

        <VStack space="sm" pr="$8">
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
                <HStack key={index} alignItems="center" space="sm">
                  <Box
                    width={16}
                    height={16}
                    borderRadius="$sm"
                    bg={item.color}
                  />
                  <Text fontSize="$sm">
                    {item.name} ({percent}%):{" "}
                    <Text fontWeight="700">
                      Rp {item.amount.toLocaleString("id-ID")}
                    </Text>
                  </Text>
                </HStack>
              );
            })}
        </VStack>
      </Box>
    </ScrollView>
  );
}
