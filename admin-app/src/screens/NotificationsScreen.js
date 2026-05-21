import React, { useEffect, useState } from 'react'
import { FlatList, Text, TouchableOpacity, View, StyleSheet, RefreshControl } from 'react-native'
import api from '../api/axios'

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/admin/notifications')
      setNotifications(data)
    } catch (err) {
      console.error('Notifications error:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchNotifications()
    setRefreshing(false)
  }

  const markRead = async (id) => {
    await api.patch(`/admin/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
  }

  const handleTap = (notif) => {
    markRead(notif._id)
    if (notif.type === 'new_application') {
      navigation.navigate('Payments')
    }
  }

  return (
    <FlatList
      style={styles.container}
      data={notifications}
      keyExtractor={item => item._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notifications</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handleTap(item)}
          style={[styles.item, item.read && styles.itemRead]}
        >
          <View style={styles.dot}>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <View style={styles.content}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 16 },
  item: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  itemRead: { opacity: 0.5 },
  dot: { width: 20, paddingTop: 6 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#b91c1c',
  },
  content: { flex: 1 },
  title: { fontWeight: '600', fontSize: 15, color: '#1f2937' },
  body: { color: '#6b7280', marginTop: 2, fontSize: 14 },
  time: { fontSize: 11, color: '#9ca3af', marginTop: 6 },
})
