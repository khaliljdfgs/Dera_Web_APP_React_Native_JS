import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useFonts } from 'expo-font'

import HomeScreen from './HomeScreen'
import ChatsScreen from './ChatsScreen'
import NotificationsScreen from './NotificationsScreen'
import SettingsScreen from './Settings/SettingsScreen'
import SchedulesScreen from './SchedulesScreen'

import CustomTabBar from '../../components/CustomTabBar'

import ROUTES from '../../config/routes'
import FONTS from '../../config/fonts'

const ConsumerTabNavigator = ({ navigation }) => {
  const Tab = createBottomTabNavigator()

  const [fontsLoaded] = useFonts(FONTS)
  if (!fontsLoaded) return (<></>)

  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>

      <Tab.Screen
        name={ROUTES.CONSUMER.HOME}
        component={HomeScreen}
        options={{
          icon: { name: 'home', family: 'Ionicons' },
          label: 'Home'
        }} />

      <Tab.Screen
        name={ROUTES.CONSUMER.SCHEDULES}
        component={SchedulesScreen}
        options={{
          icon: { name: 'calendar-clock', family: 'MaterialCommunityIcons' },
          label: 'Schedules'
        }} />

      <Tab.Screen
        name={ROUTES.CONSUMER.CHATS}
        component={ChatsScreen}
        options={{
          icon: { name: 'chatbubble-ellipses', family: 'Ionicons' },
          label: 'Chats'
        }} />

      <Tab.Screen
        name={ROUTES.CONSUMER.NOTIFICATIONS}
        component={NotificationsScreen}
        options={{
          icon: { name: 'notifications', family: 'Ionicons' },
          label: 'Notifications'
        }} />

      <Tab.Screen
        name={ROUTES.CONSUMER.SETTINGS}
        component={SettingsScreen}
        options={{
          icon: { name: 'md-settings-sharp', family: 'Ionicons' },
          label: 'Settings'
        }} />

    </Tab.Navigator>
  )
}

export default ConsumerTabNavigator