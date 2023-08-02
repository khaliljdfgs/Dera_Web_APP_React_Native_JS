import React, { useState, useEffect } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'

import CustomLoading from '../../components/CustomLoading'
import CustomAlertDialog from '../../components/CustomAlertDialog'
import HeaderHomeScreen from '../../components/HomeScreen/HeaderHomeScreen'
import SectionBarHomeScreen from '../../components/HomeScreen/SectionBarHomeScreen'
import CustomAnimatedLoader from '../../components/CustomAnimatedLoader'
import ItemCardsHomeScreen from '../../components/HomeScreen/ItemCardsHomeScreen'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'

import UserListener from '../../listeners/consumer/UserListener'
import BannerPhotoListener from '../../listeners/consumer/BannerPhotoListener'
import DeraUsersListener from '../../listeners/consumer/DeraUsersListener'
import DairyProductListener from '../../listeners/consumer/DairyProductListener'
import LiveStockListener from '../../listeners/consumer/LiveStockListener'
import NotificationsListener from '../../listeners/consumer/NotificationsListener'

const HomeScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [currentUser, setCurrentUser] = useState(null)
  const [bannerPhotos, setBannerPhotos] = useState([null])

  const [isDairyProductsLoading, setIsDairyProductsLoading] = useState(true)
  const [dairyProducts, setDairyProducts] = useState([])

  const [isLiveStockLoading, setIsLiveStockLoading] = useState(true)
  const [liveStockProducts, setLiveStockProducts] = useState([])

  useEffect(() => {
    let __UserListener = () => { }
    let __BannerPhotoListener = () => { }
    let __DeraUsersListener = () => { }
    let __DairyProductListener = () => { }
    let __LiveStockListener = () => { }
    let __NotificationsListener = () => { }

    const Setup = async () => {
      setIsLoading('Loading...')

      const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
      setCurrentUser(currentUser)

      __UserListener = UserListener({ currentUser, setCurrentUser, setAlert, navigation })
      __BannerPhotoListener = BannerPhotoListener({ setBannerPhotos })
      __DeraUsersListener = DeraUsersListener({ currentUser })
      __DairyProductListener = DairyProductListener({ setIsDairyProductsLoading, setDairyProducts })
      __LiveStockListener = LiveStockListener({ setIsLiveStockLoading, setLiveStockProducts })
      __NotificationsListener = NotificationsListener({ currentUser, setAlert })

      setIsLoading(null)
    }

    Setup()

    return () => {
      __UserListener()
      __BannerPhotoListener()
      __DeraUsersListener()
      __DairyProductListener()
      __LiveStockListener()
      __NotificationsListener()
    }
  }, [])

  if (!currentUser || isLoading) {
    return <CustomLoading message='Loading' insideTabNavigation />
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
            title='Dairy Products'
            isLoading={isDairyProductsLoading}
            onExpand={() => navigation.navigate(ROUTES.CONSUMER.SHOW_DAIRY_PRODUCTS)}
          />
          {
            isDairyProductsLoading
              ?
              <CustomAnimatedLoader text='loading' />
              :
              <ItemCardsHomeScreen
                isLoading={isDairyProductsLoading}
                data={dairyProducts}
                titleKey='productName'
                imageKey='productImage'
                navigation={(item) => {
                  const payload = { product: item }
                  navigation.navigate(ROUTES.CONSUMER.VIEW_DAIRY_PRODUCT, payload)
                }}
                details={[
                  {
                    // icon: <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />,
                    // key: 'productPrice'
                    render: (item) => `Rs. ${item.productPrice} / ${item.priceUnit}`
                  },
                  {
                    icon: <Ionicons name='person' size={16} color={COLORS.COLOR_01} />,
                    render: (item) => item.owner?.businessName || item.owner?.fullname,
                  },
                  {
                    icon: <FontAwesome5 name='location-arrow' size={12} color={COLORS.COLOR_01} />,
                    render: (item) => item.owner?.distanceString,
                    containterStyle: { gap: 9 }
                  },
                ]}
              />
          }
        </View>

        <View style={{ padding: 16, gap: 16 }}>
          <SectionBarHomeScreen
            title='Livestock'
            isLoading={isLiveStockLoading}
            onExpand={() => navigation.navigate(ROUTES.CONSUMER.SHOW_LIVESTOCKS)}
          />

          {
            isLiveStockLoading
              ?
              <CustomAnimatedLoader text='loading' />
              :
              <ItemCardsHomeScreen
                isLoading={isLiveStockLoading}
                data={liveStockProducts}
                titleKey='liveStockTitle'
                renderImage={(item) => item.liveStockPhotos.filter((photo) => photo)[0] || ''}
                navigation={(item) => {
                  const payload = { liveStock: item }
                  navigation.navigate(ROUTES.CONSUMER.VIEW_LIVESTOCK, payload)
                }}
                details={[
                  {
                    // icon: <MaterialCommunityIcons name='currency-rupee' size={16} color={COLORS.COLOR_01} />,
                    // key: 'liveStockPrice'
                    render: (item) => `Rs. ${item.liveStockPrice}`
                  },
                  {
                    icon: <Ionicons name='person' size={16} color={COLORS.COLOR_01} />,
                    render: (item) => item.owner?.businessName || item.owner?.fullname,
                  },
                  {
                    icon: <Ionicons name='ios-flag-outline' size={16} color={COLORS.COLOR_01} />,
                    render: (item) => `${item.liveStockStatus}`.toUpperCase()
                  },
                  {
                    icon: <FontAwesome5 name='location-arrow' size={12} color={COLORS.COLOR_01} />,
                    render: (item) => item.owner?.distanceString,
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