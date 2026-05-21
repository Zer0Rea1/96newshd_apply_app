import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import api from '../api/axios'

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats')
      setStats(data)
    } catch (err) {
      console.error('Stats error:', err)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchStats()
    setRefreshing(false)
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.grid}>
        <StatCard label="Pending Payments" value={stats.pending} color="#f59e0b" />
        <StatCard label="Approved Members" value={stats.approved} color="#10b981" />
        <StatCard label="Revenue (This Month)" value={`Rs ${stats.revenue?.toLocaleString()}`} color="#3b82f6" />
      </View>

      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => navigation.navigate('Payments')}
      >
        <Text style={styles.viewButtonText}>View Pending Payments</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Recent Submissions</Text>
      {stats.recentSubmissions?.map((user) => (
        <View key={user._id} style={styles.recentItem}>
          <View>
            <Text style={styles.recentName}>{user.name}</Text>
            <Text style={styles.recentRole}>{user.role}</Text>
          </View>
          <StatusBadge status={user.paymentStatus} />
        </View>
      ))}
    </ScrollView>
  )
}

function StatCard({ label, value, color }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
    </View>
  )
}

function StatusBadge({ status }) {
  const colors = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    approved: { bg: '#d1fae5', text: '#065f46' },
    rejected: { bg: '#fee2e2', text: '#991b1b' },
  }
  const c = colors[status] || colors.pending
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb', padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  grid: { gap: 12, marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    elevation: 1,
  },
  cardLabel: { fontSize: 13, color: '#6b7280' },
  cardValue: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  viewButton: {
    backgroundColor: '#b91c1c',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  viewButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 12 },
  recentItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 1,
  },
  recentName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  recentRole: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
})
