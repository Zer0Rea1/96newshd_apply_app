import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Switch,
  RefreshControl,
} from 'react-native'
import api from '../api/axios'

export default function RolesScreen() {
  const [roles, setRoles] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formName, setFormName] = useState('')
  const [formFee, setFormFee] = useState('')
  const [formOrder, setFormOrder] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [formLevel, setFormLevel] = useState('city')

  const fetchRoles = async () => {
    try {
      const { data } = await api.get('/admin/roles')
      setRoles(data)
    } catch (err) {
      console.error('Roles error:', err)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchRoles()
    setRefreshing(false)
  }

  const openAdd = () => {
    setEditing(null)
    setFormName('')
    setFormFee('')
    setFormOrder('0')
    setFormActive(true)
    setFormLevel('city')
    setModalVisible(true)
  }

  const openEdit = (role) => {
    setEditing(role)
    setFormName(role.name)
    setFormFee(String(role.fee))
    setFormOrder(String(role.sortOrder ?? 0))
    setFormActive(role.isActive)
    setFormLevel(role.level || 'city')
    setModalVisible(true)
  }

  const handleSave = async () => {
    if (!formName.trim() || !formFee.trim()) {
      Alert.alert('Error', 'Name and fee are required')
      return
    }

    const payload = {
      name: formName.trim(),
      fee: Number(formFee),
      sortOrder: Number(formOrder) || 0,
      isActive: formActive,
      level: formLevel,
    }

    try {
      if (editing) {
        const { data } = await api.patch(`/admin/roles/${editing._id}`, payload)
        setRoles(prev => prev.map(r => r._id === editing._id ? data : r))
      } else {
        const { data } = await api.post('/admin/roles', payload)
        setRoles(prev => [...prev, data])
      }
      setModalVisible(false)
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save')
    }
  }

  const handleDelete = (role) => {
    Alert.alert(
      'Delete Role',
      `Are you sure you want to delete "${role.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/admin/roles/${role._id}`)
              setRoles(prev => prev.filter(r => r._id !== role._id))
            } catch {
              Alert.alert('Error', 'Failed to delete')
            }
          },
        },
      ]
    )
  }

  const renderItem = ({ item }) => (
    <View style={[styles.item, !item.isActive && styles.itemInactive]}>
      <TouchableOpacity style={styles.itemContent} onPress={() => openEdit(item)}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={[styles.itemFee, { color: '#4b5563', fontSize: 13, marginTop: 2, textTransform: 'capitalize' }]}>Level: {item.level || 'city'}</Text>
        <Text style={styles.itemFee}>Rs {item.fee?.toLocaleString()}</Text>
        {!item.isActive && (
          <View style={styles.inactiveBadge}>
            <Text style={styles.inactiveBadgeText}>Inactive</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={openAdd}>
        <Text style={styles.addButtonText}>+ Add New Role</Text>
      </TouchableOpacity>

      <FlatList
        data={roles}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No roles created yet</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Role' : 'Add New Role'}</Text>

            <Text style={styles.label}>Role Name (Urdu)</Text>
            <TextInput
              style={styles.input}
              value={formName}
              onChangeText={setFormName}
              placeholder="e.g. بیورو چیف"
              textAlign="right"
            />

            <Text style={styles.label}>Fee (Rs)</Text>
            <TextInput
              style={styles.input}
              value={formFee}
              onChangeText={setFormFee}
              placeholder="e.g. 6500"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Role Level</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 12 }}>
              {['province', 'district', 'tehsil', 'city'].map(lvl => (
                <TouchableOpacity
                  key={lvl}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: formLevel === lvl ? '#b91c1c' : '#f3f4f6'
                  }}
                  onPress={() => setFormLevel(lvl)}
                >
                  <Text style={{ color: formLevel === lvl ? '#fff' : '#374151', textTransform: 'capitalize' }}>{lvl}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Sort Order</Text>
            <TextInput
              style={styles.input}
              value={formOrder}
              onChangeText={setFormOrder}
              placeholder="0"
              keyboardType="numeric"
            />

            <View style={styles.switchRow}>
              <Text style={styles.label}>Active</Text>
              <Switch
                value={formActive}
                onValueChange={setFormActive}
                trackColor={{ true: '#b91c1c' }}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  addButton: {
    backgroundColor: '#b91c1c',
    margin: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    elevation: 1,
    overflow: 'hidden',
  },
  itemInactive: { opacity: 0.5 },
  itemContent: { flex: 1, padding: 14 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  itemFee: { fontSize: 14, color: '#b91c1c', fontWeight: '600', marginTop: 2 },
  inactiveBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  inactiveBadgeText: { color: '#991b1b', fontSize: 11, fontWeight: '600' },
  deleteBtn: { padding: 14, backgroundColor: '#fef2f2' },
  deleteBtnText: { color: '#ef4444', fontWeight: '600', fontSize: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },
  label: { fontSize: 14, color: '#374151', fontWeight: '500', marginBottom: 4, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3f4f6' },
  cancelBtnText: { color: '#374151', fontWeight: '600' },
  saveBtn: { backgroundColor: '#b91c1c' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
})
