import React, { useState, useEffect } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FontAwesome5, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'

import CustomLoading from '../../components/CustomLoading'
import CustomAlertDialog from '../../components/CustomAlertDialog'
import HeaderHomeScreen from '../../components/HomeScreen/HeaderHomeScreen'
import SectionBarHomeScreen from '../../components/HomeScreen/SectionBarHomeScreen'
import SectionButtonHomeScreen from '../../components/HomeScreen/SectionButtonHomeScreen'
import ItemCardsHomeScreen from '../../components/HomeScreen/ItemCardsHomeScreen'
import CustomAnimatedLoader from '../../components/CustomAnimatedLoader'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'

import UserListener from '../../listeners/dera/UserListener'
import ConfigsListener from '../../listeners/dera/ConfigsListener'
import DairyProductsListener from '../../listeners/dera/DairyProductsListener'
import LiveStockListener from '../../listeners/dera/LiveStockListener'
import DvmUsersListener from '../../listeners/dera/DvmUsersListener'
import ServicesListener from '../../listeners/dera/ServicesListener'
import ConsumerUsersListener from '../../listeners/dera/ConsumerUsersListener'
import DairyProductOrdersListener from '../../listeners/dera/DairyProductOrdersListener'

const HomeScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [currentUser, setCurrentUser] = useState(null)

  const [isDairyProductsLoading, setIsDairyProductsLoading] = useState(true)
  const [dairyProducts, setDairyProducts] = useState([])

  const [isLiveStockLoading, setIsLiveStockLoading] = useState(true)
  const [liveStockProducts, setLiveStockProducts] = useState([])

  const [isServicesLoading, setIsServicesLoading] = useState(true)
  const [services, setServices] = useState([])

  useEffect(() => {
    let __UserListener = () => { }
    let __ConfigsListener = () => { }
    let __ConsumerUsersListener = () => { }
    let __DairyProductOrdersListener = () => { }
    let __DairyProductsListener = () => { }
    let __LiveStockListener = () => { }
    let __DvmUsersListener = () => { }
    let __ServicesListener = () => { }

    const Setup = async () => {
      setIsLoading('Loading...')

      const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
      currentUser.bannerPhotos = currentUser.bannerPhotos.filter((photo) => photo.length > 0)
      setCurrentUser(currentUser)

      __UserListener = UserListener({ currentUser, navigation, setAlert, setCurrentUser })
      __ConfigsListener = ConfigsListener()
      __ConsumerUsersListener = ConsumerUsersListener({ currentUser })
      __DairyProductOrdersListener = DairyProductOrdersListener({ currentUser })
      __DairyProductsListener = DairyProductsListener({ currentUser, setIsDairyProductsLoading, setDairyProducts })
      __LiveStockListener = LiveStockListener({ currentUser, setIsLiveStockLoading, setLiveStockProducts })
      __DvmUsersListener = DvmUsersListener({})
      __ServicesListener = ServicesListener({ currentUser, setIsServicesLoading, setServices })

      setIsLoading(null)
    }

    Setup()

    return () => {
      __UserListener()
      __ConfigsListener()
      __ConsumerUsersListener()
      __DairyProductOrdersListener()
      __DairyProductsListener()
      __LiveStockListener()
      __DvmUsersListener()
      __ServicesListener()
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
          images={currentUser.bannerPhotos.length > 0 ? currentUser.bannerPhotos : [null]}
          noImagePlaceHolderText='Upload Your Banner Photo'
          profilePhoto={currentUser.profilePhoto}
          username={currentUser.businessName}
          address={currentUser.address}
        />

        <View style={{ padding: 16, gap: 16 }}>
          <SectionButtonHomeScreen
            title='Scan QR Code'
            onPress={() => navigation.navigate(ROUTES.DERA.QR_CODE_SCAN)}
            icon={<MaterialIcons name='qr-code' size={24} color={COLORS.COLOR_01} />}
          />

          <SectionBarHomeScreen
            title='Dairy Products'
            isLoading={isDairyProductsLoading}
            onExpand={() => navigation.navigate(ROUTES.DERA.SHOW_DAIRY_PRODUCTS)}
          />
          {
            isDairyProductsLoading
              ?
              <CustomAnimatedLoader text='loading' />
              :
              <>
                <SectionButtonHomeScreen
                  title='Add Dairy Product'
                  onPress={() => navigation.navigate(ROUTES.DERA.ADD_DAIRY_PRODUCT)}
                />

                <ItemCardsHomeScreen
                  isLoading={isDairyProductsLoading}
                  data={dairyProducts}
                  titleKey='productName'
                  imageKey='productImage'
                  navigation={(item) => {
                    const payload = { product: item, isFromHomeScreen: true }
                    navigation.navigate(ROUTES.DERA.VIEW_DAIRY_PRODUCT, payload)
                  }}
                  details={[
                    {
                      // icon: <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />,
                      // key: 'productPrice'
                      render: (item) => `Rs. ${item.productPrice} / ${item.priceUnit}`
                    },
                    {
                      icon: <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />,
                      key: 'productCategory'
                    },
                  ]}
                />
              </>
          }
        </View>

        <View style={{ padding: 16, gap: 16 }}>
          <SectionBarHomeScreen
            title='Livestock'
            isLoading={isLiveStockLoading}
            onExpand={() => navigation.navigate(ROUTES.DERA.SHOW_LIVESTOCKS)}
          />

          {
            isLiveStockLoading
              ?
              <CustomAnimatedLoader text='loading' />
              :
              <>
                <SectionButtonHomeScreen
                  title='Add Livestock'
                  onPress={() => navigation.navigate(ROUTES.DERA.ADD_LIVESTOCK)}
                />

                <ItemCardsHomeScreen
                  isLoading={isLiveStockLoading}
                  data={liveStockProducts}
                  titleKey='liveStockTitle'
                  renderImage={(item) => item.liveStockPhotos.filter((photo) => photo)[0] || ''}
                  navigation={(item) => {
                    const payload = { liveStock: item, isFromHomeScreen: true }
                    navigation.navigate(ROUTES.DERA.VIEW_LIVESTOCK, payload)
                  }}
                  details={[
                    {
                      // icon: <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />,
                      // key: 'liveStockPrice'
                      render: (item) => `Rs. ${item.liveStockPrice}`
                    },
                    {
                      icon: <MaterialIcons name='category' size={16} color={COLORS.COLOR_01} />,
                      render: (item) => item.liveStockFeatures.breed
                        ? `${item.liveStockFeatures?.breed} - ${item.liveStockCategory}`
                        : item.liveStockCategory
                    },
                  ]}
                />
              </>
          }
        </View>

        <View style={{ padding: 16, gap: 16 }}>
          <SectionBarHomeScreen
            title='DVM Services'
            isLoading={isServicesLoading}
            onExpand={() => navigation.navigate(ROUTES.DERA.SHOW_DVM_SERVICES)}
          />

          {
            isServicesLoading
              ?
              <CustomAnimatedLoader text='loading' />
              :
              <ItemCardsHomeScreen
                isLoading={isServicesLoading}
                data={services}
                titleKey='serviceTitle'
                imageKey='serviceImage'
                navigation={(item) => {
                  const payload = { service: item, isFromHomeScreen: true }
                  navigation.navigate(ROUTES.DERA.VIEW_DVM_SERVICE, payload)
                }}
                details={[
                  {
                    icon: <Ionicons name='person' size={16} color={COLORS.COLOR_01} />,
                    render: (item) => item.owner?.fullname
                  },
                  {
                    icon: <FontAwesome5 name='location-arrow' size={12} color={COLORS.COLOR_01} />,
                    render: (item) => item.distanceString,
                    containterStyle: { gap: 9 }
                  },
                ]}
              />
          }
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})

export default HomeScreen