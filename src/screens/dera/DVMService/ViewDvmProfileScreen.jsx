import React, { useState, useEffect } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Linking from 'expo-linking'

import CustomAppBar from '../../../components/CustomAppBar'
import HeaderHomeScreen from '../../../components/HomeScreen/HeaderHomeScreen'
import CustomTable from '../../../components/CustomTable'
import CustomAlertDialog from '../../../components/CustomAlertDialog'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'

const ViewDvmProfileScreen = ({ navigation, route }) => {
  const [alert, setAlert] = useState(null)
  const { user, distanceString, fromChatScreen } = route.params

  const [images, setImages] = useState([])

  const OpenURL = async (handle, media) => {
    const _media = media?.toLowerCase()
    let _handle = handle

    if (_handle === 'N/A' || _handle === '') return

    if (_media === 'facebook') {
      _handle = `https://www.facebook.com/${handle}`
    } else if (_media === 'instagram') {
      _handle = `https://www.instagram.com/${handle}`
    } else if (_media === 'twitter') {
      _handle = `https://www.twitter.com/${handle}`
    } else if (_media === 'youtube') {
      _handle = `https://www.youtube.com/@${handle}`
    } else if (_media === 'tiktok') {
      _handle = `https://www.tiktok.com/@${handle}`
    }

    await Linking.canOpenURL(_handle).then((res) => {
      if (res) {
        Linking.openURL(_handle)
      } else {
        setAlert({
          title: 'Error',
          message: 'The link is invalid.',
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null),
        })
      }
    })
  }

  const Setup = async () => {
    const configs = JSON.parse(await AsyncStorage.getItem('configs'))
    setImages(configs?.dvm?.bannerPhotos || [])
  }

  useEffect(() => { Setup() }, [])

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

      <CustomAppBar title='DVM Profile' onGoBack={() => navigation.goBack()} />

      <ScrollView>
        <HeaderHomeScreen
          username={user.fullname}
          address={
            `${distanceString.split(' ')[0]}` +
            `${distanceString.split(' ')[1] === 'km' ? ' Kilometers' : ' Meters'} away`
          }
          noImagePlaceHolderText='Upcoming Promotions'
          profilePhoto={user.profilePhoto}
          images={images}
          isViewMode={!fromChatScreen}
          onPress={async () => {
            const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
            const payload = { user: user, currentUser: currentUser, fromProfile: true }
            navigation.navigate(ROUTES.COMMON.CHAT_SCREEN, payload)
          }}
        />

        <View style={{ padding: 24, gap: 24 }}>
          <CustomTable
            heading='General Information'
            data={[
              {
                left: 'Distance',
                right: distanceString || ''
              },
              {
                left: 'Specialist In',
                right: user.specialization || 'N/A'
              },
              {
                left: 'Experience',
                right: `${user.yearsOfExperience} Years`
              },
              {
                left: 'Email',
                right: user.email
              },
              {
                left: 'Phone',
                right: (user.phone && `${user.phone?.primary}${user.phone?.secondary ? '\n' + user.phone?.secondary : ''}`) || 'N/A'
              },
              {
                left: 'Address',
                right: user.address
              },
              {
                left: 'Gender',
                right: `${user.gender}`.toUpperCase()
              },
            ]}
            leftCellStyle={{ flex: 1.25 }}
          />

          <CustomTable
            heading='Payment Wallets'
            data={[
              {
                left: 'Easypaisa',
                right: (user.paymentWallets?.easyPaisa?.title && user.paymentWallets?.easyPaisa?.number)
                  ? `${user.paymentWallets?.easyPaisa?.title}\n${user.paymentWallets?.easyPaisa?.number}` : 'N/A'
              },
              {
                left: 'JazzCash',
                right: (user.paymentWallets?.jazzCash?.title && user.paymentWallets?.jazzCash?.number)
                  ? `${user.paymentWallets?.jazzCash?.title}\n${user.paymentWallets?.jazzCash?.number}` : 'N/A'
              },
              {
                left: 'U-Paisa',
                right: (user.paymentWallets?.uPaisa?.title && user.paymentWallets?.uPaisa?.number)
                  ? `${user.paymentWallets?.uPaisa?.title}\n${user.paymentWallets?.uPaisa?.number}` : 'N/A'
              },
            ]}
            leftCellStyle={{ flex: 1.25 }}
          />

          <CustomTable
            heading='Social Media Handles'
            isSocialMedia={true}
            data={[
              {
                left: 'Facebook',
                right: user.socialMediaHandles?.facebook || 'N/A',
                onPress: () => OpenURL(user.socialMediaHandles?.facebook || '', 'facebook')
              },
              {
                left: 'Instagram',
                right: `${user.socialMediaHandles?.instagram}` || 'N/A',
                onPress: () => OpenURL(user.socialMediaHandles?.instagram || '', 'instagram')
              },
              {
                left: 'Tiktok',
                right: user.socialMediaHandles?.tiktok || 'N/A',
                onPress: () => OpenURL(user.socialMediaHandles?.tiktok || '', 'tiktok')
              },
              {
                left: 'Twitter',
                right: user.socialMediaHandles?.twitter || 'N/A',
                onPress: () => OpenURL(user.socialMediaHandles?.twitter || '', 'twitter')
              },
              {
                left: 'Youtube',
                right: user.socialMediaHandles?.youtube || 'N/A',
                onPress: () => OpenURL(user.socialMediaHandles?.youtube || '', 'youtube')
              },
            ]}
            leftCellStyle={{ flex: 1.25 }}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

    </SafeAreaView>
  )
}

export default ViewDvmProfileScreen

const styles = StyleSheet.create({})