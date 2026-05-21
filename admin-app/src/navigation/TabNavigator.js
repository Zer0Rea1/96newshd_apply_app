import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import DashboardScreen from '../screens/DashboardScreen'
import PaymentsScreen from '../screens/PaymentsScreen'
import UsersScreen from '../screens/UsersScreen'
import RolesScreen from '../screens/RolesScreen'
import NotificationsScreen from '../screens/NotificationsScreen'

const Tab = createBottomTabNavigator()

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#b91c1c',
        tabBarInactiveTintColor: '#9ca3af',
        headerStyle: { backgroundColor: '#b91c1c' },
        headerTintColor: '#fff',
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Roles" component={RolesScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
    </Tab.Navigator>
  )
}
