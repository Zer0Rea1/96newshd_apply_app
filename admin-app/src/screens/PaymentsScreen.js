import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native'
import api from '../api/axios'

export default function PaymentsScreen() {
  const [applications, setApplications] = useState([])
  const [selected, setSelected] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/admin/applications?status=pending')
      setApplications(data)
    } catch (err) {
      console.error('Fetch error:', err)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchApplications()
    setRefreshing(false)
  }

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/applications/${id}/approve`)
      setApplications(prev => prev.filter(a => a._id !== id))
      setSelected(null)
      Alert.alert('Success', 'Application approved')
    } catch (err) {
      Alert.alert('Error', 'Failed to approve')
    }
  }

  const handleReject = (id) => {
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
              await api.patch(`/admin/applications/${id}/reject`, { reason })
              setApplications(prev => prev.filter(a => a._id !== id))
              setSelected(null)
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

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => setSelected(item)}>
      <View style={styles.itemLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemRole}>{item.role} — Rs {item.channelFee?.toLocaleString()}</Text>
          <Text style={styles.itemTime}>{timeAgo(item.createdAt)}</Text>
        </View>
      </View>
      {item.paymentScreenshot && (
        <Image source={{ uri: item.paymentScreenshot }} style={styles.thumbnail} />
      )}
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={applications.length === 0 && { flex: 1 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No pending payments</Text>
          </View>
        }
      />

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <ScrollView style={styles.modal}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>

            {selected.paymentScreenshot && (
              <Image
                source={{ uri: selected.paymentScreenshot }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}

            <View style={styles.detail}>
              <DetailRow label="Name" value={selected.name} />
              <DetailRow label="CNIC" value={selected.cnic} />
              <DetailRow label="Phone" value={selected.phone} />
              <DetailRow label="City" value={selected.city} />
              <DetailRow label="Role" value={selected.role} />
              <DetailRow label="Fee" value={`Rs ${selected.channelFee?.toLocaleString()}`} />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleApprove(selected._id)}
              >
                <Text style={styles.actionBtnText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => handleReject(selected._id)}
              >
                <Text style={styles.actionBtnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Modal>
    </View>
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
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 16 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 10,
    elevation: 1,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#b91c1c', fontWeight: 'bold', fontSize: 18 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  itemRole: { fontSize: 13, color: '#6b7280' },
  itemTime: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  thumbnail: { width: 50, height: 50, borderRadius: 6, marginLeft: 8 },
  modal: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 50 },
  closeBtn: { alignSelf: 'flex-end', padding: 8 },
  closeBtnText: { color: '#b91c1c', fontWeight: '600', fontSize: 16 },
  fullImage: { width: '100%', height: 300, borderRadius: 12, marginVertical: 16 },
  detail: { gap: 8, marginBottom: 20 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
  },
  detailLabel: { color: '#6b7280', fontSize: 14 },
  detailValue: { color: '#1f2937', fontWeight: '600', fontSize: 14 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  actionBtn: { flex: 1, padding: 16, borderRadius: 10, alignItems: 'center' },
  approveBtn: { backgroundColor: '#10b981' },
  rejectBtn: { backgroundColor: '#ef4444' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
})
