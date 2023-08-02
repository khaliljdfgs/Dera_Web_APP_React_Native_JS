import { collection, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"
import { ROLES } from "../../config/values"

const DvmUsersListener = ({ }) => {
  const DvmUsersQuery = query(
    collection(Firestore, 'users'),
    where('accountType', '==', ROLES.DVM)
  )

  return onSnapshot(DvmUsersQuery, async (querySnapshot) => {
    const users = []
    querySnapshot.forEach((doc) => {
      users.push({ ...doc.data(), id: doc.id })
    })

    await AsyncStorage.setItem('dvmUsers', JSON.stringify(users))
  }, (error) => {
    console.log(`DvmUsers Encountered Error: ${error}`)
  })
}

export default DvmUsersListener