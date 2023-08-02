import { collection, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"

const DairyProductsListener = ({
  currentUser = {},
  setIsDairyProductsLoading = () => { },
  setDairyProducts = () => { },
}) => {
  const dairyProductQuery = query(
    collection(Firestore, 'products'),
    where('owner', '==', currentUser.uid)
  )

  return onSnapshot(dairyProductQuery, async (querySnapshot) => {
    setIsDairyProductsLoading(true)

    const dairyProducts = []
    querySnapshot.forEach((doc) => {
      dairyProducts.push({ ...doc.data(), id: doc.id })
    })

    await AsyncStorage.setItem('dairyProducts', JSON.stringify(dairyProducts))

    const dairyProductsGrid = []
    for (let i = 0; i < dairyProducts.length; i += 2) {
      if (i < 4) {
        dairyProductsGrid.push(dairyProducts.slice(i, i + 2))
      }
    }

    setDairyProducts(dairyProductsGrid)
    setIsDairyProductsLoading(false)
  }, (error) => {
    console.log(`DairyProducts Encontered Error: ${error}`)
  })
}

export default DairyProductsListener