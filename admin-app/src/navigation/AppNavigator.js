import React, { useContext } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { AdminAuthContext } from '../context/AdminAuthContext'
import LoginScreen from '../screens/LoginScreen'
import TabNavigator from './TabNavigator'
import UserDetailScreen from '../screens/UserDetailScreen'
import { ActivityIndicator, View } from 'react-native'

const Stack = createStackNavigator()

export default function AppNavigator() {
  const { admin, loading } = useContext(AdminAuthContext)

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#b91c1c" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {admin ? (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="UserDetail"
              component={UserDetailScreen}
              options={{ headerShown: true, title: 'User Detail', headerTintColor: '#b91c1c' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
