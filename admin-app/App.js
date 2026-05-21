import React, { useEffect, useContext } from 'react'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { AdminAuthProvider, AdminAuthContext } from './src/context/AdminAuthContext'
import AppNavigator from './src/navigation/AppNavigator'
import api from './src/api/axios'

const isExpoGo = Constants.appOwnership === 'expo'

let Notifications = null
if (!isExpoGo) {
  Notifications = require('expo-notifications')
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })
}

async function registerForPushNotificationsAsync() {
  if (!Notifications) return

  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices')
    return
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission denied')
    return
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data
  console.log('Expo push token:', token)
  await api.patch('/auth/push-token', { token })
}

function AppContent() {
  const { admin } = useContext(AdminAuthContext)

  useEffect(() => {
    if (admin) {
      registerForPushNotificationsAsync()
    }

    if (!Notifications) return

    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data
      if (data.type === 'new_application') {
        // Navigation handled by the navigator
      }
    })

    return () => sub.remove()
  }, [admin])

  return <AppNavigator />
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AppContent />
    </AdminAuthProvider>
  )
}
