import { collection, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"

const LiveStockListener = ({
  currentUser = {},
  setIsLiveStockLoading = () => { },
  setLiveStockProducts = () => { },
}) => {
  const liveStockQuery = query(
    collection(Firestore, 'livestocks'),
    where('owner', '==', currentUser.uid)
  )

  return onSnapshot(liveStockQuery, async (querySnapshot) => {
    setIsLiveStockLoading(true)

    const liveStocks = []
    querySnapshot.forEach((doc) => {
      liveStocks.push({ ...doc.data(), id: doc.id })
    })

    const consumerUsersData = JSON.parse(await AsyncStorage.getItem('consumerUsers'))

    liveStocks.forEach(liveStock => {
      if (liveStock.soldOutTo) {
        const buyer = consumerUsersData?.filter(x => x.id === liveStock.soldOutTo)[0]
        liveStock.soldOutToString = `${buyer?.fullname} - ${buyer?.address}`
      }
    })

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