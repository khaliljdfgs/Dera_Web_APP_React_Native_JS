import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Animatable from 'react-native-animatable'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import * as Location from 'expo-location'

import CustomAppBar from '../../components/CustomAppBar'
import CustomLoading from '../../components/CustomLoading'
import CustomAlertDialog from '../../components/CustomAlertDialog'
import CustomTextInput from '../../components/CustomTextInput'
import CustomButton from '../../components/CustomButton'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'
import { ACCOUNT_STATUS, ROLES } from '../../config/values'
import { Firestore } from '../../config/firebase'
import FirebaseErrors from '../../utils/FirebaseErrors'
import { InputStringValidation, InputNumberValidation, REGULAR_EXPRESSION } from '../../utils/Validation'

const AddtionalInformationScreen = ({ navigation }) => {
  // To Show The Loading State
  const [isLoading, setIsLoading] = useState(null)

  // To Show The Alert Dialog
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [geoLocation, setGeoLocation] = useState(null)
  const [address, setAddress] = useState(null)
  const [uid, setUid] = useState(null)
  const [accountType, setAccountType] = useState(null)
  const [businessName, setBusinessName] = useState('')
  const [aboutUs, setAboutUs] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [primaryPhone, setPrimaryPhone] = useState('')
  const [secondaryPhone, setSecondaryPhone] = useState('')

  const CheckUsersCurrentInformation = async () => {
    setIsLoading('Loading...')

    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
    const {
      uid,
      accountType,
      geoLocation,
      address,
      businessName,
      aboutUs,
      yearsOfExperience,
      specialization,
      phone
    } = currentUser

    setUid(uid)
    setAccountType(accountType)
    setGeoLocation(!geoLocation ? geoLocation : `${geoLocation.latitude}, ${geoLocation.longitude}`)
    setAddress(address)
    setBusinessName(businessName)
    setAboutUs(aboutUs)
    setYearsOfExperience(yearsOfExperience)
    setSpecialization(specialization)
    setPrimaryPhone(phone?.primary)
    setSecondaryPhone(phone?.secondary)

    setIsLoading(null)
  }

  useEffect(() => { CheckUsersCurrentInformation() }, [])

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

  const HandleLogout = () => {
    setAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to logout?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        const ENDPOINT = await AsyncStorage.getItem('demo_url') || ''
        await AsyncStorage.clear()
        await AsyncStorage.setItem('demo_url', ENDPOINT)
        const screen = ROUTES.COMMON.LOGIN
        navigation.reset({ index: 0, routes: [{ name: screen }] })
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleSave = async () => {
    if (!geoLocation || (geoLocation && !geoLocation.includes(', '))) {
      setAlert({
        title: 'Info',
        message: 'Geo-Location is required!',
        positiveLabel: 'Ok',
        positiveCallback: () => setAlert(null),
      })
      return
    }

    const validation = [
      { type: 'string', data: { field: 'Address', value: address, min: 10, max: 100 } },
      {
        type: 'string', data: {
          field: 'Primary Phone', value: primaryPhone,
          regExp: REGULAR_EXPRESSION.PHONE, isRequired: true, min: 11, max: 11
        }
      },
      {
        type: 'string', data: {
          field: 'Secondary Phone', value: secondaryPhone,
          regExp: REGULAR_EXPRESSION.PHONE, isRequired: false, min: 11, max: 11
        }
      }
    ]

    if (accountType === ROLES.DERA) {
      validation.push({ type: 'string', data: { field: 'Business Name', value: businessName, min: 3, max: 100 } })
      validation.push({ type: 'string', data: { field: 'About', value: aboutUs, min: 20, max: 500 } })
    }

    if (accountType === ROLES.DVM) {
      validation.push({ type: 'number', data: { field: 'Years of Experience', value: yearsOfExperience, min: 0, max: Infinity } })
      validation.push({ type: 'string', data: { field: 'Specialization', value: specialization, min: 3, max: 50, isRequired: false } })
    }

    for (let i = 0; i < validation.length; i++) {
      const { type, data } = validation[i]

      if (type === 'string') {
        let validation = InputStringValidation(data)
        if (validation != null) {
          setAlert({
            title: 'Info',
            message: validation,
            positiveLabel: 'Ok',
            positiveCallback: () => setAlert(null),
          })
          return
        }
      } else if (type === 'number') {
        let validation = InputNumberValidation(data)
        if (validation != null) {
          setAlert({
            title: 'Info',
            message: validation,
            positiveLabel: 'Ok',
            positiveCallback: () => setAlert(null)
          })
          return
        }
      }
    }

    if (primaryPhone === secondaryPhone) {
      setAlert({
        title: 'Info',
        message: 'Primary and Secondary phone number can\'t be the same.',
        positiveLabel: 'Ok',
        positiveCallback: () => setAlert(null)
      })
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
        phone: {
          primary: primaryPhone.trim(),
          secondary: secondaryPhone?.trim() || ''
        },
        updatedAt: serverTimestamp(),
      }

      if (accountType === ROLES.DERA) {
        additionalData.businessName = businessName.trim()
        additionalData.aboutUs = aboutUs.trim()
      }

      if (accountType === ROLES.DVM) {
        additionalData.yearsOfExperience = Number(yearsOfExperience) || 0
        additionalData.specialization = specialization?.trim() || ''
      }

      const userCollectionRef = collection(Firestore, 'users')
      const userDocRef = doc(userCollectionRef, uid)
      await setDoc(userDocRef, additionalData, { merge: true })

      setAlert({
        title: 'Success',
        message: accountType === ROLES.CONSUMER
          ? 'Additional Information Updated Successfully! Please re-login to continue.'
          : 'Additional Information Updated Successfully! Please wait for the admin to activate your account.',
        positiveLabel: 'OK',
        positiveCallback: async () => {
          const ENDPOINT = await AsyncStorage.getItem('demo_url') || ''
          await AsyncStorage.clear()
          await AsyncStorage.setItem('demo_url', ENDPOINT)
          navigation.reset({ index: 0, routes: [{ name: ROUTES.COMMON.LOGIN }] })
          // const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
          // const updatedUser = { ...currentUser, ...additionalData }
          // await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser))

          // if (currentUser.status === ACCOUNT_STATUS.ACTIVE) {
          //   let screen = ROUTES.COMMON.LOGIN
          //   if (accountType === ROLES.DERA) {
          //     screen = ROUTES.DERA.STACK_NAVIGATOR
          //   } else if (accountType === ROLES.DVM) {
          //     screen = ROUTES.DVM.STACK_NAVIGATOR
          //   } else if (accountType === ROLES.CONSUMER) {
          //     screen = ROUTES.CONSUMER.STACK_NAVIGATOR
          //   }

          //   navigation.reset({ index: 0, routes: [{ name: screen }] })
          // }
        }
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

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Additional Info' onGoBack={null} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
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

      <CustomAppBar title='Additional Info' onGoBack={null} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          <Animatable.View animation='fadeInRight' duration={1750} style={styles.noticeContainer}>
            <Text style={styles.noticeHeading}>Notice</Text>
            <Text style={styles.noticeText}>
              To Provide You With The Best Services, We Need To Know Your Location And Address.
            </Text>
          </Animatable.View>

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

          <CustomTextInput
            label='Primary Phone'
            placeholder='03xxxxxxxxx'
            // placeholder='Enter Primary Phone Number'
            value={primaryPhone}
            onChangeText={(text) => {
              if (/^(0|03\d{0,9})$/.test(text)) {
                setPrimaryPhone(text)
              }
            }}
            keyboardType='numeric'
            maxLength={11}
          />

          <CustomTextInput
            label='Secondary Phone'
            // placeholder='Enter Secondary Phone Number'
            placeholder='03xxxxxxxxx'
            value={secondaryPhone}
            onChangeText={(text) => {
              if (/^(0|03\d{0,9})$/.test(text)) {
                setSecondaryPhone(text)
              }
            }}
            keyboardType='numeric'
            maxLength={11}
          />

          {
            accountType === ROLES.DERA &&
            <CustomTextInput
              label='Business Name'
              placeholder='Enter Your Business Name'
              value={businessName}
              onChangeText={(text) => setBusinessName(text)}
              maxLength={100}
            />
          }

          {
            accountType === ROLES.DERA &&
            <CustomTextInput
              label='About'
              placeholder='Write About Your Business!'
              value={aboutUs}
              onChangeText={(text) => { setAboutUs(text) }}
              multiline={true}
              maxLength={500}
            />
          }

          {
            accountType === ROLES.DVM &&
            <CustomTextInput
              label='Years Of Experience'
              placeholder='Enter Your Years Of Experience'
              value={yearsOfExperience}
              onChangeText={(text) => {
                if (/^\d*\.?\d*$/.test(text)) {
                  setYearsOfExperience(text)
                }
              }}
              keyboardType='numeric'
            />
          }

          {
            accountType === ROLES.DVM &&
            <CustomTextInput
              label='Specialization'
              placeholder='Enter Your Specialization'
              value={specialization}
              onChangeText={(text) => setSpecialization(text)}
              maxLength={50}
            />
          }

          <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
            <CustomButton title='Log out' onPress={HandleLogout}
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }} />
            <CustomButton title='Save' onPress={HandleSave}
              containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }} />
          </View>

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default AddtionalInformationScreen

const styles = StyleSheet.create({
  noticeContainer: {
    padding: 16,
    borderRadius: 6,
    backgroundColor: COLORS.COLOR_04
  },
  noticeHeading: {
    fontSize: 18,
    fontFamily: 'NunitoSans-Bold',
    textTransform: 'uppercase',
    color: COLORS.COLOR_06,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 18,
    fontFamily: 'NunitoSans-Regular',
    color: COLORS.COLOR_06,
  }
})