import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import API from "@/app/services/api";

const { width } = Dimensions.get("window");

interface Overview {
  totalProducts: number;
  totalStockUnits: number;
  todaysSales: number;
  nearExpiry: number;
}

interface RecentOrder {
  id: string;
  amount: number;
  date: string;
}

interface RevenueDay {
  rank: number;
  date: string;
  amount: number;
}

interface GraphPoint { label: number; value: number }

const FILTERS = ["Hours", "Days", "Months"] as const;
type Filter = typeof FILTERS[number];

const FILTER_TYPE: Record<Filter, string> = {
  Hours: "hours",
  Days: "days",
  Months: "months",
};

function StatCard({ title, value, icon, accent }: {
  title: string; value: string; icon: string; accent: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: accent }]}>
      <Ionicons name={icon as any} size={22} color={accent} style={{ marginBottom: 6 }} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [filter, setFilter] = useState<Filter>("Months");
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);

  const [overview, setOverview] = useState<Overview>({
    totalProducts: 0, totalStockUnits: 0, todaysSales: 0, nearExpiry: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [revenueDays, setRevenueDays] = useState<RevenueDay[]>([]);
  const [graphRevenue, setGraphRevenue] = useState<GraphPoint[]>([]);
  const [graphLoss, setGraphLoss] = useState<GraphPoint[]>([]);

  // Fetch overview + orders once on mount
  useEffect(() => {
    const load = async () => {
      setOverviewLoading(true);
      try {
        const [ovRes, ordRes, rdRes] = await Promise.all([
          API.get("/dashboard/overview"),
          API.get("/dashboard/orders"),
          API.get("/dashboard/biggest-days"),
        ]);
        const ov = ovRes.data || {};
        setOverview({
          totalProducts: Number(ov.totalProducts) || 0,
          totalStockUnits: Number(ov.totalStockUnits) || 0,
          todaysSales: Number(ov.todaysSales) || 0,
          nearExpiry: Number(ov.nearExpiry) || 0,
        });
        setRecentOrders(
          Array.isArray(ordRes.data)
            ? ordRes.data.map((o: any) => ({
                id: String(o.ReceiptID),
                amount: Number(o.TotalAmount) || 0,
                date: o.BillDate ? new Date(o.BillDate).toLocaleDateString() : "-",
              }))
            : []
        );
        setRevenueDays(
          Array.isArray(rdRes.data)
            ? rdRes.data.map((d: any, i: number) => ({
                rank: i + 1,
                date: d.day ? new Date(d.day).toLocaleDateString() : "-",
                amount: Number(d.revenue) || 0,
              }))
            : []
        );
      } catch (e) {
        console.error("[Dashboard] overview fetch failed:", e);
      } finally {
        setOverviewLoading(false);
      }
    };
    load();
  }, []);

  // Fetch graph on filter change
  const fetchGraph = useCallback(async (f: Filter) => {
    setGraphLoading(true);
    try {
      const res = await API.get(`/dashboard/graph?type=${FILTER_TYPE[f]}`);
      const data = res.data || {};
      setGraphRevenue(Array.isArray(data.revenue) ? data.revenue : []);
      setGraphLoss(Array.isArray(data.loss) ? data.loss : []);
    } catch (e) {
      console.error("[Dashboard] graph fetch failed:", e);
    } finally {
      setGraphLoading(false);
    }
  }, []);

  useEffect(() => { fetchGraph(filter); }, [filter, fetchGraph]);

  const maxRevenue = Math.max(...graphRevenue.map((p) => p.value), 1);
  const CHART_H = 120;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Products"    value={String(overview.totalProducts)}    icon="cube-outline"       accent="#4CAF50" />
          <StatCard title="Stock Units" value={String(overview.totalStockUnits)}  icon="layers-outline"     accent="#4285F4" />
          <StatCard title="Today's Sales" value={`₹${overview.todaysSales}`}      icon="cash-outline"       accent="#8B5CF6" />
          <StatCard title="Near Expiry" value={String(overview.nearExpiry)}       icon="warning-outline"    accent="#EF4444" />
        </View>

        {/* Revenue graph */}
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Revenue</Text>
            <View style={styles.filterRow}>
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterPill, filter === f && styles.filterPillActive]}
                  onPress={() => setFilter(f)}
                >
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {graphLoading ? (
            <Text style={styles.loadingText}>Loading graph...</Text>
          ) : graphRevenue.length === 0 ? (
            <Text style={styles.emptyText}>No data for this period</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chart}>
                {graphRevenue.map((pt, i) => {
                  const barH = Math.max(4, (pt.value / maxRevenue) * CHART_H);
                  return (
                    <View key={i} style={styles.barWrapper}>
                      <Text style={styles.barValue}>₹{Math.round(pt.value)}</Text>
                      <View style={[styles.bar, { height: barH }]} />
                      <Text style={styles.barLabel}>{pt.label}</Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>

        {/* Recent orders */}
        <Text style={styles.sectionTitle}>Recent Orders</Text>
        <View style={styles.listCard}>
          {recentOrders.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet</Text>
          ) : (
            recentOrders.slice(0, 5).map((o, i, arr) => (
              <View key={i} style={[styles.listRow, i < arr.length - 1 && styles.listRowBorder]}>
                <View>
                  <Text style={styles.listMain}>Receipt #{o.id}</Text>
                  <Text style={styles.listSub}>{o.date}</Text>
                </View>
                <Text style={styles.listAmount}>₹{o.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        {/* Biggest revenue days */}
        <Text style={styles.sectionTitle}>Top Revenue Days</Text>
        <View style={styles.listCard}>
          {revenueDays.length === 0 ? (
            <Text style={styles.emptyText}>No data this month</Text>
          ) : (
            revenueDays.slice(0, 5).map((d, i, arr) => (
              <View key={i} style={[styles.listRow, i < arr.length - 1 && styles.listRowBorder]}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{d.rank}</Text>
                </View>
                <Text style={[styles.listMain, { flex: 1, marginLeft: 10 }]}>{d.date}</Text>
                <Text style={styles.listAmount}>₹{d.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8F9FA" },
  scroll: { padding: 16, paddingBottom: 40 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  statValue: { fontSize: 22, fontWeight: "700", color: "#111", marginBottom: 2 },
  statTitle: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 10 },
  chartSection: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 20, elevation: 2 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  filterRow: { flexDirection: "row", gap: 6 },
  filterPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "#4285F4" },
  filterPillActive: { backgroundColor: "#4285F4" },
  filterText: { fontSize: 12, color: "#4285F4", fontWeight: "500" },
  filterTextActive: { color: "#fff" },
  chart: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 160, paddingBottom: 24 },
  barWrapper: { alignItems: "center", width: 36 },
  bar: { width: 24, backgroundColor: "#4285F4", borderRadius: 4 },
  barValue: { fontSize: 9, color: "#6B7280", marginBottom: 4, textAlign: "center" },
  barLabel: { fontSize: 10, color: "#6B7280", marginTop: 4 },
  listCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 20, elevation: 2 },
  listRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  listMain: { fontSize: 14, fontWeight: "600", color: "#111" },
  listSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  listAmount: { fontSize: 14, fontWeight: "700", color: "#4285F4" },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#EEF3FF",
    alignItems: "center", justifyContent: "center",
  },
  rankText: { fontSize: 12, fontWeight: "700", color: "#4285F4" },
  loadingText: { color: "#9CA3AF", textAlign: "center", paddingVertical: 20 },
  emptyText: { color: "#9CA3AF", textAlign: "center", paddingVertical: 16, fontSize: 13 },
});
