import { collection, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"
import { DAIRY_PRODUCT_ORDER_STATUS, DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS } from "../../config/values"

const ScheduleListener = ({
  currentUser = {},
  Setup = () => { }
}) => {
  const ScheduleQuery = query(
    collection(Firestore, 'dairyProductOrders'),
    where('placedBy', '==', currentUser.uid),
    where('status', 'in', [
      DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.CONFIRMED,
      DAIRY_PRODUCT_ORDER_STATUS.CONFIRMED
    ])
  )

  return onSnapshot(ScheduleQuery, async (querySnapshot) => {
    const dairyProductOrders = []
    querySnapshot.forEach((doc) => {
      dairyProductOrders.push({ id: doc.id, ...doc.data() })
    })

    await AsyncStorage.setItem('schedules', JSON.stringify(dairyProductOrders))
    await Setup()
  }, (error) => {
    console.log(`ScheduleListener Encountered Error: ${error}`)
  })
}

export default ScheduleListener