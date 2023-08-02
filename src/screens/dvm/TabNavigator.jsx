import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useFonts } from 'expo-font'

import HomeScreen from './HomeScreen'
import AppointmentsScreen from './Appointments/AppointmentsScreen'
import ChatsScreen from './ChatsScreen'
import NotificationsScreen from './NotificationsScreen'
import SettingsScreen from './Settings/SettingsScreen'

import CustomTabBar from '../../components/CustomTabBar'

import ROUTES from '../../config/routes'
import FONTS from '../../config/fonts'

const DVMTabNavigator = ({ navigation }) => {
  const Tab = createBottomTabNavigator()

  const [fontsLoaded] = useFonts(FONTS)
  if (!fontsLoaded) return (<></>)

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>

      <Tab.Screen
        name={ROUTES.DVM.HOME}
        component={HomeScreen}
        options={{
          icon: { name: 'home', family: 'Ionicons' },
          label: 'Home'
        }} />

      <Tab.Screen
        name={ROUTES.DVM.APPOINTMENTS}
        component={AppointmentsScreen}
        options={{
          icon: { name: 'calendar-clock', family: 'MaterialCommunityIcons' },
          label: 'Appointments'
        }} />

      <Tab.Screen
        name={ROUTES.DVM.CHATS}
        component={ChatsScreen}
        options={{
          icon: { name: 'chatbubble-ellipses', family: 'Ionicons' },
          label: 'Chats'
        }} />

      <Tab.Screen
        name={ROUTES.DVM.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          icon: { name: 'notifications', family: 'Ionicons' },
          label: 'Notifications'
        }} />

      <Tab.Screen
        name={ROUTES.DVM.SETTINGS}
        component={SettingsScreen}
        options={{
          icon: { name: 'md-settings-sharp', family: 'Ionicons' },
          label: 'Settings'
        }} />

    </Tab.Navigator>
  )
}

export default DVMTabNavigator