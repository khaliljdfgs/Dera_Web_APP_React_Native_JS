import React, { useState } from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { addDoc, and, collection, getDocs, or, query, serverTimestamp, where } from 'firebase/firestore'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomIconButton from '../../../components/CustomIconButton'
import CustomButton from '../../../components/CustomButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTable from '../../../components/CustomTable'

import COLORS from '../../../config/colors'
import { Firestore } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'
import ROUTES from '../../../config/routes'
import { NOTIFICATION_TYPES, SERVICE_STATUS } from '../../../config/values'

const ViewDVMServiceScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const { service, isFromNotifications } = route.params

  const HandleChat = async () => {
    const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
    const payload = {
      user: service.owner,
      currentUser: currentUser,
      message: `I would like to avail your service titled as "${service.serviceTitle}". Please let me know if you are available.`,
    }
    navigation.navigate(ROUTES.COMMON.CHAT_SCREEN, payload)
  }

  const AvailItNow = async () => {
    setIsLoading('Availing Service...')
    try {
      const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

      const collectionRef = collection(Firestore, 'services', service.id, 'serviceAvailments')

      const docQuery = query(
        collectionRef,
        and(
          where('serviceAvailedBy', '==', currentUser.uid),
          or(
            where('serviceStatus', '==', SERVICE_STATUS.PENDING),
            where('serviceStatus', '==', SERVICE_STATUS.BOOKED),
          )
        )
      )

      const docSnapshots = await getDocs(docQuery)

      if (docSnapshots.size > 0) {
        setAlert({
          title: 'Info',
          message: 'Already, you have availied this service. Please wait for the response from the DVM.',
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null),
        })
      } else {
        const payload = {
          serviceId: service.id,
          serviceStatus: SERVICE_STATUS.PENDING,
          serviceOfferedBy: service.owner.id,
          serviceAvailedBy: currentUser.uid,
          serviceAvailedAt: serverTimestamp(),
        }

        await addDoc(collectionRef, payload)

        const notificationPayload = {
          type: NOTIFICATION_TYPES.SERVICE_AVAILMENT,
          serviceId: service.id,
          receiver: service.owner.id,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setAlert({
          title: 'Success',
          message: 'Your request has been sent to the DVM. Please wait for the response from the DVM.',
          positiveLabel: 'OK',
          positiveCallback: () => {
            setAlert(null)
            navigation.goBack()
          }
        })
      }
    } catch (error) {
      setIsLoading(null)
      setAlert({
        title: 'Error',
        message: FirebaseErrors[error.code] || error.message,
        positiveLabel: 'OK',
        positiveCallback: () => setAlert(null),
      })
    }

    setIsLoading(null)
  }

  const HandleAvailItNow = () => {
    setAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to avail this service?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setAlert(null)
        AvailItNow()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null),
    })
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='View Service' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

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

      <CustomAppBar title='View Service' onGoBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <Image
          source={{ uri: service.serviceImage }}
          style={{ width: '100%', aspectRatio: 1 }}
        />

        <View style={{ backgroundColor: COLORS.COLOR_01, padding: 8 }}>
          <Text style={{
            fontFamily: 'NunitoSans-SemiBold',
            color: COLORS.COLOR_06,
            fontSize: 20,
            textAlign: 'center',
          }} numberOfLines={1} ellipsizeMode='tail'>{service.serviceTitle}</Text>
        </View>

        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 24, gap: 24, marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_08 }}>
            <Text style={{ fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}>Description: </Text>
            {service.serviceDescription}
          </Text>

          <CustomTable
            heading='Service Details'
            data={[
              { left: 'Charges', right: `Rs. ${service.serviceCharges}` },
              { left: 'Charges Per', right: service.serviceChargesPer },
              { left: 'Service Type', right: service.serviceTypeString },
              {
                left: 'Offered By',
                right: service.owner.fullname,
                onPress: () => {
                  const payload = { user: service.owner, distanceString: service.distanceString }
                  navigation.navigate(ROUTES.DERA.VIEW_DVM_PROFILE, payload)
                }
              },
              { left: 'Distance', right: service.distanceString },
            ]}
            leftCellStyle={{ flex: 1.25 }}
          />

          {
            !isFromNotifications &&
            <View style={{ flexDirection: 'row', columnGap: 8 }}>
              <CustomIconButton
                onPress={HandleChat}
                containerStyle={{ flex: 1 }}
                icon={<MaterialIcons name='message' size={24} color={COLORS.COLOR_06} />}
              />
              <CustomButton
                onPress={HandleAvailItNow}
                title='Avail It Now!'
                containerStyle={{ flex: 8 }}
                leftIcon={<MaterialIcons name='event-available' size={24} color={COLORS.COLOR_06} />}
              />
            </View>
          }

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default ViewDVMServiceScreen

const styles = StyleSheet.create({}) 