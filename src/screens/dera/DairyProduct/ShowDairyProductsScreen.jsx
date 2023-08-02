import React, { useState, useEffect, useCallback } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import { doc, deleteDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import { deleteObject, ref } from 'firebase/storage'
import { MaterialIcons } from '@expo/vector-icons'
import axios from 'axios'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomLoading from '../../../components/CustomLoading'
import CustomSearch from '../../../components/CustomSearch'
import CustomWideSlimCard from '../../../components/Cards/CustomWideSlimCard'
import NoDataFound from '../../../components/NoDataFound'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { Firestore, Storage } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'
import { SERVER_URL } from '../../../config/values'

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
    loadedData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)

    setProductsData(loadedData)
    setOriginalData(loadedData)

    setIsLoading(null)
  }

  const Refresh = async () => {
    const isDataChanged = await AsyncStorage.getItem('EditDairyProductDataChanged')
    const isDataAdded = await AsyncStorage.getItem('AddDairyProductDataAdded')

    if (isDataChanged === 'true' || isDataAdded === 'true') {
      GetData()
      await AsyncStorage.removeItem('EditDairyProductDataChanged')
      await AsyncStorage.removeItem('AddDairyProductDataAdded')
    }
  }

  useFocusEffect(useCallback(() => { Refresh() }, []))

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
    navigation.navigate(ROUTES.DERA.VIEW_DAIRY_PRODUCT, payload)
  }

  const HandleOnLongPress = (item) => {
    setAlert({
      message: 'Are you sure you want to delete this product?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        setIsLoading('Deleting Product...')
        setAlert(null)

        try {
          // const imageRef = ref(Storage, item.productImage.split('.com/o/')[1].split('?')[0])
          // await deleteObject(imageRef)

          // await deleteDoc(doc(Firestore, 'products', item.id))
          // setProductsData(productsData.filter((product) => product.id !== item.id))
          // setOriginalData(productsData.filter((product) => product.id !== item.id))

          const response = await axios.delete(`${SERVER_URL}/dairyProducts/${item.id}`)
          if (response.status === 200) {
            setProductsData(productsData.filter((product) => product.id !== item.id))
            setOriginalData(productsData.filter((product) => product.id !== item.id))
          } else {
            setIsLoading(null)
            setAlert({
              title: 'Error',
              message: 'Something went wrong. Please try again later.',
              positiveLabel: 'OK',
              positiveCallback: () => setAlert(null),
            })
          }
        } catch (error) {
          setAlert({
            title: 'Error',
            message: FirebaseErrors[error.code] || error.message,
            positiveLabel: 'OK',
            positiveCallback: () => setAlert(null),
          })
        }

        setIsLoading(null)
      },
      negativeCallback: () => setAlert(null)
    })
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
            value: `Rs. ${item.productPrice} / ${item.priceUnit}`
          },
          {
            icon: <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />,
            value: item.productCategory
          },
          // {
          //   icon: <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />,
          //   value: `${item.productPrice} / ${item.priceUnit}`
          // },
        ]}
        onPress={() => HandleOnPress(item)}
        onLongPress={() => HandleOnLongPress(item)}
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
        <CustomAppBar title='Show Dairy Products' onGoBack={() => navigation.goBack()}
          rightIcon={<MaterialIcons name='add-circle-outline' color={COLORS.COLOR_06} size={26} />}
          onRightIconPress={() => navigation.navigate(ROUTES.DERA.ADD_DAIRY_PRODUCT)}
        />
        <NoDataFound message='No Dairy Product Found!' />
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

      <CustomAppBar title='Show Dairy Product' onGoBack={() => navigation.goBack()}
        rightIcon={<MaterialIcons name='add-circle-outline' color={COLORS.COLOR_06} size={26} />}
        onRightIconPress={() => navigation.navigate(ROUTES.DERA.ADD_DAIRY_PRODUCT)}
      />

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
        productsData?.length
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