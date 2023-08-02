import { collection, onSnapshot } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"

const DairyProductsListener = ({
  setIsDairyProductsLoading = () => { },
  setDairyProducts = () => { },
}) => {
  return onSnapshot(collection(Firestore, 'products'), async (querySnapshot) => {
    setIsDairyProductsLoading(true)

    const dairyProducts = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.owner) dairyProducts.push({ ...data, id: doc.id })
    })

    const deraUsersData = JSON.parse(await AsyncStorage.getItem('deraUsers'))

    dairyProducts.forEach((product) => {
      const deraUser = deraUsersData.find((user) => user.id === product.owner)
      product.owner = deraUser
    })

    dairyProducts.sort((a, b) => b.owner.distance - a.owner.distance).reverse()

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