import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import api from '../api/axios'

const FILTERS = ['all', 'pending', 'approved', 'rejected']

export default function UsersScreen({ navigation }) {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [refreshing, setRefreshing] = useState(false)

  const fetchUsers = async (p = 1) => {
    try {
      const params = { page: p, limit: 20 }
      if (filter !== 'all') params.status = filter
      if (search) params.search = search
      const { data } = await api.get('/admin/users', { params })
      setUsers(p === 1 ? data.users : [...users, ...data.users])
      setTotalPages(data.pages)
      setPage(p)
    } catch (err) {
      console.error('Users error:', err)
    }
  }

  useEffect(() => {
    fetchUsers(1)
  }, [filter, search])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchUsers(1)
    setRefreshing(false)
  }

  const loadMore = () => {
    if (page < totalPages) fetchUsers(page + 1)
  }

  const statusColors = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    approved: { bg: '#d1fae5', text: '#065f46' },
    rejected: { bg: '#fee2e2', text: '#991b1b' },
  }

  const renderItem = ({ item }) => {
    const sc = statusColors[item.paymentStatus] || statusColors.pending
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('UserDetail', { userId: item._id })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0)}</Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemRole}>{item.role} - {item.city}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.text }]}>{item.paymentStatus}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name, city, or role..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filters}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={users}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  searchInput: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 15,
  },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
  },
  filterChipActive: { backgroundColor: '#b91c1c' },
  filterText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    marginHorizontal: 16,
    marginTop: 6,
    borderRadius: 10,
    elevation: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fecaca',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#b91c1c', fontWeight: 'bold', fontSize: 18 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1f2937' },
  itemRole: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 16 },
})
