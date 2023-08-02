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
    const servicesData = JSON.parse(await AsyncStorage.getItem('services'))

    loadedData.forEach((item) => {
      const createdAtDate = new Timestamp(item.timestamp?.seconds, item.timestamp?.nanoseconds).toDate()

      item.info = {
        createdAt: {
          time: moment(createdAtDate).format('hh:mm A'),
          date: moment(createdAtDate).format('DD/MM/YYYY'),
        }
      }

      if (item.type === NOTIFICATION_TYPES.SERVICE_AVAILMENT) {
        item.details = servicesData.find((service) => service.id === item.serviceId)
        item.user = deraUsersData.find((user) => user.id === item.sender)
        if (!item.user || !item.details) return

        item.info.title = 'Service Availment'
        item.info.message = `${item.user.businessName} has requested to avail your service titled as "${item.details.serviceTitle}".`
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

      if (!loadedData[i] || !loadedData[i].details || !loadedData[i].user || !loadedData[i].info) {
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