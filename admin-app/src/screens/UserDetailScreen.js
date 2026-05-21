import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import api from '../api/axios'

export default function UserDetailScreen({ route }) {
  const { userId } = route.params
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/admin/users/${userId}`)
      .then(res => setUser(res.data))
      .catch(err => Alert.alert('Error', 'Failed to load user'))
      .finally(() => setLoading(false))
  }, [userId])

  const handleApprove = async () => {
    try {
      const { data } = await api.patch(`/admin/applications/${userId}/approve`)
      setUser(data.user)
      Alert.alert('Success', 'Application approved')
    } catch {
      Alert.alert('Error', 'Failed to approve')
    }
  }

  const handleReject = () => {
    Alert.prompt(
      'Reject Application',
      'Enter rejection reason (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            try {
              const { data } = await api.patch(`/admin/applications/${userId}/reject`, { reason })
              setUser(data.user)
              Alert.alert('Done', 'Application rejected')
            } catch {
              Alert.alert('Error', 'Failed to reject')
            }
          },
        },
      ],
      'plain-text'
    )
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#b91c1c" />
      </View>
    )
  }

  if (!user) return null

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    approved: { bg: '#d1fae5', text: '#065f46' },
    rejected: { bg: '#fee2e2', text: '#991b1b' },
  }
  const sc = statusColors[user.paymentStatus] || statusColors.pending

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {user.profilePhoto ? (
          <Image source={{ uri: user.profilePhoto }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoText}>{user.name?.charAt(0)}</Text>
          </View>
        )}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>{user.paymentStatus}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <DetailRow label="Phone" value={user.phone} />
        <DetailRow label="CNIC" value={user.cnic} />
        <DetailRow label="Address" value={user.address} />
        <DetailRow label="City" value={user.city} />
        <DetailRow label="Role" value={user.role} />
        <DetailRow label="Channel Fee" value={`Rs ${user.channelFee?.toLocaleString()}`} />
        <DetailRow
          label="Subscribed Date"
          value={user.subscribedDate ? new Date(user.subscribedDate).toLocaleDateString() : '-'}
        />
        <DetailRow
          label="Next Due Date"
          value={user.nextDueDate ? new Date(user.nextDueDate).toLocaleDateString() : '-'}
        />
      </View>

      {user.paymentScreenshot && (
        <View style={styles.screenshotSection}>
          <Text style={styles.sectionTitle}>Payment Screenshot</Text>
          <Image
            source={{ uri: user.paymentScreenshot }}
            style={styles.screenshot}
            resizeMode="contain"
          />
        </View>
      )}

      {user.paymentStatus === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={handleApprove}>
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={handleReject}>
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

function DetailRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  photo: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoText: { fontSize: 32, fontWeight: 'bold', color: '#b91c1c' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  email: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  badge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14, marginTop: 10 },
  badgeText: { fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
  details: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, gap: 0 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: { color: '#6b7280', fontSize: 14 },
  detailValue: { color: '#1f2937', fontWeight: '600', fontSize: 14 },
  screenshotSection: { margin: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  screenshot: { width: '100%', height: 300, borderRadius: 12, backgroundColor: '#e5e7eb' },
  actions: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 40 },
  actionBtn: { flex: 1, padding: 16, borderRadius: 10, alignItems: 'center' },
  approveBtn: { backgroundColor: '#10b981' },
  rejectBtn: { backgroundColor: '#ef4444' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
})
