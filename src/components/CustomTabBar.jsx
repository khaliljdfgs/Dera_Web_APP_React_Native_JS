import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { collection, onSnapshot, or, query, where } from "firebase/firestore"

import COLORS from '../config/colors'
import ROUTES from '../config/routes'
import { Firestore } from "../config/firebase"

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [newChats, setNewChats] = React.useState(false)
  const [newNotifications, setNewNotifications] = React.useState(false)

  const ContainerStyles = {
    flexDirection: 'row',
    backgroundColor: COLORS.COLOR_01,
    height: 64,
    paddingHorizontal: 6,
    alignItems: 'center',
  }

  React.useEffect(() => {
    let __ChatsListenerForIndication = () => { }

    const Setup = async () => {
      const { uid } = JSON.parse(await AsyncStorage.getItem('currentUser'))

      __ChatsListenerForIndication = (() => {
        const chatsQuery = query(
          collection(Firestore, 'chats'),
          or(
            where('sender', '==', uid),
            where('receiver', '==', uid)
          )
        )

        return onSnapshot(chatsQuery, async (querySnapshot) => {
          setNewChats(true)
        }, (error) => {
          console.log(`Chats Listener For Indication Encountered Error: ${error}`)
        })
      })()
    }
    Setup()

    return () => { __ChatsListenerForIndication() }
  }, [])

  React.useEffect(() => {
    let __NotificationsListenerForIndication = () => { }

    const Setup = async () => {
      const { uid } = JSON.parse(await AsyncStorage.getItem('currentUser'))

      __NotificationsListenerForIndication = (() => {
        const notificationsQuery = query(
          collection(Firestore, 'notifications'),
          where('receiver', '==', uid)
        )

        return onSnapshot(notificationsQuery, async (querySnapshot) => {
          setNewNotifications(true)
        }, (error) => {
          console.log(`Notifications Listener For Indication Encountered Error: ${error}`)
        })
      })()
    }
    Setup()

    return () => { __NotificationsListenerForIndication() }
  }, [])

  return (
    <SafeAreaView edges={['bottom']}>
      <Animatable.View animation='fadeInUp' style={ContainerStyles}>
        {
          state.routes.map((route, index) => {
            const { options } = descriptors[route.key]
            const isFocused = state.index === index

            {/* const chatRoute = route.name === ROUTES.DERA.CHATS
              || route.name === ROUTES.CONSUMER.CHATS
              || route.name === ROUTES.DVM.CHATS */}

            {/* const notificationRoute = route.name === ROUTES.DERA.NOTIFICATIONS
              || route.name === ROUTES.CONSUMER.NOTIFICATIONS
              || route.name === ROUTES.DVM.NOTIFICATIONS */}

            const indicator = ((route.name === ROUTES.DERA.CHATS
              || route.name === ROUTES.CONSUMER.CHATS
              || route.name === ROUTES.DVM.CHATS) && newChats && !isFocused)
              || ((route.name === ROUTES.DERA.NOTIFICATIONS
                || route.name === ROUTES.CONSUMER.NOTIFICATIONS
                || route.name === ROUTES.DVM.NOTIFICATIONS) && newNotifications && !isFocused)

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
              if (!isFocused && !event.defaultPrevented)
                navigation.navigate({ name: route.name, merge: true })

              if (
                route.name === ROUTES.CONSUMER.CHATS ||
                route.name === ROUTES.DERA.CHATS ||
                route.name === ROUTES.DVM.CHATS
              ) setNewChats(false)

              if (
                route.name === ROUTES.CONSUMER.NOTIFICATIONS ||
                route.name === ROUTES.DERA.NOTIFICATIONS ||
                route.name === ROUTES.DVM.NOTIFICATIONS
              ) setNewNotifications(false)
            }

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key })
            }

            const styles = { justifyContent: 'center', alignItems: 'center' }
            if (isFocused) {
              styles.flexDirection = 'row'
              styles.backgroundColor = COLORS.COLOR_07
              styles.borderRadius = 25
              styles.marginVertical = 12
              styles.marginHorizontal = 12
              styles.paddingVertical = 6
              styles.paddingHorizontal = 14
              styles.columnGap = 8
            } else { styles.flex = 1 }

            let iconColor = isFocused ? COLORS.COLOR_01 : COLORS.COLOR_07
            if (indicator) iconColor = COLORS.NOTIFICATION_INDICATOR

            return (
              <Animatable.View key={index} style={isFocused ? {} : { flex: 1 }} animation={'fadeIn'} easing='ease-in-out'>
                <TouchableOpacity
                  activeOpacity={0.65}
                  accessibilityRole='button'
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles}>
                  <Animatable.View animation={
                    // isFocused ? 'pulse' : 'zoomIn'
                    indicator
                      ? 'tada'
                      : (isFocused ? 'pulse' : 'zoomIn')
                  } iterationCount={
                    ((
                      route.name === ROUTES.DERA.CHATS ||
                      route.name === ROUTES.CONSUMER.CHATS ||
                      route.name === ROUTES.DVM.CHATS
                    ) && newChats && !isFocused)
                      ||
                      ((
                        route.name === ROUTES.DERA.NOTIFICATIONS ||
                        route.name === ROUTES.CONSUMER.NOTIFICATIONS ||
                        route.name === ROUTES.DVM.NOTIFICATIONS
                      ) && newNotifications && !isFocused)
                      ? 'infinite'
                      : (isFocused ? 'infinite' : 1)
                  } duration={indicator ? 1500 : 1000}>
                    {
                      options.icon.family === 'Ionicons'
                        ? <Ionicons name={options.icon.name} size={25} color={iconColor} />
                        : options.icon.family === 'MaterialCommunityIcons'
                          ? <MaterialCommunityIcons name={options.icon.name} size={25} color={iconColor} />
                          : <></>
                    }
                  </Animatable.View>

                  {
                    isFocused &&
                    <Animatable.View animation='fadeIn'>
                      <Text style={{ fontFamily: 'Ubuntu-Regular', fontSize: 14, color: COLORS.COLOR_01 }}>{options.label}</Text>
                    </Animatable.View>
                  }
                </TouchableOpacity>
              </Animatable.View>
            )
          })
        }
      </Animatable.View>
    </SafeAreaView>
  )
}

export default CustomTabBar