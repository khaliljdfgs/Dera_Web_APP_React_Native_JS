import React, { useState } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'

import CustomLoading from '../../components/CustomLoading'
import CustomTextInput from '../../components/CustomTextInput'
import CustomButton from '../../components/CustomButton'
import CustomRadioButton from '../../components/CustomRadioButton'
import CustomAlertDialog from '../../components/CustomAlertDialog'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'
import { ACCOUNT_STATUS, ROLES } from '../../config/values'
import { Authentication, Firestore } from '../../config/firebase'
import { InputStringValidation, REGULAR_EXPRESSION } from '../../utils/Validation'
import FirebaseErrors from '../../utils/FirebaseErrors'

import MILK_BOTTLE from '../../../assets/images/milk_bottle.png'

const RegisterScreen = ({ navigation }) => {
  // To Show The Loading State
  const [isLoading, setIsLoading] = useState(null)

  // To Show The Alert Dialog
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [gender, setGender] = useState('')
  const [accountType, setAccountType] = useState('')

  // To Handle Password Visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // To Handle Login
  const HandleLogin = () => {
    navigation.navigate(ROUTES.COMMON.LOGIN)
  }

  // To Handle Registration
  const HandleRegistration = async () => {
    const validation = [
      { field: 'Fullname', value: fullname, min: 3, max: 50, regExp: REGULAR_EXPRESSION.FULLNAME },
      { field: 'Email Address', value: email, min: 5, max: 60, regExp: REGULAR_EXPRESSION.EMAIL },
      { field: 'Password', value: password, min: 6, max: 25, regExp: REGULAR_EXPRESSION.PASSWORD },
    ]

    for (let i = 0; i < validation.length; i++) {
      let response = InputStringValidation(validation[i])
      if (response != null) {
        setAlert({
          title: 'Info',
          message: response,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null)
        })
        return
      }
    }

    if (gender === '') {
      setAlert({
        title: 'Info',
        message: 'Gender is required!',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return
    }

    if (accountType === '') {
      setAlert({
        title: 'Info',
        message: 'Account type is required!',
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return
    }

    try {
      setIsLoading('Creating Account...')
      const userCredential = await createUserWithEmailAndPassword(Authentication, email, password)
      const uid = userCredential.user.uid

      const user = {
        uid: uid,
        email: email.trim(),
        fullname: fullname.trim(),
        gender: gender.trim(),
        accountType: accountType.trim(),
        status: ACCOUNT_STATUS.ACTIVE,
        profilePhoto: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      if (accountType === ROLES.DERA) {
        user.bannerPhotos = []
        user.status = ACCOUNT_STATUS.PENDING
      }

      if (accountType === ROLES.DVM) {
        user.status = ACCOUNT_STATUS.PENDING
      }

      if (accountType === ROLES.DERA || accountType === ROLES.DVM) {
        user.socialMediaHandles = {
          facebook: '',
          instagram: '',
          twitter: '',
          youtube: '',
          tiktok: '',
        }

        user.paymentWallets = {
          easyPaisa: { title: '', number: '' },
          jazzCash: { title: '', number: '' },
          uPaisa: { title: '', number: '' },
        }
      }

      const userCollectionRef = collection(Firestore, 'users')
      const userDocRef = doc(userCollectionRef, uid)
      await setDoc(userDocRef, user)

      setAlert({
        title: 'Success',
        message: 'Account Created Successfully! Click OK to Login.',
        positiveLabel: 'OK',
        positiveCallback: () => navigation.navigate(ROUTES.COMMON.LOGIN)
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
    return <CustomLoading message={isLoading} />
  }

  // If fonts are loaded, return our UI
  return (
    <SafeAreaView style={styles.container}>
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

      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        contentContainerStyle={{ backgroundColor: COLORS.COLOR_01 }}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerContainer}>
            <Animatable.View animation='pulse' easing='ease-out' iterationCount='infinite' duration={3250}>
              <Image source={MILK_BOTTLE} style={styles.image} />
            </Animatable.View>
            <Animatable.View animation='fadeInUp' duration={2250}>
              <Text style={styles.headerText}>Dera</Text>
            </Animatable.View>
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Register Now!</Text>

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

            <View>
              <Text style={{
                fontSize: 16,
                fontFamily: 'NunitoSans-Bold',
                color: COLORS.COLOR_01,
                marginBottom: 4,
                letterSpacing: 0.75,
              }}>Account Type</Text>
              <View style={{ borderColor: COLORS.COLOR_01, borderWidth: 2, borderRadius: 6, padding: 8 }}>
                <CustomRadioButton
                  label='Consumer'
                  status={accountType === ROLES.CONSUMER ? 'checked' : 'unchecked'}
                  onPress={() => setAccountType(ROLES.CONSUMER)}
                />

                <CustomRadioButton
                  label='Dera'
                  status={accountType === ROLES.DERA ? 'checked' : 'unchecked'}
                  onPress={() => setAccountType(ROLES.DERA)}
                />

                <CustomRadioButton
                  label='DVM'
                  status={accountType === ROLES.DVM ? 'checked' : 'unchecked'}
                  onPress={() => setAccountType(ROLES.DVM)}
                />
              </View>
            </View>

            <CustomButton
              title='Proceed To Register'
              onPress={HandleRegistration}
              rightIcon={<MaterialIcons name='arrow-forward' size={20} color={COLORS.COLOR_06} />}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.line} />
              <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 18, textAlign: 'center' }}>
                Already have an account?
              </Text>
              <View style={styles.line} />
            </View>

            <CustomButton
              title='Click Here To Login'
              isOutlined={true}
              onPress={HandleLogin}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default RegisterScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.COLOR_06
  },
  headerContainer: {
    backgroundColor: COLORS.COLOR_01,
    flexDirection: 'row',
    paddingHorizontal: 36,
    paddingVertical: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 40,
    fontFamily: 'Ubuntu-Bold',
    color: COLORS.COLOR_06,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'right',
    borderTopWidth: 2,
    borderTopColor: COLORS.COLOR_06,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.COLOR_06,
    paddingVertical: 4,
    paddingHorizontal: 12,
    lineHeight: 50,
  },
  image: {
    height: 175,
    width: 175,
    resizeMode: 'contain',
  },
  formContainer: {
    elevation: 20,
    paddingHorizontal: 40,
    paddingVertical: 34,
    gap: 20,
    backgroundColor: COLORS.COLOR_06,
    borderTopLeftRadius: 44,
    width: '100%',
  },
  title: {
    textAlign: 'center',
    fontSize: 36,
    textTransform: 'uppercase',
    color: COLORS.COLOR_01,
    fontFamily: 'NunitoSans-Black',
    letterSpacing: 0.75,
  },
  line: {
    height: 1,
    backgroundColor: '#000',
    flex: 1,
    opacity: 0.25
  }
})