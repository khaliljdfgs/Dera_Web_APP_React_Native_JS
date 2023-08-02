import { doc, onSnapshot } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import ROUTES from "../../config/routes"
import { Firestore } from "../../config/firebase"
import FirebaseErrors from "../../utils/FirebaseErrors"

const UserListener = ({
  currentUser = {},
  setCurrentUser = () => { },
  setAlert = () => { },
  navigation = {},
}) => {
  const userDocRef = doc(Firestore, 'users', currentUser.uid)

  return onSnapshot(userDocRef, async (doc) => {
    const updatedUser = { ...currentUser, ...doc.data() }
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser))

    setCurrentUser(updatedUser)
  }, (error) => {
    console.log(`User Listener Error: ${error}`)
    const errorCode = error.code

    setAlert({
      message: FirebaseErrors[errorCode] || error.message,
      positiveLabel: 'OK',
      positiveCallback: async () => {
        if (errorCode === 'permission-denied') {
          const ENDPOINT = await AsyncStorage.getItem('demo_url') || ''
          await AsyncStorage.clear()
          await AsyncStorage.setItem('demo_url', ENDPOINT)
          const screen = ROUTES.COMMON.LOGIN
          navigation.reset({ index: 0, routes: [{ name: screen }] })
        }
        setAlert(null)
      }
    })
  })
}

export default UserListener