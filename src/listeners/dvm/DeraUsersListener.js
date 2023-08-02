import { collection, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"
import { ROLES } from "../../config/values"

const DeraUsersListener = ({ }) => {
  const DeraUsersQuery = query(
    collection(Firestore, 'users'),
    where('accountType', '==', ROLES.DERA)
  )

  return onSnapshot(DeraUsersQuery, async (querySnapshot) => {
    const users = []
    querySnapshot.forEach((doc) => {
      users.push({ ...doc.data(), id: doc.id })
    })

    await AsyncStorage.setItem('deraUsers', JSON.stringify(users))
  }, (error) => {
    console.log(`DeraUsers Encountered Error: ${error}`)
  })
}

export default DeraUsersListener 