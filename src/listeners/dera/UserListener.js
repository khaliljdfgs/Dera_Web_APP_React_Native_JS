import AsyncStorage from "@react-native-async-storage/async-storage"
import { doc, onSnapshot } from "firebase/firestore"

import ROUTES from "../../config/routes"
import { Firestore } from "../../config/firebase"
import FirebaseErrors from "../../utils/FirebaseErrors"

const UserListener = ({
  currentUser = {},
  navigation = {},
  setCurrentUser = () => { },
  setAlert = () => { },
}) => {
  const userDocRef = doc(Firestore, 'users', currentUser.uid)
  return onSnapshot(userDocRef, async (doc) => {
    const updatedUser = { ...currentUser, ...doc.data() }
    updatedUser.bannerPhotos = updatedUser?.bannerPhotos?.filter((photo) => photo.length > 0)

    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser))
    setCurrentUser(updatedUser)
  }, (error) => {
    const errorCode = error.code
    setAlert({
      message: FirebaseErrors[errorCode] || error.message,
      positiveLabel: 'OK',
      positiveCallback: async () => {
        if (errorCode === 'permission-denied') {
          await AsyncStorage.clear()
          const screen = ROUTES.COMMON.LOGIN
          navigation.reset({ index: 0, routes: [{ name: screen }] })
        }
        setAlert(null)
      }
    })
  })
}

export default UserListener