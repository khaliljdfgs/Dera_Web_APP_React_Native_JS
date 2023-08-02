import React, { useState, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'

import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomSearch from '../../../components/CustomSearch'
import CustomTagChip from '../../../components/CustomTagChip'
import NoDataFound from '../../../components/NoDataFound'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { SERVICE_STATUS } from '../../../config/values'

const AppointmentsScreen = ({ navigation }) => {
  const [alert, setAlert] = useState(null)
  const [isLoading, setIsLoading] = useState(null)

  const [search, setSearch] = useState('')

  const [appointmentsData, setAppointmentsData] = useState([])
  const [originalData, setOriginalData] = useState([])

  const Setup = async () => {
    setIsLoading('Loading...')

    const appointments = await JSON.parse(await AsyncStorage.getItem('appointments'))

    const loadedData = appointments.filter((item) => {
      return item.serviceStatus === SERVICE_STATUS.PENDING || item.serviceStatus === SERVICE_STATUS.BOOKED
    })

    setOriginalData(loadedData)
    setAppointmentsData(loadedData)

    setIsLoading(null)
  }

  useFocusEffect(useCallback(() => { Setup() }, []))

  const HandleSearch = () => {
    if (search === '') return

    const filteredData = originalData.filter((item) => {
      const charges = item.service.serviceCharges + ''
      const query = search.toLowerCase().trim()

      return item.service.serviceTitle.toLowerCase().includes(query)
        || item.service.serviceDescription.toLowerCase().includes(query)
        || charges.toLowerCase().includes(query)
        || item.service.serviceChargesPer.toLowerCase().includes(query)
        || item.service.serviceTypeString.toLowerCase().includes(query)
        || item.serviceStatus.toLowerCase().includes(query)
    })

    setAppointmentsData(filteredData)
  }

  const HandleOnPress = (item) => {
    const payload = { appointment: item }
    navigation.navigate(ROUTES.DVM.VIEW_APPOINTMENT_DETAILS, payload)
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
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.65}
        onPress={() => HandleOnPress(item)}>

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
                {item.dera?.businessName}
              </Text>
            </View>
            <View style={{ ...styles.detailCellContainer, flex: 0.75 }}>
              <FontAwesome5 name='location-arrow' size={12} color={COLORS.COLOR_01} />
              <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
                {item.deraDistanceString}
              </Text>
            </View>
          </View>

          <View style={styles.detailCellContainer}>
            <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />
            <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
              {`${item.service?.serviceCharges} / ${item.service?.serviceChargesPer}`}
            </Text>
          </View>

          <View style={styles.detailCellContainer}>
            <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />
            <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
              {item.service?.serviceTypeString}
            </Text>
          </View>

          <View style={styles.detailCellContainer}>
            <Ionicons name='md-time-outline' size={16} color={COLORS.COLOR_01} />
            <Text style={styles.itemAttributeValue} numberOfLines={1} ellipsizeMode='tail'>
              {item.serviceAvailedAtString}
            </Text>
          </View>

        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Appointments' onGoBack={null} />
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

      <CustomAppBar title='Appointments' onGoBack={null} />

      <CustomSearch
        placeholder='Search Appointments'
        search={search}
        setSearch={setSearch}
        handleSearch={HandleSearch}
        onRightIconPress={() => {
          setSearch('')
          setAppointmentsData(originalData)
        }}
      />

      {
        appointmentsData?.length
          ?
          <FlashList
            data={appointmentsData}
            renderItem={RenderListItem}
            estimatedItemSize={156}
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

export default AppointmentsScreen

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