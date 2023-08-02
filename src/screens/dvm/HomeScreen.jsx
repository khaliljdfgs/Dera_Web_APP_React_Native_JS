import React, { useState, useEffect } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomLoading from '../../components/CustomLoading'
import CustomAlertDialog from '../../components/CustomAlertDialog'
import CustomAnimatedLoader from '../../components/CustomAnimatedLoader'
import HeaderHomeScreen from '../../components/HomeScreen/HeaderHomeScreen'
import SectionBarHomeScreen from '../../components/HomeScreen/SectionBarHomeScreen'
import SectionButtonHomeScreen from '../../components/HomeScreen/SectionButtonHomeScreen'
import ItemCardsHomeScreen from '../../components/HomeScreen/ItemCardsHomeScreen'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'

import AppointmentsListener from '../../listeners/dvm/AppointmentsListener'
import ServicesListeners from '../../listeners/dvm/ServicesListeners'
import BannerPhotoListener from '../../listeners/dvm/BannerPhotoListener'
import UserListener from '../../listeners/dvm/UserListener'
import DeraUsersListener from '../../listeners/dvm/DeraUsersListener'

const HomeScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [currentUser, setCurrentUser] = useState(null)
  const [bannerPhotos, setBannerPhotos] = useState([null])

  const [isServicesLoading, setIsServicesLoading] = useState(true)
  const [services, setServices] = useState([])

  useEffect(() => {
    let __UserListener = () => { }
    let __BannerPhotoListener = () => { }
    let __ServicesListener = () => { }
    let __AppointmentsListener = () => { }
    let __DeraUsersListener = () => { }

    const Setup = async () => {
      setIsLoading('Loading...')

      const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
      setCurrentUser(currentUser)

      __UserListener = UserListener({ currentUser, setCurrentUser, setAlert, navigation })
      __BannerPhotoListener = BannerPhotoListener({ setBannerPhotos })
      __ServicesListener = ServicesListeners({ currentUser, setIsServicesLoading, setServices })
      __AppointmentsListener = AppointmentsListener({ currentUser })
      __DeraUsersListener = DeraUsersListener({ currentUser })

      setIsLoading(null)
    }

    Setup()

    return () => {
      __UserListener()
      __BannerPhotoListener()
      __ServicesListener()
      __AppointmentsListener()
      __DeraUsersListener()
    }
  }, [])

  if (!currentUser || isLoading) {
    return <CustomLoading message='Loading...' insideTabNavigation />
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ backgroundColor: COLORS.COLOR_06, flex: 1 }}>
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

      <ScrollView>
        <HeaderHomeScreen
          images={bannerPhotos}
          noImagePlaceHolderText='Upcoming Promotions'
          profilePhoto={currentUser.profilePhoto}
          username={currentUser.fullname}
          address={currentUser.address}
        />

        <View style={{ padding: 16, gap: 16 }}>
          <SectionBarHomeScreen
            title='Services'
            isLoading={isServicesLoading}
            onExpand={() => { navigation.navigate(ROUTES.DVM.SHOW_SERVICES) }}
          />
          {
            isServicesLoading
              ?
              <CustomAnimatedLoader text='loading' />
              :
              <>
                <SectionButtonHomeScreen
                  title='Add New Service'
                  onPress={() => { navigation.navigate(ROUTES.DVM.ADD_SERVICE) }}
                />

                <ItemCardsHomeScreen
                  isLoading={isServicesLoading}
                  data={services}
                  titleKey='serviceTitle'
                  imageKey='serviceImage'
                  navigation={(item) => {
                    const payload = { service: item, isFromHomeScreen: true }
                    navigation.navigate(ROUTES.DVM.VIEW_SERVICE, payload)
                  }}
                />
              </>
          }
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

export default HomeScreen

const styles = StyleSheet.create({})