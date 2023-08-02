import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomLoading from '../../../components/CustomLoading'
import CustomSearch from '../../../components/CustomSearch'
import CustomWideCard from '../../../components/Cards/CustomWideCard'
import NoDataFound from '../../../components/NoDataFound'
import { TAG_CHIP_MODES } from '../../../components/CustomTagChip'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'

const ShowLiveStockScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [search, setSearch] = useState('')

  const [liveStocksData, setLiveStocksData] = useState([])
  const [originalData, setOriginalData] = useState([])

  const GetData = async () => {
    setIsLoading('Loading...')

    const loadedData = await JSON.parse(await AsyncStorage.getItem('liveStocks'))
    // To Sort Our Data By createdAt Date, After That The Latest Data Will Be On Top
    // loadedData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)

    setLiveStocksData(loadedData)
    setOriginalData(loadedData)

    setIsLoading(null)
  }

  useEffect(() => { GetData() }, [])

  const HandleSearch = () => {
    if (search === '') return

    const filteredData = originalData.filter((item) => {
      const price = item.liveStockPrice + ''
      const query = search.toLowerCase().trim()

      return price.toLowerCase().includes(query)
        || item.liveStockTitle.toLowerCase().includes(query)
        || item.liveStockDescription.toLowerCase().includes(query)
        || item.liveStockCategory.toLowerCase().includes(query)
        || item.liveStockStatus.toLowerCase().includes(query)
        || item.liveStockFeatures?.breed?.toLowerCase().includes(query)
        || item.liveStockFeatures.color.toLowerCase().includes(query)
    })

    setLiveStocksData(filteredData)
  }

  const HandleOnPress = (item) => {
    const payload = { liveStock: item }
    navigation.navigate(ROUTES.CONSUMER.VIEW_LIVESTOCK, payload)
  }

  const RenderListEmptyComponent = () => (
    <Text style={{
      textAlign: 'center',
      fontSize: 18,
      fontFamily: 'NunitoSans-SemiBoldItalic',
      color: COLORS.COLOR_04,
      marginTop: 8,
    }}>No Record Found!</Text>
  )

  const RenderListItem = ({ item }) => {
    const photoURL = item.liveStockPhotos.filter((photo) => photo)[0]
    return (
      <CustomWideCard
        title={item.liveStockTitle}
        imageUri={photoURL}
        chipText={item.liveStockStatus}
        onPress={() => HandleOnPress(item)}
        chipMode={TAG_CHIP_MODES.DEFAULT}
        details={[
          {
            icon: <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />,
            value: item.liveStockFeatures.breed
              ? `${item.liveStockFeatures.breed} - ${item.liveStockCategory}`
              : item.liveStockCategory
          },
          {
            // icon: <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />,
            value: `Rs. ${item.liveStockPrice}`
          },
        ]}
      />
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Show Livestocks' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  if (originalData.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Show Livestocks' onGoBack={() => navigation.goBack()} />
        <NoDataFound message='No Livestock Found!' />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
      {
        // If alert has a value, return our alert dialog
        alert &&
        <CustomAlertDialog
          title={alert.title || 'Warning'}
          message={alert.message}
          positiveLabel={alert.positiveLabel || 'OK'}
          positiveCallback={alert.positiveCallback}
          negativeLabel={alert.negativeLabel || 'Cancel'}
          negativeCallback={alert.negativeCallback}
        />
      }

      <CustomAppBar title='Show Livestocks' onGoBack={() => navigation.goBack()} />

      <CustomSearch
        placeholder='Search Livestocks'
        search={search}
        setSearch={setSearch}
        handleSearch={HandleSearch}
        onRightIconPress={() => {
          setSearch('')
          setLiveStocksData(originalData)
        }}
      />

      {
        liveStocksData?.length
          ?
          <FlashList
            data={liveStocksData}
            renderItem={RenderListItem}
            estimatedItemSize={199}
            ListEmptyComponent={RenderListEmptyComponent}
            ListHeaderComponent={<View style={{ padding: 6 }} />}
            ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
          :
          <NoDataFound message='No Livestock Found!' />
      }
    </SafeAreaView>
  )
}

export default ShowLiveStockScreen

const styles = StyleSheet.create({}) 