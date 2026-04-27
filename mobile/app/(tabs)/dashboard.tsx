import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DashboardStats {
  totalProducts: number;
  totalStockUnits: number;
  todaysSales: number;
  nearExpiry: number;
  recentOrders: Array<{ id: string; price: number }>;
  biggestRevenueDays: Array<{ rank: number; date: string; price: number }>;
}

interface StatCardProps {
  title: string;
  value: string;
  accentColor: string;
}

function StatCard({ title, value, accentColor }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statAccent, { backgroundColor: accentColor }]} />
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [activeFilter, setActiveFilter] = useState("Months");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalStockUnits: 0,
    todaysSales: 0,
    nearExpiry: 0,
    recentOrders: [],
    biggestRevenueDays: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching stats for:", activeFilter);

        await new Promise((resolve) => setTimeout(resolve, 300));

        setStats({
          totalProducts: 8,
          totalStockUnits: 30,
          todaysSales: 0,
          nearExpiry: 12,
          recentOrders: [
            { id: "A98412", price: 250 },
            { id: "B12345", price: 180 },
            { id: "C67890", price: 320 },
            { id: "D54321", price: 250 },
          ],
          biggestRevenueDays: [
            { rank: 1, date: "21/02/2025", price: 900 },
            { rank: 2, date: "20/02/2025", price: 850 },
            { rank: 3, date: "19/02/2025", price: 720 },
          ],
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [activeFilter]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filtersContainer}>
          {["Hours", "Days", "Months"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.activeFilterPill,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.chartCard}>
          {[100, 200, 300, 400, 500, 600, 700, 800].reverse().map((val) => (
            <View key={val} style={styles.chartRow}>
              <Text style={styles.yAxisText}>{val}</Text>
              <View style={styles.gridLine} />
            </View>
          ))}
          <View style={styles.xAxisContainer}>
            {["100", "200", "300", "400", "500", "600"].map((val) => (
              <Text key={val} style={styles.xAxisText}>
                {val}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.gridContainer}>
          <View style={styles.leftColumn}>
            <StatCard
              title="Total Products"
              value={stats.totalProducts.toString()}
              accentColor="#4CAF50"
            />
            <StatCard
              title="Total Stock Units"
              value={stats.totalStockUnits.toString()}
              accentColor="#4285F4"
            />
            <StatCard
              title="Today's Sales"
              value={`₹${stats.todaysSales}`}
              accentColor="#8B5CF6"
            />
            <StatCard
              title="Near Expiry"
              value={stats.nearExpiry.toString()}
              accentColor="#EF4444"
            />
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.listCard}>
              <Text style={styles.listCardTitle}>Recent Orders</Text>
              {stats.recentOrders.map((order, index) => (
                <View key={index} style={styles.listItemRow}>
                  <Text style={styles.listItemMain}>{order.id}</Text>
                  <View style={styles.pricePill}>
                    <Text style={styles.pricePillText}>₹ {order.price}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.listCard}>
              <Text style={styles.listCardTitle}>Biggest Revenue Days</Text>
              {stats.biggestRevenueDays.map((item, index) => (
                <View key={index} style={styles.listItemRow}>
                  <Text style={styles.listRankText}>#{item.rank}</Text>
                  <Text style={styles.listItemMain}>{item.date}</Text>
                  <View style={styles.pricePill}>
                    <Text style={styles.pricePillText}>₹ {item.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF3F4",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#4285F4",
    backgroundColor: "transparent",
  },
  activeFilterPill: {
    backgroundColor: "#E8F0FE",
  },
  filterText: {
    color: "#4285F4",
    fontSize: 14,
    fontWeight: "500",
  },
  activeFilterText: {
    fontWeight: "700",
  },
  chartCard: {
    marginBottom: 24,
    position: "relative",
  },
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  yAxisText: {
    width: 30,
    fontSize: 12,
    color: "#666",
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D9D9",
  },
  xAxisContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 30,
    marginTop: -10,
  },
  xAxisText: {
    fontSize: 12,
    color: "#666",
  },
  gridContainer: {
    flexDirection: "row",
    gap: 12,
  },
  leftColumn: {
    flex: 1,
    gap: 12,
  },
  rightColumn: {
    flex: 1.2,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#EAF0F0",
    borderRadius: 12,
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D1D9D9",
  },
  statAccent: {
    width: 6,
    height: "100%",
  },
  statContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flex: 1,
  },
  statTitle: {
    fontSize: 13,
    color: "#5F6368",
    marginBottom: 6,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  listCard: {
    backgroundColor: "#EAF0F0",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D9D9",
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#5F6368",
    marginBottom: 12,
    textAlign: "center",
  },
  listItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  listRankText: {
    fontSize: 12,
    color: "#5F6368",
    marginRight: 6,
    fontWeight: "600",
  },
  listItemMain: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    flex: 1,
  },
  pricePill: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pricePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
});
