import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomLoading from '../../../components/CustomLoading'
import CustomSearch from '../../../components/CustomSearch'
import CustomWideSlimCard from '../../../components/Cards/CustomWideSlimCard'
import NoDataFound from '../../../components/NoDataFound'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'

const ShowDairyProductScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [search, setSearch] = useState('')

  const [productsData, setProductsData] = useState([])
  const [originalData, setOriginalData] = useState([])

  const GetData = async () => {
    setIsLoading('Loading...')

    const loadedData = JSON.parse(await AsyncStorage.getItem('dairyProducts'))
    // To Sort Our Data By createdAt Date, After That The Latest Data Will Be On Top
    // loadedData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)

    setProductsData(loadedData)
    setOriginalData(loadedData)

    setIsLoading(null)
  }

  useEffect(() => { GetData() }, [])

  const HandleSearch = () => {
    if (search === '') return

    const filteredData = originalData.filter((item) => {
      const price = item.productPrice + ''
      const query = search.toLowerCase().trim()

      return item.productName.toLowerCase().includes(query)
        || item.productCategory.toLowerCase().includes(query)
        || price.toLowerCase().includes(query)
    })

    setProductsData(filteredData)
  }

  const HandleOnPress = (item) => {
    const payload = { product: item }
    navigation.navigate(ROUTES.CONSUMER.VIEW_DAIRY_PRODUCT, payload)
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
    return (
      <CustomWideSlimCard
        title={item.productName}
        imageUri={item.productImage}
        details={[
          {
            // icon: <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />,
            // value: `${item.productPrice} / ${item.priceUnit}`
            value: `Rs. ${item.productPrice} / ${item.priceUnit}`
          },
          {
            icon: <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />,
            value: item.productCategory
          },
          {
            icon: <Ionicons name='person' size={16} color={COLORS.COLOR_01} />,
            value: item.owner?.businessName || item.owner?.fullName
          },
          {
            icon: <FontAwesome5 name='location-arrow' size={12} color={COLORS.COLOR_01} />,
            value: item.owner?.distanceString,
            containterStyle: { gap: 9 }
          },
        ]}
        onPress={() => HandleOnPress(item)}
      />
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Show Dairy Product' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  if (originalData.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Show Dairy Products' onGoBack={() => navigation.goBack()} />
        <NoDataFound />
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

      <CustomAppBar title='Show Dairy Products' onGoBack={() => navigation.goBack()} />

      <CustomSearch
        placeholder='Search Dairy Products'
        search={search}
        setSearch={setSearch}
        handleSearch={HandleSearch}
        onRightIconPress={() => {
          setSearch('')
          setProductsData(originalData)
        }}
      />

      {
        productsData?.length > 0
          ?
          <FlashList
            data={productsData}
            renderItem={RenderListItem}
            estimatedItemSize={122}
            ListEmptyComponent={RenderListEmptyComponent}
            ListHeaderComponent={<View style={{ padding: 6 }} />}
            ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
          :
          <NoDataFound message='No Dairy Product Found!' />
      }
    </SafeAreaView>
  )
}

export default ShowDairyProductScreen

const styles = StyleSheet.create({})