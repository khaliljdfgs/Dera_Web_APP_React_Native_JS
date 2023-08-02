import { Timestamp, collection, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import moment from "moment"
import * as Notifications from 'expo-notifications'

import { Firestore } from "../../config/firebase"
import { NOTIFICATION_TYPES } from "../../config/values"

const PrepareNotification = async ({
  title = '',
  body = '',
}) => {
  await Notifications.cancelAllScheduledNotificationsAsync()
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true
    },
    trigger: null,
  })
}

const NotificationsListener = ({
  currentUser = {},
  setNotificationsData = () => { },
  setIsLoading = () => { }
}) => {
  setIsLoading('Loading...')

  const notificationsQuery = query(
    collection(Firestore, 'notifications'),
    where('receiver', '==', currentUser.uid)
  )

  return onSnapshot(notificationsQuery, async (querySnapshot) => {
    const loadedData = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      loadedData.push({ id: doc.id, ...data })
    })

    loadedData.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)

    const deraUsersData = JSON.parse(await AsyncStorage.getItem('deraUsers'))
    const dairyProductsData = JSON.parse(await AsyncStorage.getItem('dairyProducts'))
    const liveStocksData = JSON.parse(await AsyncStorage.getItem('liveStocks'))

    loadedData.forEach((item) => {
      const createdAtDate = new Timestamp(item.timestamp?.seconds, item.timestamp?.nanoseconds).toDate()

      item.info = {
        createdAt: {
          time: moment(createdAtDate).format('hh:mm A'),
          date: moment(createdAtDate).format('DD/MM/YYYY'),
        }
      }

      item.details = dairyProductsData?.find((product) => product.id === item.productId) || {}
      item.user = deraUsersData?.find((user) => user.id === item.sender)
      item.details.image = item.details?.productImage

      if ((!item.user || !item.details) && item.type !== NOTIFICATION_TYPES.ADMIN_NOTIFICATION) return

      if (item.type === NOTIFICATION_TYPES.DAIRY_ORDER_CONFIRMED) {
        item.info.title = 'Order Confirmed'
        item.info.message = `${item.user.businessName} has confirmed your order for the dairy product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.DAIRY_ORDER_REJECTED) {
        item.info.title = 'Order Rejected'
        item.info.message = `${item.user.businessName} has rejected your order for the dairy product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.DAIRY_ORDER_CANCELLED) {
        item.info.title = 'Order Cancelled'
        item.info.message = `${item.user.businessName} has cancelled your order for the dairy product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.DAIRY_ORDER_DELIVERED) {
        item.info.title = 'Order Delivered'
        item.info.message = `${item.user.businessName} has delivered your order for the dairy product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_ACCEPTED) {
        item.info.title = 'Subscription Accepted'
        item.info.message = `${item.user.businessName} has accepted your subscription request for the dairy product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_CANCELLED) {
        item.info.title = 'Subscription Cancelled'
        item.info.message = `${item.user.businessName} has cancelled your subscription for the dairy product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REJECTED) {
        item.info.title = 'Subscription Rejected'
        item.info.message = `${item.user.businessName} has rejected your subscription request for the dairy product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_DELIVERED) {
        item.info.title = 'Subscription Delivered'
        item.info.message = `${item.user.businessName} has delivered your subscription for the dairy product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.LIVESTOCK_SOLD_OUT) {
        item.details = liveStocksData?.find((livestock) => livestock.id === item.liveStockId)
        item.info.title = 'Livestock Sold Out'
        item.info.message = `${item.user.businessName} has sold out the livestock titled as "${item.details.liveStockTitle}" to you.`
        item.details.image = item.details.liveStockPhotos.filter((photo) => photo !== '')[0]
      } else if (item.type === NOTIFICATION_TYPES.ADMIN_NOTIFICATION) {
        item.details = {
          image: item.photo,
          readMore: item.readMore,
        }
        item.info.title = item.title
        item.info.message = item.content
      }
    })

    if (loadedData.length > 0) {
      await PrepareNotification({
        title: loadedData[0]?.info.title,
        body: loadedData[0]?.info.message,
      })
    }

    for (let i = 0; i < loadedData.length; i++) {
      if (loadedData[i].type === NOTIFICATION_TYPES.ADMIN_NOTIFICATION) continue

      if (!loadedData[i] || !loadedData[i].details || !loadedData[i].info || !loadedData[i].user) {
        loadedData.splice(i, 1)
        i--
      }
    }

    setNotificationsData(loadedData)
    setIsLoading(null)
  }, (error) => {
    console.log(`Notifications Listener Error: ${error}`)
  })
}

export default NotificationsListener