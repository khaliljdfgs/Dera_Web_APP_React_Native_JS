import { collection, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { ROLES } from "../../config/values"
import { Firestore } from "../../config/firebase"
import { GetDistance } from "../../utils/Helpers"

const ConsumerUsersListener = ({
  currentUser = {},
}) => {
  const ConsumerUsersQuery = query(
    collection(Firestore, 'users'),
    where('accountType', '==', ROLES.CONSUMER)
  )

  return onSnapshot(ConsumerUsersQuery, async (querySnapshot) => {
    const users = []
    querySnapshot.forEach((doc) => {
      users.push({ ...doc.data(), id: doc.id })
    })

    users.forEach((user) => {
      const distance = GetDistance(
        { latitude: currentUser.geoLocation?.latitude, longitude: currentUser.geoLocation?.longitude },
        { latitude: user.geoLocation?.latitude, longitude: user.geoLocation?.longitude }
      )

      user.distance = distance
      user.distanceString = distance < 1000 ? `${distance.toFixed(2)} m` : `${(distance / 1000).toFixed(2)} km`
    })

    await AsyncStorage.setItem('consumerUsers', JSON.stringify(users))
  }, (error) => {
    console.log(`consumerUsers Encountered Error: ${error}`)
  })
}

export default ConsumerUsersListener