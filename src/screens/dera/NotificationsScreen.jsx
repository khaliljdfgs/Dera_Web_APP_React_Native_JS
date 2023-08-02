import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'

import CustomAlertDialog from '../../components/CustomAlertDialog'
import CustomLoading from '../../components/CustomLoading'
import CustomAppBar from '../../components/CustomAppBar'
import NoDataFound from '../../components/NoDataFound'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'
import { NOTIFICATION_TYPES } from '../../config/values'

import NotificationsListener from '../../listeners/dera/NotificationsListener'

const NotificationsScreen = ({ navigation }) => {
  const [alert, setAlert] = useState(null)
  const [isLoading, setIsLoading] = useState(null)

  const [notificationsData, setNotificationsData] = useState([])

  useEffect(() => {
    let __NotificationsListener = () => { }

    const Setup = async () => {
      const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
      __NotificationsListener = NotificationsListener({ currentUser, setNotificationsData, setIsLoading })
    }

    Setup()
    return () => __NotificationsListener()
  }, [])

  useFocusEffect(React.useCallback(() => {
    const Setup = async () => {
      const dairyProductOrdersData = JSON.parse(await AsyncStorage.getItem('dairyProductOrders'))
      // const services = JSON.parse(await AsyncStorage.getItem('services'))

      notificationsData.forEach((item) => {
        if (item.type === NOTIFICATION_TYPES.DAIRY_ORDER_PLACED ||
          item.type === NOTIFICATION_TYPES.DAIRY_ORDER_CANCELLED ||
          item.type === NOTIFICATION_TYPES.DAIRY_ORDER_CONFIRMED ||
          item.type === NOTIFICATION_TYPES.DAIRY_ORDER_DELIVERED ||
          item.type === NOTIFICATION_TYPES.DAIRY_ORDER_REJECTED ||
          item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REQUEST ||
          item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_CANCELLED ||
          item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REJECTED ||
          item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_ACCEPTED ||
          item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_DELIVERED
        ) {
          const dairyProductOrder = dairyProductOrdersData.find((order) => order.id === item.orderId)
          if (dairyProductOrder) item.order = dairyProductOrder
        }
      })
      setNotificationsData(notificationsData)
    }

    Setup()
  }))

  const HandleOnPress = async (item) => {
    if (item.type === NOTIFICATION_TYPES.ADMIN_NOTIFICATION) {
      navigation.navigate(ROUTES.COMMON.ADMIN_NOTIFICATION, { data: item })
      return
    }

    if (item.type === NOTIFICATION_TYPES.LIVESTOCK_REJECTED) {
      navigation.navigate(ROUTES.DERA.VIEW_LIVESTOCK, {
        liveStock: item.details,
        fromSoldOut: true,
        fromNotification: true,
        info: item.info,
      })
      return
    }

    navigation.navigate(ROUTES.DERA.NOTIFICATION_DETAILS, { data: item })
  }

  const RenderListEmptyComponent = () => (
    <Text style={{
      textAlign: 'center',
      fontSize: 18,
      fontFamily: 'NunitoSans-SemiBoldItalic',
      color: COLORS.COLOR_04,
      marginTop: 8,
      paddingVertical: 16,
    }}>No Notification Found!</Text>
  )

  const RenderListItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.65}
        onPress={() => HandleOnPress(item)}>
        <Image source={{ uri: item.details?.image }}
          style={{ width: 48, height: 48, borderRadius: 25, alignSelf: 'flex-start' }} />
        <View style={{ flex: 1 }} >
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}
            numberOfLines={1} ellipsizeMode='tail'>
            {item.info.title}
          </Text>

          <Text style={{ fontSize: 14, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_01 }}
            numberOfLines={3} ellipsizeMode='tail'>
            {item.info.message}
          </Text>
        </View>
        <View style={{ gap: 4, alignItems: 'flex-end', alignSelf: 'flex-start' }} >
          <Text style={{ fontSize: 12, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_01 }}
            numberOfLines={1} ellipsizeMode='tail'>
            {item.info.createdAt.time}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_01 }}
            numberOfLines={1} ellipsizeMode='tail'>
            {item.info.createdAt.date}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Notifications' onGoBack={null} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
      {
        alert &&
        <CustomAlertDialog
          title={alert.title || 'Warning'}
          message={alert.message}
          positiveLabel={alert.positiveLabel || 'OK'}
          positiveCallback={alert.positiveCallback}
          negativeLabel={alert.negativeLabel || 'Cancel'}
          negativeCallback={alert.negativeCallback}
        />
      }

      <CustomAppBar title='Notifications' onGoBack={null} />

      {
        notificationsData?.length
          ?
          <FlashList
            data={notificationsData}
            renderItem={RenderListItem}
            estimatedItemSize={156}
            ListEmptyComponent={RenderListEmptyComponent}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: `${COLORS.COLOR_01}25` }} />}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />

          :
          <NoDataFound message='No Notification Found!' />
      }

    </SafeAreaView>
  )
}

export default NotificationsScreen

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: `${COLORS.COLOR_01}10`,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
})