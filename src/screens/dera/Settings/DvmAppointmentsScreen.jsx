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

const DvmAppointmentsScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [search, setSearch] = useState('')

  const [dvmAppointmentsData, setDvmAppointmentsData] = useState([])
  const [originalData, setOriginalData] = useState([])

  useEffect(() => {
    let DvmAppointmentsListener = () => { }

    const Setup = async () => {
      setIsLoading('Loading...')

      try {
        const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

        const serviceQuery = query(
          collectionGroup(Firestore, 'serviceAvailments'),
          where('serviceAvailedBy', '==', currentUser.uid)
        )

        DvmAppointmentsListener = onSnapshot(serviceQuery, async (querySnapshot) => {
          setIsLoading('Loading...')

          const loadedData = []
          querySnapshot.forEach((doc) => {
            loadedData.push({ id: doc.id, ...doc.data() })
          })

          loadedData.sort((a, b) => b.serviceAvailedAt.seconds - a.serviceAvailedAt.seconds)

          const dvmServices = JSON.parse(await AsyncStorage.getItem('services'))
          loadedData.forEach((item) => {
            item.service = dvmServices.find((dvmService) => dvmService.id === item.serviceId)
          })

          setOriginalData(loadedData)
          setDvmAppointmentsData(loadedData)

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
      DvmAppointmentsListener()
    }
  }, [])

  const HandleSearch = () => {
    if (search === '') return

    const filteredData = originalData.filter((item) => {
      const charges = item.service.serviceCharges + ''
      const query = search.toLowerCase().trim()

      return item.service.serviceTitle.toLowerCase().includes(query)
        || item.service.serviceDescription.toLowerCase().includes(query)
        || charges.toLowerCase().includes(query)
        || item.service.serviceChargesPer.toLowerCase().includes(query)
        || item.service.owner.fullname.toLowerCase().includes(query)
        || item.service.serviceTypeString.toLowerCase().includes(query)
        || item.serviceStatus.toLowerCase().includes(query)
    })

    setDvmAppointmentsData(filteredData)
  }

  const HandleOnPress = (item) => {
    const payload = { appointment: item }
    navigation.navigate(ROUTES.DERA.DVM_APPOINTMENT_DETAILS, payload)
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
            {item.service.serviceTitle}
          </Text>
          <CustomTagChip
            text={item.serviceStatus}
            containerStyle={{ backgroundColor: COLORS.COLOR_06, elevation: 0 }}
            textStyle={{ color: COLORS.COLOR_01 }} />
        </View>

        <View style={{ paddingVertical: 8, paddingHorizontal: 12, gap: 8 }}>

          <View style={styles.detailsContainer}>
            <View style={styles.detailCellContainer}>
              <Ionicons name='person' size={16} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.service.owner.fullname}
              </Text>
            </View>
            <View style={{ ...styles.detailCellContainer, flex: 0.75 }}>
              <FontAwesome5 name='location-arrow' size={12} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.service.distanceString}
              </Text>
            </View>
          </View>

          <View style={styles.detailCellContainer}>
            <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />
            <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
              {`${item.service.serviceCharges} / ${item.service.serviceChargesPer}`}
            </Text>
          </View>

          <View style={styles.detailCellContainer}>
            <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />
            <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
              {item.service.serviceTypeString}
            </Text>
          </View>

          <View style={styles.detailCellContainer}>
            <Ionicons name='md-time-outline' size={16} color={COLORS.COLOR_01} />
            <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
              {moment(item.serviceAvailedAt.toDate()).format('DD MMM YYYY, hh:mm A')}
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
        <CustomAppBar title='DVM Appointments' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='DVM Appointments' onGoBack={() => navigation.goBack()} />

      <CustomSearch
        placeholder='Search DVM Appointments'
        search={search}
        setSearch={setSearch}
        handleSearch={HandleSearch}
        onRightIconPress={() => {
          setSearch('')
          setDvmAppointmentsData(originalData)
        }}
      />

      {
        dvmAppointmentsData?.length
          ?
          <FlashList
            data={dvmAppointmentsData}
            renderItem={RenderListItem}
            estimatedItemSize={180}
            ListEmptyComponent={RenderListEmptyComponent}
            ListHeaderComponent={<View style={{ padding: 6 }} />}
            ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
          :
          <NoDataFound message='No Appointment Found!' />
      }

    </SafeAreaView>
  )
}

export default DvmAppointmentsScreen

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