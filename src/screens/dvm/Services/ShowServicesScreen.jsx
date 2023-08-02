import React, { useState, useEffect, useCallback } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFocusEffect } from '@react-navigation/native'
import { doc, deleteDoc } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import axios from 'axios'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomLoading from '../../../components/CustomLoading'
import CustomSearch from '../../../components/CustomSearch'
import CustomWideSlimCard from '../../../components/Cards/CustomWideSlimCard'
import NoDataFound from '../../../components/NoDataFound'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { SERVER_URL } from '../../../config/values'
import { Firestore, Storage } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'

const ShowServicesScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [search, setSearch] = useState('')

  const [servicesData, setServicesData] = useState([])
  const [originalData, setOriginalData] = useState([])

  const GetData = async () => {
    setIsLoading('Loading...')

    const loadedData = JSON.parse(await AsyncStorage.getItem('services'))
    // To Sort Our Data By createdAt Date, After That The Latest Data Will Be On Top
    loadedData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)

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
        || charges.toLowerCase().includes(query)
    })

    setServicesData(filteredData)
  }

  const HandleOnPress = (item) => {
    const payload = { service: item }
    navigation.navigate(ROUTES.DVM.VIEW_SERVICE, payload)
  }

  const HandleOnLongPress = (item) => {
    setAlert({
      message: 'Are you sure you want to delete this service?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        setIsLoading('Deleting Service...')
        setAlert(null)

        try {
          // const imageRef = ref(Storage, item.serviceImage.split('.com/o/')[1].split('?')[0])
          // await deleteObject(imageRef)
          // await deleteDoc(doc(Firestore, 'services', item.id))
          // setServicesData(servicesData.filter((service) => service.id !== item.id))
          // setOriginalData(servicesData.filter((service) => service.id !== item.id))

          const response = await axios.delete(`${SERVER_URL}/services/${service.id}`)
          if (response.status === 200) {
            setServicesData(servicesData.filter((service) => service.id !== item.id))
            setOriginalData(servicesData.filter((service) => service.id !== item.id))
          } else {
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
        title={item.serviceTitle}
        imageUri={item.serviceImage}
        onPress={() => HandleOnPress(item)}
        onLongPress={() => HandleOnLongPress(item)}
        details={[
          {
            icon: <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />,
            value: `${item.serviceCharges} / ${item.serviceChargesPer}`
          },
          {
            icon: <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />,
            value: `${item.serviceType.isRemote ? 'Remote' : ''}${(item.serviceType.isRemote && item.serviceType.isOnSite) ? ' and ' : ''}${item.serviceType.isOnSite ? 'On-Site' : ''}`
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
        <CustomAppBar title='Show Services' onGoBack={() => navigation.goBack()}
          rightIcon={<MaterialIcons name='add-circle-outline' color={COLORS.COLOR_06} size={26} />}
          onRightIconPress={() => navigation.navigate(ROUTES.DVM.ADD_SERVICE)}
        />
        <NoDataFound message='No Services Found!' />
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

      <CustomAppBar title='Show Services' onGoBack={() => navigation.goBack()}
        rightIcon={<MaterialIcons name='add-circle-outline' color={COLORS.COLOR_06} size={26} />}
        onRightIconPress={() => navigation.navigate(ROUTES.DVM.ADD_SERVICE)}
      />

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

export default ShowServicesScreen

const styles = StyleSheet.create({}) 