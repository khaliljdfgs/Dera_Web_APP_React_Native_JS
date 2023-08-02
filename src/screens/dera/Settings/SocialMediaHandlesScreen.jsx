import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { MaterialIcons } from '@expo/vector-icons'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomLoading from '../../../components/CustomLoading'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTextInput from '../../../components/CustomTextInput'
import CustomButton from '../../../components/CustomButton'

import COLORS from '../../../config/colors'
import { Firestore } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'

const SocialMediaHandlesScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [facebook, setFacebook] = useState('')
  const [instagram, setInstagram] = useState('')
  const [twitter, setTwitter] = useState('')
  const [youtube, setYoutube] = useState('')
  const [tiktok, setTiktok] = useState('')

  const [initialValues, setInitialValues] = useState({})

  const GetSocialMediaHandles = async () => {
    try {
      setIsLoading('Loading...')
      const { uid } = JSON.parse(await AsyncStorage.getItem('currentUser'))

      const userDoc = doc(Firestore, 'users', uid)
      const userDocSnapshot = await getDoc(userDoc)

      if (userDocSnapshot.exists()) {
        const { socialMediaHandles } = userDocSnapshot.data()
        setFacebook(socialMediaHandles?.facebook)
        setInstagram(socialMediaHandles?.instagram)
        setTwitter(socialMediaHandles?.twitter)
        setYoutube(socialMediaHandles?.youtube)
        setTiktok(socialMediaHandles?.tiktok)

        setInitialValues({
          facebook: socialMediaHandles?.facebook,
          instagram: socialMediaHandles?.instagram,
          twitter: socialMediaHandles?.twitter,
          youtube: socialMediaHandles?.youtube,
          tiktok: socialMediaHandles?.tiktok
        })
      }
    } catch (error) {
      setAlert({
        title: 'Error',
        message: FirebaseErrors[error.code] || error.message,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
    }

    setIsLoading(null)
  }

  useEffect(() => { GetSocialMediaHandles() }, [])

  const HandleClear = () => {
    if (facebook === '' && instagram === '' && twitter === '' && youtube === '' && tiktok === '') return

    const ClearFields = () => {
      setFacebook('')
      setInstagram('')
      setTwitter('')
      setYoutube('')
      setTiktok('')
      setAlert(null)
    }

    setAlert({
      message: 'Are you sure you want to clear all fields?',
      positiveLabel: 'Yes',
      positiveCallback: ClearFields,
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleSave = async () => {
    const SaveSocialMediaHandles = async () => {
      try {
        setIsLoading('Saving...')
        const { uid } = JSON.parse(await AsyncStorage.getItem('currentUser'))

        const updatedRecord = {
          socialMediaHandles: {
            facebook: facebook?.trim() || '',
            instagram: instagram?.trim() || '',
            twitter: twitter?.trim() || '',
            youtube: youtube?.trim() || '',
            tiktok: tiktok?.trim() || '',
          },
          updatedAt: serverTimestamp(),
        }

        await setDoc(doc(Firestore, 'users', uid), updatedRecord, { merge: true })

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: 'Social Media Handles Saved Successfully!',
          positiveLabel: 'OK',
          positiveCallback: () => navigation.goBack()
        })
      } catch (error) {
        setIsLoading(null)
        setAlert({
          message: FirebaseErrors[error.code] || error.message,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null)
        })
      }
    }

    setAlert({
      message: 'Are you sure you want to save these social media handles?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setAlert(null)
        SaveSocialMediaHandles()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const ValidateFields = () => {
    const regex = /^[a-zA-Z0-9_.-]*$/

    if (facebook && !regex.test(facebook)) {
      setAlert({
        title: 'Warning',
        message: 'Facebook username is invalid',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return false
    } else if (instagram && !regex.test(instagram)) {
      setAlert({
        title: 'Warning',
        message: 'Instagram username is invalid',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return false
    } else if (twitter && !regex.test(twitter)) {
      setAlert({
        title: 'Warning',
        message: 'Twitter username is invalid',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return false
    } else if (youtube && !regex.test(youtube)) {
      setAlert({
        title: 'Warning',
        message: 'Youtube username is invalid',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return false
    } else if (tiktok && !regex.test(tiktok)) {
      setAlert({
        title: 'Warning',
        message: 'Tiktok username is invalid',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return false
    }

    return true
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Social Media Handles' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='Social Media Handles' onGoBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          <CustomTextInput
            label='Facebook'
            placeholder='Enter Facebook Username'
            value={facebook}
            onChangeText={setFacebook}
            rightIcon={<MaterialIcons name='clear' color={COLORS.COLOR_01} size={20} />}
            onRightIconPress={() => setFacebook('')}
            containerStyle={{ flex: 1 }}
          />

          <CustomTextInput
            label='Instagram'
            placeholder='Enter Instagram Username'
            value={instagram}
            onChangeText={setInstagram}
            rightIcon={<MaterialIcons name='clear' color={COLORS.COLOR_01} size={20} />}
            onRightIconPress={() => setInstagram('')}
            containerStyle={{ flex: 1 }}
          />

          <CustomTextInput
            label='Twitter'
            placeholder='Enter Twitter Username'
            value={twitter}
            onChangeText={setTwitter}
            rightIcon={<MaterialIcons name='clear' color={COLORS.COLOR_01} size={20} />}
            onRightIconPress={() => setTwitter('')}
            containerStyle={{ flex: 1 }}
          />

          <CustomTextInput
            label='Youtube'
            placeholder='Enter Youtube Username'
            value={youtube}
            onChangeText={setYoutube}
            rightIcon={<MaterialIcons name='clear' color={COLORS.COLOR_01} size={20} />}
            onRightIconPress={() => setYoutube('')}
            containerStyle={{ flex: 1 }}
          />

          <CustomTextInput
            label='Tiktok'
            placeholder='Enter Tiktok Username'
            value={tiktok}
            onChangeText={setTiktok}
            rightIcon={<MaterialIcons name='clear' color={COLORS.COLOR_01} size={20} />}
            onRightIconPress={() => setTiktok('')}
            containerStyle={{ flex: 1 }}
          />

          <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
            <CustomButton
              title='Clear'
              leftIcon={<MaterialIcons name='clear' color={COLORS.COLOR_06} size={24} />}
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              onPress={HandleClear}
            />

            <CustomButton
              title='Save'
              containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
              leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
              onPress={() => {
                if (
                  `${facebook}`.trim() === initialValues.facebook &&
                  `${instagram}`.trim() === initialValues.instagram &&
                  `${twitter}`.trim() === initialValues.twitter &&
                  `${youtube}`.trim() === initialValues.youtube &&
                  `${tiktok}`.trim() === initialValues.tiktok
                ) {
                  navigation.goBack()
                } else if (ValidateFields()) {
                  HandleSave()
                }
              }}
            />
          </View>

          <View style={{ height: 200 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default SocialMediaHandlesScreen

const styles = StyleSheet.create({})