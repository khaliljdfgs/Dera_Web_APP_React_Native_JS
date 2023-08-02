import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { query, collectionGroup, where, onSnapshot } from 'firebase/firestore'
import { FlashList } from '@shopify/flash-list'
import { Ionicons, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import moment from 'moment/moment'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomLoading from '../../../components/CustomLoading'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomSearch from '../../../components/CustomSearch'
import CustomTagChip from '../../../components/CustomTagChip'
import NoDataFound from '../../../components/NoDataFound'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { Firestore } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'

const DairyProductOrdersScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [search, setSearch] = useState('')

  const [dairyOrdersData, setDairyOrdersData] = useState([])
  const [originalData, setOriginalData] = useState([])

  useEffect(() => {
    const patch = async () => {
      await AsyncStorage.removeItem('EditDairyProductGoToHomeScreen')
      await AsyncStorage.removeItem('EditDairyProductDataChanged')
    }

    patch()
  }, [])

  useEffect(() => {
    let DairyOrdersListener = () => { }

    const Setup = async () => {
      setIsLoading('Loading...')

      try {
        const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

        const dairyOrdersQuery = query(
          collectionGroup(Firestore, 'dairyProductOrders'),
          where('owner', '==', currentUser.uid)
        )

        DairyOrdersListener = onSnapshot(dairyOrdersQuery, async (querySnapshot) => {
          setIsLoading('Loading...')

          const loadedData = []
          querySnapshot.forEach((doc) => {
            loadedData.push({ id: doc.id, ...doc.data() })
          })

          loadedData.sort((a, b) => b.placedOn.seconds - a.placedOn.seconds)

          const dairyProducts = JSON.parse(await AsyncStorage.getItem('dairyProducts'))
          const consumerUsers = JSON.parse(await AsyncStorage.getItem('consumerUsers'))

          loadedData.forEach((item) => {
            item.product = dairyProducts.find((product) => product.id === item.product)
            item.orderedBy = consumerUsers.find((user) => user.uid === item.placedBy)
          })

          setOriginalData(loadedData)
          setDairyOrdersData(loadedData)

          setIsLoading(null)
        }, (error) => {
          setIsLoading(null)

          setAlert({
            title: 'Error',
            message: FirebaseErrors[error.code] || error.message,
            positiveLabel: 'OK',
            positiveCallback: () => setAlert(null)
          })
        })
      } catch (error) {
        setAlert({
          title: 'Error',
          message: FirebaseErrors[error.code] || error.message,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null)
        })

        setIsLoading(null)
      }
    }

    Setup()

    return () => {
      DairyOrdersListener()
    }
  }, [])

  const HandleSearch = () => {
    if (search === '') return

    const filteredData = originalData.filter((item) => {
      const price = item.product.productPrice + ''
      const query = search.toLowerCase().trim()

      return item.product.productName.toLowerCase().includes(query)
        || item.product.productDescription.toLowerCase().includes(query)
        || price.toLowerCase().includes(query)
        || item.product.productCategory.toLowerCase().includes(query)
        || item.status.toLowerCase().includes(query)
    })

    setDairyOrdersData(filteredData)
  }

  const HandleOnPress = (item) => {
    const payload = { product: item.product, fromOrderHistory: true, order: item }
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
      <TouchableOpacity style={styles.itemContainer} activeOpacity={0.65} onPress={() => HandleOnPress(item)}>

        <View style={styles.itemTitleContainer}>
          <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode='tail'>
            {item.product.productName}
          </Text>
          <CustomTagChip
            text={item.status}
            containerStyle={{ backgroundColor: COLORS.COLOR_06, elevation: 0 }}
            textStyle={{ color: COLORS.COLOR_01 }} />
        </View>

        <View style={{ paddingVertical: 8, paddingHorizontal: 12, gap: 8 }}>

          <View style={styles.detailsContainer}>
            <View style={styles.detailCellContainer}>
              <Ionicons name='person' size={16} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.orderedBy.fullname}
              </Text>
            </View>
            <View style={{ ...styles.detailCellContainer, flex: 0.75 }}>
              <FontAwesome5 name='location-arrow' size={12} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.orderedBy.distanceString}
              </Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailCellContainer}>
              <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {`${item.product.productPrice} / ${item.product.priceUnit}`}
              </Text>
            </View>
            <View style={{ ...styles.detailCellContainer, flex: 0.75 }}>
              <MaterialCommunityIcons name='cart' size={16} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {`${item.quantity} ${item.product.priceUnit}`}
              </Text>
            </View>
          </View>

          <View style={styles.detailCellContainer}>
            <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />
            <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
              {item.product.productCategory}
            </Text>
          </View>

          <View style={styles.detailCellContainer}>
            <Ionicons name='md-time-outline' size={16} color={COLORS.COLOR_01} />
            <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
              {moment(item.placedOn.toDate()).format('DD MMM YYYY, hh:mm A')}
            </Text>
          </View>

        </View>
      </TouchableOpacity>
    )
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Dairy Product Orders' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  // If fonts are loaded, return our UI
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

      <CustomAppBar title='Dairy Product Orders' onGoBack={() => navigation.goBack()} />

      <CustomSearch
        placeholder='Search Dairy Order'
        search={search}
        setSearch={setSearch}
        handleSearch={HandleSearch}
        onRightIconPress={() => {
          setSearch('')
          setDairyOrdersData(originalData)
        }}
      />

      {
        dairyOrdersData?.length
          ?
          <FlashList
            data={dairyOrdersData}
            renderItem={RenderListItem}
            estimatedItemSize={180}
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

export default DairyProductOrdersScreen

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: COLORS.COLOR_06,
    borderRadius: 6,
    borderColor: COLORS.COLOR_01,
    borderWidth: 1,
    overflow: 'hidden',
    marginHorizontal: 24,
  },
  itemTitleContainer: {
    backgroundColor: COLORS.COLOR_01,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: 'NunitoSans-SemiBold',
    color: COLORS.COLOR_06,
    flex: 1,
  },
  itemAttributeValue: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: COLORS.COLOR_01,
    flex: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  detailCellContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
}) 