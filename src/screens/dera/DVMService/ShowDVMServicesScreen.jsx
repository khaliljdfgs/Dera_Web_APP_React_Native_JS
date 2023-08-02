import React, { useState, useEffect, useCallback } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons'
import { useFocusEffect } from '@react-navigation/native'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomLoading from '../../../components/CustomLoading'
import CustomWideSlimCard from '../../../components/Cards/CustomWideSlimCard'
import CustomSearch from '../../../components/CustomSearch'
import NoDataFound from '../../../components/NoDataFound'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { GetDistance } from '../../../utils/Helpers'

const ShowDVMServicesScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [search, setSearch] = useState('')

  const [servicesData, setServicesData] = useState([])
  const [originalData, setOriginalData] = useState([])

  const GetData = async () => {
    setIsLoading('Loading...')

    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
    const loadedData = JSON.parse(await AsyncStorage.getItem('services'))
    const dvmUsers = JSON.parse(await AsyncStorage.getItem('dvmUsers'))

    loadedData.forEach((service, index) => {
      const __uid = service.owner instanceof Object ? service.owner.uid : service.owner
      const user = dvmUsers.find((user) => user.id === __uid)
      service.owner = user

      if (user) {
        const distance = GetDistance(
          { latitude: currentUser.geoLocation?.latitude, longitude: currentUser.geoLocation?.longitude },
          { latitude: user.geoLocation?.latitude, longitude: user.geoLocation?.longitude }
        )

        service.distance = distance
        service.distanceString = distance < 1000 ? `${distance.toFixed(2)} m` : `${(distance / 1000).toFixed(2)} km`
      }

      service.serviceTypeString = `${service.serviceType.isRemote ? 'Remote' : ''}${(service.serviceType.isRemote && service.serviceType.isOnSite) ? ' and ' : ''}${service.serviceType.isOnSite ? 'On-Site' : ''}`
    })

    loadedData.sort((a, b) => a.distance - b.distance)

    // To Sort Our Data By createdAt Date, After That The Latest Data Will Be On Top
    // loadedData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)

    setServicesData(loadedData)
    setOriginalData(loadedData)

    setIsLoading(null)
  }

  const Refresh = async () => {
    const isDataChanged = await AsyncStorage.getItem('EditServiceDataChanged')
    const isDataAdded = await AsyncStorage.getItem('AddServiceDataAdded')

    if (isDataChanged === 'true' || isDataAdded === 'true') {
      GetData()
      await AsyncStorage.removeItem('EditServiceDataChanged')
      await AsyncStorage.removeItem('AddServiceDataAdded')
    }
  }

  useFocusEffect(useCallback(() => { Refresh() }, []))

  useEffect(() => { GetData() }, [])

  const HandleSearch = () => {
    if (search === '') return

    const filteredData = originalData.filter((item) => {
      const charges = item.serviceCharges + ''
      const query = search.toLowerCase().trim()

      return item.serviceTitle.toLowerCase().includes(query)
        || item.serviceDescription.toLowerCase().includes(query)
        || item.owner.fullname.toLowerCase().includes(query)
        || charges.toLowerCase().includes(query)
    })

    setServicesData(filteredData)
  }

  const HandleOnPress = (item) => {
    const payload = { service: item }
    navigation.navigate(ROUTES.DERA.VIEW_DVM_SERVICE, payload)
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
        title={item.serviceTitle}
        imageUri={item.serviceImage}
        onPress={() => HandleOnPress(item)}
        details={[
          {
            // icon: <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />,
            value: `Rs. ${item.serviceCharges} / ${item.serviceChargesPer}`
          },
          {
            icon: <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />,
            value: item.serviceTypeString
          },
          {
            icon: <Ionicons name='person' size={16} color={COLORS.COLOR_01} />,
            value: item.owner.fullname
          },
          {
            icon: <View style={{ marginRight: 4 }}>
              <FontAwesome5 name="location-arrow" size={12} color={COLORS.COLOR_01} />
            </View>,
            value: item.distanceString
          },
        ]}
      />
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Show Services' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  if (originalData.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Show Services' onGoBack={() => navigation.goBack()} />
        <NoDataFound message='No Service Found!' />
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

      <CustomAppBar title='Show Services' onGoBack={() => navigation.goBack()} />

      <CustomSearch
        placeholder='Search Services'
        search={search}
        setSearch={setSearch}
        handleSearch={HandleSearch}
        onRightIconPress={() => {
          setSearch('')
          setServicesData(originalData)
        }}
      />

      {
        servicesData?.length
          ?
          <FlashList
            data={servicesData}
            renderItem={RenderListItem}
            estimatedItemSize={129}
            ListEmptyComponent={RenderListEmptyComponent}
            ListHeaderComponent={<View style={{ padding: 6 }} />}
            ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
          :
          <NoDataFound message='No Service Found!' />
      }
    </SafeAreaView>
  )
}

export default ShowDVMServicesScreen

const styles = StyleSheet.create({})