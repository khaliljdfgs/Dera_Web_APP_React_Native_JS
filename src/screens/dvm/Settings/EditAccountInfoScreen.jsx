import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, Image, Pressable } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuidv4 from 'uuid'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { SaveFormat, manipulateAsync } from 'expo-image-manipulator'
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage'
import { updateEmail, updatePassword } from 'firebase/auth'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomLoading from '../../../components/CustomLoading'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTextInput from '../../../components/CustomTextInput'
import CustomButton from '../../../components/CustomButton'
import CustomRadioButton from '../../../components/CustomRadioButton'
import CustomImagePicker from '../../../components/CustomImagePicker'
import CustomIconButton from '../../../components/CustomIconButton'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { Firestore, Storage, Authentication } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'
import { InputStringValidation, InputNumberValidation, REGULAR_EXPRESSION } from '../../../utils/Validation'

import IMAGE_PLACEHOLDER_SQUARE from '../../../../assets/images/image-placeholder-square.png'

const EditAccountInfoScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [gender, setGender] = useState('')
  const [yearsOfExperience, setYearsOfExperience] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [primaryPhone, setPrimaryPhone] = useState('')
  const [secondaryPhone, setSecondaryPhone] = useState('')

  const [initialData, setInitialData] = useState({})

  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const [image, setImage] = useState(null)
  const [pickImage, setPickImage] = useState(false)

  const ResetToOriginalData = async () => {
    setIsLoading('Loading...')
    const user = JSON.parse(await AsyncStorage.getItem('currentUser'))

    setFullname(user.fullname)
    setEmail(user.email)
    setGender(user.gender)
    setImage(user.profilePhoto || '')
    setYearsOfExperience(user.yearsOfExperience + '')
    setSpecialization(user.specialization)
    setPrimaryPhone(user.phone.primary || '')
    setSecondaryPhone(user.phone.secondary || '')
    setPassword('')
    setIsPasswordVisible(false)

    setInitialData({
      fullname: user.fullname,
      email: user.email,
      gender: user.gender,
      image: user.profilePhoto || '',
      yearsOfExperience: user.yearsOfExperience + '',
      specialization: user.specialization,
      primaryPhone: user.phone.primary || '',
      secondaryPhone: user.phone.secondary || ''
    })

    setIsLoading(null)
  }

  useEffect(() => { ResetToOriginalData() }, [])

  const HandleUploadImage = () => {
    setPickImage(true)
  }

  const HandleReset = () => {
    setAlert({
      message: 'Are you sure you want to reset your information?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        ResetToOriginalData()
        setAlert(null)
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleSave = async () => {
    const UploadImage = async (image, uploadedImage, message) => {
      if ((image.startsWith('file') && uploadedImage.startsWith('http')) || (!image && uploadedImage.startsWith('http'))) {
        const imageRef = ref(Storage, uploadedImage.split('.com/o/')[1].split('?')[0])
        await deleteObject(imageRef)
      }

      if (image.startsWith('file')) {
        setIsLoading('Compressing...')
        const { uri } = await manipulateAsync(image,
          [{ resize: { width: 1600, height: 1600 } }],
          { format: SaveFormat.JPEG, compress: 0.7 }
        )

        setIsLoading(message)
        const imageBlob = await (await fetch(uri)).blob()
        const reference = ref(Storage, `${uuidv4()}`)
        const uploadResponse = await uploadBytes(reference, imageBlob)
        const url = await getDownloadURL(uploadResponse.ref)
        return url
      }

      return ''
    }

    const UpdateUserInformation = async () => {
      setIsLoading('Saving...')
      const { uid, profilePhoto, email: userEmail } = JSON.parse(await AsyncStorage.getItem('currentUser'))

      if (userEmail !== email.trim()) {
        try {
          setIsLoading('Updating Email...')
          await updateEmail(Authentication.currentUser, email.trim())
        } catch (error) {
          setAlert({
            message: FirebaseErrors[error.code] || error.message,
            positiveLabel: 'OK',
            positiveCallback: async () => {
              if (error.code === 'auth/requires-recent-login') {
                const ENDPOINT = await AsyncStorage.getItem('demo_url') || ''
                await AsyncStorage.clear()
                await AsyncStorage.setItem('demo_url', ENDPOINT)
                const screen = ROUTES.COMMON.LOGIN
                navigation.reset({ index: 0, routes: [{ name: screen }] })
              }
              setAlert(null)
            }
          })

          setIsLoading(null)
          return
        }
      }

      if (password.trim() !== '') {
        try {
          setIsLoading('Updating Password...')
          await updatePassword(Authentication.currentUser, password.trim())
        } catch (error) {
          setAlert({
            message: FirebaseErrors[error.code] || error.message,
            positiveLabel: 'OK',
            positiveCallback: async () => {
              if (error.code === 'auth/requires-recent-login') {
                const ENDPOINT = await AsyncStorage.getItem('demo_url') || ''
                await AsyncStorage.clear()
                await AsyncStorage.setItem('demo_url', ENDPOINT)
                const screen = ROUTES.COMMON.LOGIN
                navigation.reset({ index: 0, routes: [{ name: screen }] })
              }
              setAlert(null)
            }
          })

          setIsLoading(null)
          return
        }
      }

      try {
        const profilePhotoURL = await UploadImage(image, profilePhoto, 'Uploading Image...')

        const updatedRecord = {
          fullname: fullname.trim(),
          email: email.trim(),
          gender: gender.trim(),
          profilePhoto: profilePhotoURL || initialData.image,
          yearsOfExperience: Number(yearsOfExperience) || 0,
          specialization: specialization?.trim() || '',
          phone: {
            primary: primaryPhone.trim(),
            secondary: secondaryPhone.trim() || '',
          },
          updatedAt: serverTimestamp(),
        }

        await setDoc(doc(Firestore, 'users', uid), updatedRecord, { merge: true })

        setAlert({
          title: 'Success',
          message: 'Account Information Updated Successfully!',
          positiveLabel: 'OK',
          positiveCallback: () => navigation.goBack()
        })
      } catch (error) {
        setAlert({
          message: FirebaseErrors[error.code] || error.message,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null)
        })
      }

      setIsLoading(null)
    }

    const validation = [
      { type: 'string', data: { field: 'Fullname', value: fullname, min: 3, max: 50, regExp: REGULAR_EXPRESSION.FULLNAME } },
      { type: 'string', data: { field: 'Email Address', value: email, min: 5, max: 60, regExp: REGULAR_EXPRESSION.EMAIL } },
      { type: 'string', data: { field: 'Password', value: password, min: 6, max: 25, regExp: REGULAR_EXPRESSION.PASSWORD, isRequired: false } },
      { type: 'number', data: { field: 'Years of Experience', value: yearsOfExperience, min: 0, max: Infinity } },
      { type: 'string', data: { field: 'Specialization', value: specialization, min: 3, max: 50, isRequired: false } },
      { type: 'string', data: { field: 'Primary Phone', value: primaryPhone, min: 11, max: 11, regExp: REGULAR_EXPRESSION.PHONE } },
      { type: 'string', data: { field: 'Secondary Phone', value: secondaryPhone, min: 11, max: 11, regExp: REGULAR_EXPRESSION.PHONE, isRequired: false } },
    ]

    for (let i = 0; i < validation.length; i++) {
      const { type, data } = validation[i]

      if (type === 'string') {
        let validation = InputStringValidation(data)
        if (validation != null) {
          setAlert({ message: validation, positiveCallback: () => setAlert(null) })
          return
        }
      } else if (type === 'number') {
        let validation = InputNumberValidation(data)
        if (validation != null) {
          setAlert({ message: validation, positiveCallback: () => setAlert(null) })
          return
        }
      }
    }

    if (gender === '') {
      setAlert({ message: 'Gender is required!', positiveCallback: () => setAlert(null) })
      return
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

    setAlert({
      message: 'Are you sure you want to save your changes?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setAlert(null)
        UpdateUserInformation()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Edit Account Info' onGoBack={() => navigation.goBack()} />
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

      {
        pickImage &&
        <CustomImagePicker setImage={setImage} setPickImage={setPickImage} />
      }

      <CustomAppBar title='Edit Account Info' onGoBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ overflow: 'hidden', alignSelf: 'center', borderRadius: 100 }}>
              <Pressable android_ripple={{ color: COLORS.COLOR_01 }} onPress={HandleUploadImage}>
                <Image source={image ? { uri: image } : IMAGE_PLACEHOLDER_SQUARE}
                  style={{
                    ...styles.profileImage,
                    ...(!image && { tintColor: COLORS.COLOR_01 }),
                  }} />
              </Pressable>
            </View>

            <View style={{ alignSelf: 'flex-start', position: 'absolute', top: 0, right: 0, gap: 16 }}>
              {
                image &&
                <CustomIconButton
                  icon={<MaterialIcons name='delete' size={24} color={COLORS.COLOR_06} />}
                  containerStyle={{ backgroundColor: COLORS.COLOR_04, padding: 8 }}
                  onPress={() => {
                    setAlert({
                      message: 'Are you sure you want to delete your profile photo?',
                      positiveLabel: 'Yes',
                      positiveCallback: () => {
                        setAlert(null)
                        setImage('')
                      },
                      negativeLabel: 'No',
                      negativeCallback: () => setAlert(null)
                    })
                  }}
                />
              }

              <CustomIconButton
                icon={<MaterialIcons name='file-upload' size={24} color={COLORS.COLOR_06} />}
                containerStyle={{ backgroundColor: COLORS.COLOR_01, padding: 8 }}
                onPress={HandleUploadImage}
              />
            </View>
          </View>

          <CustomTextInput
            label='Fullname'
            placeholder='Enter Your Fullname'
            value={fullname}
            onChangeText={(text) => { setFullname(text) }}
          />

          <CustomTextInput
            label='Email'
            placeholder='Enter Your Email Address'
            value={email}
            onChangeText={(text) => { setEmail(text) }}
            keyboardType='email-address'
          />

          <CustomTextInput
            label='Password'
            placeholder='Enter Your Password'
            value={password}
            onChangeText={(text) => { setPassword(text) }}
            secureTextEntry={!isPasswordVisible}
            rightIcon={<Ionicons name={isPasswordVisible ? 'eye' : 'eye-off'} size={24} color={'#7e7e7e'} />}
            onRightIconPress={() => { setIsPasswordVisible(!isPasswordVisible) }}
          />

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

          <CustomTextInput
            label='Specialization'
            placeholder='Enter Your Specialization'
            value={specialization}
            onChangeText={(text) => setSpecialization(text)}
            maxLength={50}
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
            placeholder='03xxxxxxxxx'
            // placeholder='Enter Secondary Phone Number'
            value={secondaryPhone}
            onChangeText={(text) => {
              if (/^(0|03\d{0,9})$/.test(text)) {
                setSecondaryPhone(text)
              }
            }}
            keyboardType='numeric'
            maxLength={11}
          />

          <View>
            <Text style={{
              fontSize: 16,
              fontFamily: 'NunitoSans-Bold',
              color: COLORS.COLOR_01,
              marginBottom: 4,
              letterSpacing: 0.75,
            }}>Gender</Text>
            <View style={{ borderColor: COLORS.COLOR_01, borderWidth: 2, borderRadius: 6, padding: 8 }}>
              <CustomRadioButton
                label='Female'
                status={gender === 'female' ? 'checked' : 'unchecked'}
                onPress={() => setGender('female')}
              />

              <CustomRadioButton
                label='Male'
                status={gender === 'male' ? 'checked' : 'unchecked'}
                onPress={() => setGender('male')}
              />

              <CustomRadioButton
                label='Other'
                status={gender === 'other' ? 'checked' : 'unchecked'}
                onPress={() => setGender('other')}
              />
            </View>
          </View>

          <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
            <CustomButton
              title='Reset'
              leftIcon={<MaterialIcons name='restore' color={COLORS.COLOR_06} size={24} />}
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              onPress={HandleReset}
            />

            <CustomButton
              title='Save'
              containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
              leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
              onPress={() => {
                if (
                  `${fullname}`.trim() === initialData.fullname &&
                  `${email}`.trim() === initialData.email &&
                  `${gender}`.trim() === initialData.gender &&
                  `${yearsOfExperience}`.trim() === initialData.yearsOfExperience &&
                  `${specialization}`.trim() === initialData.specialization &&
                  `${primaryPhone}`.trim() === initialData.primaryPhone &&
                  `${secondaryPhone}`.trim() === initialData.secondaryPhone &&
                  `${image}`.trim() === initialData.image
                ) {
                  navigation.goBack()
                  return
                }

                HandleSave()
              }}
            />
          </View>

          <View style={{ height: 200 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default EditAccountInfoScreen

const styles = StyleSheet.create({
  profileImage: {
    resizeMode: 'center',
    width: 175,
    height: 175,
    borderRadius: 175,
    borderWidth: 4,
    borderColor: COLORS.COLOR_01,
    overflow: 'hidden',
  },
})