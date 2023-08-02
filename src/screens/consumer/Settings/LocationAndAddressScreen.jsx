import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialIcons } from '@expo/vector-icons'
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import * as Location from 'expo-location'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomLoading from '../../../components/CustomLoading'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTextInput from '../../../components/CustomTextInput'
import CustomButton from '../../../components/CustomButton'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { Firestore } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'
import { InputStringValidation } from '../../../utils/Validation'

const LocationAndAddressScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [geoLocation, setGeoLocation] = useState(null)
  const [address, setAddress] = useState(null)
  const [uid, setUid] = useState(null)

  const [initialData, setInitialData] = useState(null)

  const ResetToOriginalInfo = async () => {
    setIsLoading('Loading...')
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
    const { uid, geoLocation, address } = currentUser

    setUid(uid)
    setGeoLocation(`${geoLocation.latitude}, ${geoLocation.longitude}`)
    setAddress(address)

    setInitialData({
      uid: currentUser.uid,
      geoLocation: `${currentUser.geoLocation.latitude}, ${currentUser.geoLocation.longitude}`,
      address: currentUser.address
    })

    setIsLoading(null)
  }

  useEffect(() => { ResetToOriginalInfo() }, [])

  const HandleReset = () => {
    setAlert({
      message: 'Are you sure you want to reset your information?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        ResetToOriginalInfo()
        setAlert(null)
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleGrabGeoLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied')
      return
    }

    setGeoLocation('Loading...')
    const geoLocation = await Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Highest })

    if (!geoLocation) {
      setAlert({
        title: 'Error',
        message: 'Failed to get geo-location from your device. Make sure that you have enabled location permission and have working internet connection.',
        positiveLabel: 'Try Again',
        positiveCallback: () => setAlert(null)
      })
    }

    setGeoLocation(`${geoLocation.coords.latitude}, ${geoLocation.coords.longitude}`)
  }

  const HandleSave = async () => {
    if (!geoLocation || (geoLocation && !geoLocation.includes(', '))) {
      setAlert({ message: 'Geo-Location is required!', positiveCallback: () => setAlert(null) })
      return
    }

    const isAddressInvalid = InputStringValidation({
      field: 'Address',
      value: address,
      min: 10,
      max: 100,
    })

    if (isAddressInvalid) {
      setAlert({ message: isAddressInvalid, positiveCallback: () => setAlert(null) })
      return
    }

    setIsLoading('Saving Info...')

    try {
      const additionalData = {
        address: address.trim(),
        geoLocation: {
          latitude: Number(geoLocation.split(', ')[0].trim()),
          longitude: Number(geoLocation.split(', ')[1].trim())
        },
        updatedAt: serverTimestamp(),
      }

      const userCollectionRef = collection(Firestore, 'users')
      const userDocRef = doc(userCollectionRef, uid)
      await setDoc(userDocRef, additionalData, { merge: true })

      setAlert({
        title: 'Success',
        message: 'Information Updated Successfully! You need to re-login to see the changes.',
        positiveLabel: 'OK',
        positiveCallback: async () => {
          setAlert(null)
          const ENDPOINT = await AsyncStorage.getItem('demo_url') || ''
          await AsyncStorage.clear()
          await AsyncStorage.setItem('demo_url', ENDPOINT)
          const screen = ROUTES.COMMON.LOGIN
          navigation.reset({ index: 0, routes: [{ name: screen }] })
        },
      })
    } catch (error) {
      setAlert({
        title: 'Error',
        message: FirebaseErrors[error.code] || error.message,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null),
      })
    }

    setIsLoading(null)
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Location and Address' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='Location and Address' onGoBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          <CustomTextInput
            label='Geo-Location'
            placeholder='Click To Grab Geo-Location'
            value={geoLocation}
            selectMode={true}
            selectModeOnPress={HandleGrabGeoLocation}
          />

          <CustomTextInput
            label='Address'
            placeholder='Enter Your Address'
            value={address}
            onChangeText={(text) => setAddress(text)}
            maxLength={100}
            multiline={true}
          />

          <View style={{ flexDirection: 'row', columnGap: 16 }}>
            <CustomButton
              onPress={HandleReset}
              title='Reset'
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              leftIcon={<MaterialIcons name='restore' size={24} color={COLORS.COLOR_06} />}
            />
            <CustomButton
              onPress={() => {
                if (
                  initialData.uid === `${uid}`.trim() &&
                  initialData.geoLocation === `${geoLocation}`.trim() &&
                  initialData.address === `${address}`.trim()
                ) {
                  navigation.goBack()
                  return
                }
                HandleSave()
              }}
              title='Save'
              containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
              leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default LocationAndAddressScreen

const styles = StyleSheet.create({})