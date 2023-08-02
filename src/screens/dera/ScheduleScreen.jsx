import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialIcons, Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons'
import moment from 'moment'
import { Timestamp } from 'firebase/firestore'

import CustomAlertDialog from '../../components/CustomAlertDialog'
import CustomLoading from '../../components/CustomLoading'
import CustomAppBar from '../../components/CustomAppBar'
import CustomTagChip from '../../components/CustomTagChip'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'
import { DAIRY_PRODUCT_ORDER_STATUS, DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS } from '../../config/values'

import ScheduleListener from '../../listeners/dera/ScheduleListener'

const ScheduleScreen = ({ navigation }) => {
  const [alert, setAlert] = useState(null)
  const [isLoading, setIsLoading] = useState(null)

  const [scheduleData, setScheduleData] = useState([])
  const [currentDate, setCurrentDate] = useState(moment().format('DD-MMM-YYYY'))
  const [currentScheduleData, setCurrentScheduleData] = useState([])

  React.useEffect(() => {
    let __ScheduleListener = () => { }

    const _Setup = async () => {
      const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
      __ScheduleListener = ScheduleListener({ currentUser, Setup })
    }

    _Setup()
    return () => __ScheduleListener()
  }, [])

  const GetStatusForSchedule = (item, _date = moment()) => {
    if (item.isSubscription) {
      let startDate = moment(prepareDate(item.confirmedOn))
      let endDate = moment(startDate).add(item.subscriptionPeriod, 'days')

      const dates = []
      while (moment(startDate).isSameOrBefore(endDate, 'days')) {
        dates.push(startDate)
        startDate = moment(startDate).add(1, 'days')
      }

      let index = -1
      for (let i = 0; i < dates.length; i++) {
        if (moment(dates[i]).isSame(_date, 'days')) {
          index = i
          break
        }
      }

      if (moment(dates[index]).isBefore(moment().subtract(1, 'days'), 'days')
        && item.dailyStatus[index] !== DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.DELIVERED) {
        return 'Expired'
      }

      if (index === -1) {
        return 'N/A'
      } else if (moment(_date).isSame(moment(), 'days')) {
        if (item.dailyStatus[index] === DAIRY_PRODUCT_ORDER_SUBSCRIPTION_STATUS.DELIVERED) {
          return 'Delivered'
        } else {
          return 'Active'
        }
      } else {
        return item.dailyStatus[index]
      }
    }
  }

  const Setup = async () => {
    setIsLoading('Loading...')

    const scheduleData = JSON.parse(await AsyncStorage.getItem('schedules'))
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
    const consumerUsers = JSON.parse(await AsyncStorage.getItem('consumerUsers'))
    const dairyProducts = JSON.parse(await AsyncStorage.getItem('dairyProducts'))

    scheduleData.forEach((item) => {
      item.owner = currentUser
      item.placedBy = consumerUsers.find((user) => user.id === item.placedBy)
      item.product = dairyProducts.find((product) => product.id === item.product)
    })

    setScheduleData(scheduleData)

    scheduleData.map((item) => {
      if (item.isSingleOrder) {
        if (moment(prepareDate(item.confirmedOn)).isBefore(moment(), 'days')
          && item.status === DAIRY_PRODUCT_ORDER_STATUS.CONFIRMED) {
          item.statusChip = 'Expired'
        } else if (item.status === DAIRY_PRODUCT_ORDER_STATUS.DELIVERED) {
          item.statusChip = 'Delivered'
        } else {
          item.statusChip = item.status
        }
      }
    })

    const filteredScheduleData = scheduleData.filter((item) => {
      if (item.isSubscription === true) {
        const x = item.subscriptionPeriod - 1
        const subscriptionEndDate = moment(prepareDate(item.confirmedOn)).add(x, 'days')
        return moment(prepareDate(item.confirmedOn)).isSameOrBefore(moment(), 'days') && moment().isSameOrBefore(subscriptionEndDate, 'days')
      } else {
        return moment(prepareDate(item.confirmedOn)).isSame(moment(), 'days')
      }
    })

    filteredScheduleData.map((item) => {
      const _status = GetStatusForSchedule(item, moment())
      if (_status) item.statusChip = _status
    })

    setCurrentScheduleData(filteredScheduleData)
    setIsLoading(null)
  }

  const prepareDate = (obj) => moment(
    new Timestamp(obj.seconds, obj.nanoseconds).toDate()
  )

  const HandleOnPress = async (item) => {
    navigation.navigate(ROUTES.DERA.SCHEDULE_DETAILS, { data: item })
  }

  const HandleShowPreviousDay = async () => {
    setIsLoading('Loading...')
    const previousDate = moment(currentDate, 'DD-MMM-YYYY').subtract(1, 'days')
    setCurrentDate(previousDate.format('DD-MMM-YYYY'))

    const filteredScheduleData = scheduleData.filter((item) => {
      if (item.isSubscription) {
        const x = item.subscriptionPeriod - 1
        const subscriptionEndDate = moment(prepareDate(item.confirmedOn)).add(x, 'days')
        return moment(prepareDate(item.confirmedOn)).isSameOrBefore(previousDate, 'days') && previousDate.isSameOrBefore(subscriptionEndDate, 'days')
      } else {
        return moment(prepareDate(item.confirmedOn)).isSame(previousDate, 'days')
      }
    })

    filteredScheduleData.map((item) => {
      const _status = GetStatusForSchedule(item, previousDate)
      if (_status) item.statusChip = _status
    })

    setCurrentScheduleData(filteredScheduleData)
    setIsLoading(null)
  }

  const HandleShowNextDay = async () => {
    setIsLoading('Loading...')
    const nextDate = moment(currentDate, 'DD-MMM-YYYY').add(1, 'days')
    setCurrentDate(nextDate.format('DD-MMM-YYYY'))

    const filteredScheduleData = scheduleData.filter((item) => {
      if (item.isSubscription) {
        const x = item.subscriptionPeriod - 1
        const subscriptionEndDate = moment(prepareDate(item.confirmedOn)).add(x, 'days')
        return moment(prepareDate(item.confirmedOn)).isSameOrBefore(nextDate, 'days') && nextDate.isSameOrBefore(subscriptionEndDate, 'days')
      } else {
        return moment(prepareDate(item.confirmedOn)).isSame(nextDate, 'days')
      }
    })

    filteredScheduleData.map((item) => {
      const _status = GetStatusForSchedule(item, nextDate)
      if (_status) item.statusChip = _status
    })

    setCurrentScheduleData(filteredScheduleData)
    setIsLoading(null)
  }

  const RenderListEmptyComponent = () => (
    <Text style={{
      textAlign: 'center',
      fontSize: 18,
      fontFamily: 'NunitoSans-SemiBoldItalic',
      color: COLORS.COLOR_04,
      marginTop: 8,
      paddingVertical: 16,
    }}>No Schedule Found!</Text>
  )

  const RenderListItem = ({ item }) => {
    return (
      <TouchableOpacity style={styles.itemContainer} activeOpacity={0.65} onPress={() => HandleOnPress(item)}>
        <View style={styles.itemTitleContainer}>
          <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode='tail'>
            {item.product.productName}
          </Text>
          <CustomTagChip
            text={item.statusChip}
            containerStyle={{ backgroundColor: COLORS.COLOR_06, elevation: 0 }}
            textStyle={{ color: COLORS.COLOR_01 }} />
        </View>

        <View style={{ paddingVertical: 8, paddingHorizontal: 12, gap: 8 }}>

          <View style={styles.detailsContainer}>
            <View style={styles.detailCellContainer}>
              <Ionicons name='person' size={16} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.placedBy.fullname}
              </Text>
            </View>
            <View style={{ ...styles.detailCellContainer, flex: 0.85 }}>
              <FontAwesome5 name='location-arrow' size={12} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.placedBy?.distanceString}
              </Text>
            </View>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailCellContainer}>
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                <Text style={{
                  fontFamily: 'NunitoSans-SemiBold',
                }}>Qunatity:</Text>
                {` ${item.quantity} ${item.product.priceUnit}`}
              </Text>
            </View>
            <View style={{ ...styles.detailCellContainer, flex: 0.85 }}>
              <Text style={{ color: COLORS.COLOR_01 }}>
                <MaterialCommunityIcons name='currency-rupee' size={18} color={COLORS.COLOR_01} />.
              </Text>
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {`${item.product.productPrice * item.quantity}`}
              </Text>
            </View>
          </View>

          <View style={styles.detailCellContainer}>
            <View style={styles.detailCellContainer}>
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                <Text style={{ fontFamily: 'NunitoSans-SemiBold' }}>Shift:</Text>{` ${item.deliveryTime}`}
              </Text>
            </View>
            <View style={{ ...styles.detailCellContainer, flex: 0.85 }}>
              <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.product.productCategory}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const ReaderListHeaderComponent = () => (
    <View style={{
      flexDirection: 'row',
      paddingHorizontal: 24,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: `${COLORS.COLOR_01}10`,
      marginBottom: 20,
    }}>
      <TouchableOpacity onPress={HandleShowPreviousDay} activeOpacity={0.62}>
        <MaterialIcons name='chevron-left' size={30} color={COLORS.COLOR_01} />
      </TouchableOpacity>
      <Text style={{
        flex: 1,
        fontSize: 18,
        fontFamily: 'NunitoSans-SemiBold',
        color: COLORS.COLOR_01,
        textAlign: 'center',
      }}>
        {currentDate}
      </Text>
      <TouchableOpacity onPress={HandleShowNextDay} activeOpacity={0.62}>
        <MaterialIcons name='chevron-right' size={30} color={COLORS.COLOR_01} />
      </TouchableOpacity>
    </View>
  )

  if (isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Schedule' onGoBack={null} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
      {
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

      <CustomAppBar title='Schedule' onGoBack={null} />

      {
        currentScheduleData?.length > 0
          ?
          <FlashList
            data={currentScheduleData}
            renderItem={RenderListItem}
            estimatedItemSize={156}
            ListHeaderComponent={ReaderListHeaderComponent}
            ListEmptyComponent={RenderListEmptyComponent}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
          :
          <>
            <ReaderListHeaderComponent />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
              <Image source={require('../../../assets/images/noSchedule.png')}
                style={{
                  width: Dimensions.get('window').width * 0.8,
                  height: Dimensions.get('window').width * 0.60,
                }} />
              <Text style={{
                fontSize: 18,
                fontFamily: 'NunitoSans-SemiBold',
                color: COLORS.COLOR_01,
                textAlign: 'center',
                marginTop: 24,
              }}>
                No Schedule Found
              </Text>
            </View>
          </>
      }
    </SafeAreaView>
  )
}

export default ScheduleScreen

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