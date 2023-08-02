import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { query, collectionGroup, where, onSnapshot, and, Timestamp, or } from 'firebase/firestore'
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
import { LIVESTOCK_STATUS } from '../../../config/values'

const LiveStockHistoryScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [search, setSearch] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')

  const [liveStockHistoryData, setLiveStockHistoryData] = useState([])
  const [originalData, setOriginalData] = useState([])

  useEffect(() => {
    let LiveStockHistoryListener = () => { }

    const Setup = async () => {
      setIsLoading('Loading...')

      try {
        const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
        setCurrentUserId(currentUser.uid)

        const liveStocksHistoryQuery = query(
          collectionGroup(Firestore, 'livestocks'),
          or(
            and(
              where('soldOutTo', '==', currentUser.uid),
              where('liveStockStatus', '==', LIVESTOCK_STATUS.SOLD_OUT),
            ),
            where('requests', 'array-contains', currentUser.uid),
          )
        )

        LiveStockHistoryListener = onSnapshot(liveStocksHistoryQuery, async (querySnapshot) => {
          setIsLoading('Loading...')

          const loadedData = []
          querySnapshot.forEach((doc) => {
            loadedData.push({ id: doc.id, ...doc.data() })
          })

          loadedData.sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds)

          const deraUsers = JSON.parse(await AsyncStorage.getItem('deraUsers'))

          loadedData.forEach((item) => {
            item.owner = deraUsers.find((user) => user.uid === item.owner)
          })

          setOriginalData(loadedData)
          setLiveStockHistoryData(loadedData)

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
      LiveStockHistoryListener()
    }
  }, [])

  const HandleSearch = () => {
    if (search === '') return

    const filteredData = originalData.filter((item) => {
      const price = item.liveStockPrice + ''
      const query = search.toLowerCase().trim()

      return item.liveStockTitle.toLowerCase().includes(query)
        || item.liveStockDescription.toLowerCase().includes(query)
        || price.toLowerCase().includes(query)
        || item.liveStockCategory.toLowerCase().includes(query)
        || item.liveStockStatus.toLowerCase().includes(query)
    })

    setLiveStockHistoryData(filteredData)
  }

  const HandleOnPress = (item) => {
    const payload = { liveStock: item, fromSoldOut: true }
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
    return (
      <TouchableOpacity style={styles.itemContainer} activeOpacity={0.65} onPress={() => HandleOnPress(item)}>

        <View style={styles.itemTitleContainer}>
          <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode='tail'>
            {item.liveStockTitle}
          </Text>
          <CustomTagChip
            text={(() => {
              if (item.liveStockStatus === LIVESTOCK_STATUS.SOLD_OUT) {
                if (item.soldOutTo === currentUserId) {
                  return LIVESTOCK_STATUS.PURCHASED
                }
                return LIVESTOCK_STATUS.SOLD_OUT
              } else {
                return LIVESTOCK_STATUS.REQUESTED
              }
            })()}
            containerStyle={{ backgroundColor: COLORS.COLOR_06, elevation: 0 }}
            textStyle={{ color: COLORS.COLOR_01 }} />
        </View>

        <View style={{ paddingVertical: 8, paddingHorizontal: 12, gap: 8 }}>

          <View style={styles.detailsContainer}>
            <View style={styles.detailCellContainer}>
              <Ionicons name='person' size={16} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.owner.businessName}
              </Text>
            </View>
            <View style={{ ...styles.detailCellContainer, flex: 0.75 }}>
              <FontAwesome5 name='location-arrow' size={12} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.owner.distanceString}
              </Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailCellContainer}>
              <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {`${item.liveStockPrice}`}
              </Text>
            </View>
            <View style={{ ...styles.detailCellContainer, flex: 0.75 }}>
              <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.liveStockCategory}
              </Text>
            </View>
          </View>

          <View style={styles.detailCellContainer}>
            <Ionicons name='md-time-outline' size={16} color={COLORS.COLOR_01} />
            <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
              {moment(
                new Timestamp(
                  item.updatedAt.seconds,
                  item.updatedAt.nanoseconds
                ).toDate()
              ).format('DD MMM YYYY, hh:mm A')}
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
        <CustomAppBar title='Livestock History' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='Livestock History' onGoBack={() => navigation.goBack()} />

      <CustomSearch
        placeholder='Search Livestocks'
        search={search}
        setSearch={setSearch}
        handleSearch={HandleSearch}
        onRightIconPress={() => {
          setSearch('')
          setLiveStockHistoryData(originalData)
        }}
      />

      {
        liveStockHistoryData?.length
          ?
          <FlashList
            data={liveStockHistoryData}
            renderItem={RenderListItem}
            estimatedItemSize={180}
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

export default LiveStockHistoryScreen

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