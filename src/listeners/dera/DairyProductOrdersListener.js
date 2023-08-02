import { collection, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"

const DairyProductOrdersListener = ({
  currentUser = {},
}) => {
  const DairyProductOrdersQuery = query(
    collection(Firestore, 'dairyProductOrders'),
    where('owner', '==', currentUser.uid)
  )

  return onSnapshot(DairyProductOrdersQuery, async (querySnapshot) => {
    const dairyProductOrders = []
    querySnapshot.forEach((doc) => {
      dairyProductOrders.push({ ...doc.data(), id: doc.id })
    })

    await AsyncStorage.setItem('dairyProductOrders', JSON.stringify(dairyProductOrders))
  }, (error) => {
    console.log(`DairyProductOrders Encountered Error: ${error}`)
  })
}

export default DairyProductOrdersListener