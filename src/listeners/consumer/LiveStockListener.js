import { collection, onSnapshot, or, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"
import { LIVESTOCK_STATUS } from '../../config/values'

const LiveStockListener = ({
  setIsLiveStockLoading = () => { },
  setLiveStockProducts = () => { },
}) => {
  const liveStockQuery = query(
    collection(Firestore, 'livestocks'),
    or(
      where('liveStockStatus', '==', LIVESTOCK_STATUS.SOLD_OUT),
      where('liveStockStatus', '==', LIVESTOCK_STATUS.AVAILABLE),
    )
  )

  return onSnapshot(liveStockQuery, async (querySnapshot) => {
    setIsLiveStockLoading(true)

    const liveStocks = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.owner) liveStocks.push({ ...data, id: doc.id })
    })

    const deraUsersData = JSON.parse(await AsyncStorage.getItem('deraUsers'))

    liveStocks.forEach((liveStock) => {
      const deraUser = deraUsersData.find((user) => user.id === liveStock.owner)
      liveStock.owner = deraUser

      liveStock.liveStockPhotos = liveStock.liveStockPhotos.filter(x => x)
    })

    liveStocks.sort((a, b) => b.owner.distance - a.owner.distance).reverse()

    await AsyncStorage.setItem('liveStocks', JSON.stringify(liveStocks))

    const liveStocksGrid = []
    for (let i = 0; i < liveStocks.length; i += 2) {
      if (i < 4) {
        liveStocksGrid.push(liveStocks.slice(i, i + 2))
      }
    }

    setLiveStockProducts(liveStocksGrid)
    setIsLiveStockLoading(false)
  }, (error) => {
    console.log(`LiveStock Encontered Error: ${error}`)
  })
}

export default LiveStockListener