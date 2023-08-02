import React, { useState } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import * as Animatable from 'react-native-animatable'
import { doc, getDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomLoading from '../../components/CustomLoading'
import CustomTextInput from '../../components/CustomTextInput'
import CustomButton from '../../components/CustomButton'
import CustomAlertDialog from '../../components/CustomAlertDialog'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'
import { ACCOUNT_STATUS, ROLES } from '../../config/values'
import { Authentication, Firestore } from '../../config/firebase'
import { InputStringValidation, REGULAR_EXPRESSION } from '../../utils/Validation'
import FirebaseErrors from '../../utils/FirebaseErrors'

import MILK_BOTTLE from '../../../assets/images/milk_bottle.png'

const LoginScreen = ({ navigation }) => {
  // To Show The Loading State
  const [isLoading, setIsLoading] = useState(null)

  // To Show The Alert Dialog
  const [alert, setAlert] = useState(null)

  // To Store User Input Values
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // To Handle Password Visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  // To Handle Login
  const HandleLogin = async () => {
    const isEmailInvalid = InputStringValidation({
      field: 'Email Address',
      value: email,
      min: 5,
      max: 60,
      regExp: REGULAR_EXPRESSION.EMAIL,
    })
    if (isEmailInvalid) {
      setAlert({
        title: 'Info',
        message: isEmailInvalid,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return
    }

    const isPasswordInvalid = InputStringValidation({
      field: 'Password',
      value: password,
      min: 6,
      max: 25,
      regExp: REGULAR_EXPRESSION.PASSWORD,
    })
    if (isPasswordInvalid) {
      setAlert({
        title: 'Info',
        message: isPasswordInvalid,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null)
      })
      return
    }

    // EXPLANATION:
    // To Show The User That The App Is Currently Logging In,
    // We Will Set The Value Of The Loading State To 'Logging in...'
    setIsLoading('Logging in...')

    try {
      const { user } = await signInWithEmailAndPassword(Authentication, email, password)

      if (user) {
        const userDocRef = doc(Firestore, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const currentUser = { ...userDoc.data(), uid: user.uid }
          if (currentUser.status === ACCOUNT_STATUS.ACTIVE || currentUser.status === ACCOUNT_STATUS.PENDING) {
            await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser))
            const {
              accountType,
              geoLocation,
              address,
              businessName,
              aboutUs,
              yearsOfExperience,
              phone
            } = currentUser

            let screen = ROUTES.COMMON.LOGIN
            if (accountType === ROLES.DERA) {
              if (!geoLocation || !address || !phone || !businessName || !aboutUs) {
                screen = ROUTES.COMMON.ADDITIONAL_INFORMATION
              } else if (currentUser.status === ACCOUNT_STATUS.ACTIVE) {
                screen = ROUTES.DERA.STACK_NAVIGATOR
              } else if (currentUser.status === ACCOUNT_STATUS.PENDING) {
                setIsLoading(null)

                setAlert({
                  title: 'Error',
                  message: 'Your account is not yet active. Please wait for the admin to activate your account.',
                  positiveLabel: 'OK',
                  positiveCallback: () => setAlert(null),
                })

                return
              }
            } else if (accountType === ROLES.DVM) {
              if (!geoLocation || !address || !phone || !yearsOfExperience) {
                screen = ROUTES.COMMON.ADDITIONAL_INFORMATION
              } else if (currentUser.status === ACCOUNT_STATUS.ACTIVE) {
                screen = ROUTES.DVM.STACK_NAVIGATOR
              } else if (currentUser.status === ACCOUNT_STATUS.PENDING) {
                setIsLoading(null)

                setAlert({
                  title: 'Error',
                  message: 'Your account is not yet active. Please wait for the admin to activate your account.',
                  positiveLabel: 'OK',
                  positiveCallback: () => setAlert(null),
                })

                return
              }
            } else if (accountType === ROLES.CONSUMER) {
              if (!geoLocation || !address || !phone) {
                screen = ROUTES.COMMON.ADDITIONAL_INFORMATION
              } else if (currentUser.status === ACCOUNT_STATUS.ACTIVE) {
                screen = ROUTES.CONSUMER.STACK_NAVIGATOR
              } else if (currentUser.status === ACCOUNT_STATUS.PENDING) {
                setIsLoading(null)

                setAlert({
                  title: 'Error',
                  message: 'Your account is not yet active. Please wait for the admin to activate your account.',
                  positiveLabel: 'OK',
                  positiveCallback: () => setAlert(null),
                })

                return
              }
            }

            navigation.reset({ index: 0, routes: [{ name: screen }] })

            // let screen = ROUTES.COMMON.LOGIN
            // if (!geoLocation || !address || !phone) {
            //   screen = ROUTES.COMMON.ADDITIONAL_INFORMATION
            // } else if (accountType === ROLES.DERA) {
            //   screen = !businessName || !aboutUs
            //     ? ROUTES.COMMON.ADDITIONAL_INFORMATION
            //     : ROUTES.DERA.STACK_NAVIGATOR
            // } else if (accountType === ROLES.DVM) {
            //   screen = !yearsOfExperience
            //     ? ROUTES.COMMON.ADDITIONAL_INFORMATION
            //     : ROUTES.DVM.STACK_NAVIGATOR
            // } else if (accountType === ROLES.CONSUMER) {
            //   screen = ROUTES.CONSUMER.STACK_NAVIGATOR
            // }

            // navigation.reset({ index: 0, routes: [{ name: screen }] })
            // } else if (currentUser.status === ACCOUNT_STATUS.PENDING) {
            // setAlert({
            //   title: 'Error',
            //   message: 'Your account is not yet active. Please wait for the admin to activate your account.',
            //   positiveLabel: 'OK',
            //   positiveCallback: () => setAlert(null),
            // })
          } else if (currentUser.status === ACCOUNT_STATUS.SUSPENDED) {
            setAlert({
              title: 'Error',
              message: 'Your account is suspended. Please contact the admin for more information.',
              positiveLabel: 'OK',
              positiveCallback: () => setAlert(null),
            })
          }
        }
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
  }

  // To Handle Registration
  const HandleRegistration = () => {
    navigation.navigate(ROUTES.COMMON.REGISTER)
  }

  const HandleResetPassword = () => {
    navigation.navigate(ROUTES.COMMON.RESET_PASSWORD)
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
          <View style={styles.imageContainer}>
            <Animatable.View animation='pulse' easing='ease-out' iterationCount='infinite' duration={3250}>
              <Image source={MILK_BOTTLE} style={styles.image} />
            </Animatable.View>
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Dera Login!</Text>

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

            <CustomButton
              title='Login'
              onPress={HandleLogin}
              rightIcon={<MaterialIcons name='login' size={20} color={COLORS.COLOR_06} />}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.line} />
              <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 18, textAlign: 'center' }}>
                Don't have an account?
              </Text>
              <View style={styles.line} />
            </View>

            <CustomButton
              title='Register Now!'
              isOutlined={true}
              onPress={HandleRegistration}
            />

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.line} />
              <Text style={{ fontFamily: 'NunitoSans-Regular', fontSize: 18, textAlign: 'center' }}>
                Lost your password?
              </Text>
              <View style={styles.line} />
            </View>

            <CustomButton
              title='Reset Password!'
              isOutlined={true}
              onPress={HandleResetPassword}
            />

            <View style={{ height: 50 }} />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default LoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.COLOR_06
  },
  imageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: COLORS.COLOR_01,
    justifyContent: 'center'
  },
  image: {
    height: 180,
    resizeMode: 'contain',
    alignSelf: 'center'
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