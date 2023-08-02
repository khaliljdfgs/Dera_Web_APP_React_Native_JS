import AsyncStorage from "@react-native-async-storage/async-storage"
import { collection, onSnapshot } from "firebase/firestore"

import { Firestore } from "../../config/firebase"

const ConfigsListener = () => {
  const configsCollection = collection(Firestore, 'configs')

  return onSnapshot(configsCollection, async (querySnapshot) => {
    const configs = {}
    querySnapshot.forEach((doc) => {
      configs[doc.id] = doc.data()
    })

    configs.dvm.bannerPhotos = configs?.dvm?.bannerPhotos?.filter((photo) => photo.length > 0)

    await AsyncStorage.setItem('configs', JSON.stringify(configs))
  }, (error) => {
    console.log(`Configs Encountered Error: ${error}`)
  })
}

export default ConfigsListener