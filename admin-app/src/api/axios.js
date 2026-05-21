import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'

const api = axios.create({ baseURL: Constants.expoConfig.extra.apiUrl + '/api' })

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('adminToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api
