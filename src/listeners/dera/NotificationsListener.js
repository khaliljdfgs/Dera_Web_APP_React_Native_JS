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

    const dvmUsersData = JSON.parse(await AsyncStorage.getItem('dvmUsers'))
    const consumerUsersData = JSON.parse(await AsyncStorage.getItem('consumerUsers'))
    const servicesData = JSON.parse(await AsyncStorage.getItem('services'))
    const dairyProductsData = JSON.parse(await AsyncStorage.getItem('dairyProducts'))
    const dairyProductOrdersData = JSON.parse(await AsyncStorage.getItem('dairyProductOrders'))
    const liveStocks = JSON.parse(await AsyncStorage.getItem('liveStocks'))

    loadedData.forEach((item) => {
      const createdAtDate = new Timestamp(item.timestamp?.seconds, item.timestamp?.nanoseconds).toDate()

      item.info = {
        createdAt: {
          time: moment(createdAtDate).format('hh:mm A'),
          date: moment(createdAtDate).format('DD/MM/YYYY'),
        }
      }

      if (item.type === NOTIFICATION_TYPES.SERVICE_CANCELLED) {
        item.details = servicesData?.find((service) => service.id === item.serviceId)
        item.user = dvmUsersData?.find((user) => user.id === item.sender)
        if (!item.user || !item.details) return

        item.details.image = item.details.serviceImage

        item.info.title = 'Service Cancelled'
        item.info.message = `${item.user.fullname} has cancelled your request for the service titled as "${item.details.serviceTitle}".`
      } else if (item.type === NOTIFICATION_TYPES.SERVICE_ACCEPTED) {
        item.details = servicesData?.find((service) => service.id === item.serviceId)
        item.user = dvmUsersData?.find((user) => user.id === item.sender)
        if (!item.user || !item.details) return

        item.details.image = item.details.serviceImage

        item.info.title = 'Service Accepted'
        item.info.message = `${item.user.fullname} has accepted your request for the service titled as "${item.details.serviceTitle}".`
      } else if (item.type === NOTIFICATION_TYPES.SERVICE_COMPLETED) {
        item.details = servicesData?.find((service) => service.id === item.serviceId)
        item.user = dvmUsersData?.find((user) => user.id === item.sender)
        if (!item.user || !item.details) return

        item.details.image = item.details.serviceImage

        item.info.title = 'Service Completed'
        item.info.message = `${item.user.fullname} has marked your appointment as completed, for the service titled as "${item.details.serviceTitle}".`
      } else if (item.type === NOTIFICATION_TYPES.DAIRY_ORDER_PLACED) {
        item.details = dairyProductsData?.find((product) => product.id === item.productId)
        item.user = consumerUsersData?.find((user) => user.id === item.sender)
        item.order = dairyProductOrdersData?.find((order) => order.id === item.orderId)
        if (!item.user || !item.details || !item.order) return

        item.details.image = item.details.productImage

        item.info.title = 'Order Placed'
        item.info.message = `${item.user.fullname} has placed an order for the product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.DAIRY_PRODUCT_SUBSCRIPTION_REQUEST) {
        item.details = dairyProductsData?.find((product) => product.id === item.productId)
        item.user = consumerUsersData?.find((user) => user.id === item.sender)
        item.order = dairyProductOrdersData?.find((order) => order.id === item.orderId)
        if (!item.user || !item.details || !item.order) return

        item.details.image = item.details.productImage

        item.info.title = 'Subscription Request'
        item.info.message = `${item.user.fullname} has requested to subscribe to the product titled as "${item.details.productName}".`
      } else if (item.type === NOTIFICATION_TYPES.ADMIN_NOTIFICATION) {
        item.details = {
          image: item.photo,
          readMore: item.readMore,
        }
        item.info.title = item.title
        item.info.message = item.content
      } else if (item.type === NOTIFICATION_TYPES.LIVESTOCK_REJECTED) {
        item.details = liveStocks?.find((livestock) => livestock.id === item.livestockId)
        item.info.title = item.title || 'Livestock Rejected'
        item.info.message = item.content || 'Your livestock listing has been rejected by the system.'
        if (item.details) item.details.image = item.details.liveStockPhotos.filter((photo) => photo !== '')[0]
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
      else if (loadedData[i].type === NOTIFICATION_TYPES.LIVESTOCK_REJECTED) {
        if (!loadedData[i] || !loadedData[i].details || !loadedData[i].info) {
          loadedData.splice(i, 1)
          i--
        }
      } else if (!loadedData[i] || !loadedData[i].details || !loadedData[i].user || !loadedData[i].order || !loadedData[i].info) {
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