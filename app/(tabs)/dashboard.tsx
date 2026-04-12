import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

export default function DashboardScreen() {
  const [activeFilter, setActiveFilter] = useState('Months');

  // Dummy data for lists
  const recentOrders = [
    { id: 'A98412', price: '₹250' },
    { id: 'A98412', price: '₹250' },
    { id: 'A98412', price: '₹250' },
    { id: 'A98412', price: '₹250' },
  ];

  const biggestRevenue = [
    { rank: '#1', date: '21/02/2025', price: '₹900' },
    { rank: '#1', date: '21/02/2025', price: '₹900' },
    { rank: '#1', date: '21/02/2025', price: '₹900' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Timeframe Filters */}
        <View style={styles.filtersContainer}>
          {['Hours', 'Days', 'Months'].map((filter) => (
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

        {/* Chart Area Placeholder */}
        <View style={styles.chartCard}>
          {/* Faking the grid lines for the visual placeholder */}
          {[100, 200, 300, 400, 500, 600, 700, 800].reverse().map((val) => (
            <View key={val} style={styles.chartRow}>
              <Text style={styles.yAxisText}>{val}</Text>
              <View style={styles.gridLine} />
            </View>
          ))}
          <View style={styles.xAxisContainer}>
            {['100', '200', '300', '400', '500', '600'].map((val) => (
              <Text key={val} style={styles.xAxisText}>{val}</Text>
            ))}
          </View>
          
          {/* Note: Replace this entire chartCard content with <LineChart /> from react-native-chart-kit */}
          <Text style={styles.chartMockOverlayText}>[ Insert Chart Component Here ]</Text>
        </View>

        {/* Two Column Grid */}
        <View style={styles.gridContainer}>
          
          {/* Left Column: Stat Cards */}
          <View style={styles.leftColumn}>
            <StatCard title="Total Products" value="8" accentColor="#4CAF50" />
            <StatCard title="Total Stock Units" value="30" accentColor="#4285F4" />
            <StatCard title="Today's Sales" value="₹0" accentColor="#8B5CF6" />
            <StatCard title="Near Expiry" value="12" accentColor="#EF4444" />
          </View>

          {/* Right Column: List Cards */}
          <View style={styles.rightColumn}>
            
            {/* Recent Orders List */}
            <View style={styles.listCard}>
              <Text style={styles.listCardTitle}>Recent Orders</Text>
              {recentOrders.map((order, index) => (
                <View key={index} style={styles.listItemRow}>
                  <Text style={styles.listItemMain}>{order.id}</Text>
                  <View style={styles.pricePill}>
                    <Text style={styles.pricePillText}>{order.price}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Biggest Revenue Days List */}
            <View style={styles.listCard}>
              <Text style={styles.listCardTitle}>Biggest Revenue Days</Text>
              {biggestRevenue.map((item, index) => (
                <View key={index} style={styles.listItemRow}>
                  <Text style={styles.listRankText}>{item.rank}</Text>
                  <Text style={styles.listItemMain}>{item.date}</Text>
                  <View style={styles.pricePill}>
                    <Text style={styles.pricePillText}>{item.price}</Text>
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

// Reusable component for the smaller stat blocks on the left
type StatCardProps = {
  title: string;
  value: string;
  accentColor: string;
};

const StatCard = ({ title, value, accentColor }: StatCardProps) => (
  <View style={styles.statCard}>
    <View style={[styles.statAccent, { backgroundColor: accentColor }]} />
    <View style={styles.statContent}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#EEF3F4', // Matches the light grey/teal background
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  
  // --- Filters ---
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
    gap: 8,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4285F4',
    backgroundColor: 'transparent',
  },
  activeFilterPill: {
    backgroundColor: '#E8F0FE', // Slight fill for active state
  },
  filterText: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    fontWeight: '700',
  },

  // --- Chart Area ---
  chartCard: {
    marginBottom: 24,
    position: 'relative',
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  yAxisText: {
    width: 30,
    fontSize: 12,
    color: '#666',
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D9D9',
  },
  xAxisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 30, // Offset for y-axis width
    marginTop: -10,
  },
  xAxisText: {
    fontSize: 12,
    color: '#666',
  },
  chartMockOverlayText: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    color: '#999',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  // --- Grid Layout ---
  gridContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  leftColumn: {
    flex: 1,
    gap: 12,
  },
  rightColumn: {
    flex: 1.2, // Slightly wider to fit the lists nicely
    gap: 12,
  },

  // --- Stat Card Styles ---
  statCard: {
    backgroundColor: '#EAF0F0', // Slightly contrasting card color
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D9D9',
  },
  statAccent: {
    width: 6,
    height: '100%',
  },
  statContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flex: 1,
  },
  statTitle: {
    fontSize: 13,
    color: '#5F6368',
    marginBottom: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  // --- List Card Styles ---
  listCard: {
    backgroundColor: '#EAF0F0',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D9D9',
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5F6368',
    marginBottom: 12,
    textAlign: 'center',
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  listRankText: {
    fontSize: 12,
    color: '#5F6368',
    marginRight: 6,
    fontWeight: '600',
  },
  listItemMain: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  pricePill: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  pricePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});