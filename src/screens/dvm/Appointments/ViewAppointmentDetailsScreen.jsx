import React, { useState } from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons } from '@expo/vector-icons'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomButton from '../../../components/CustomButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTable from '../../../components/CustomTable'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { Firestore } from '../../../config/firebase'
import { NOTIFICATION_TYPES, SERVER_URL, SERVICE_STATUS } from '../../../config/values'
import FirebaseErrors from '../../../utils/FirebaseErrors'

const ViewAppointmentDetailsScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const { appointment, isFromHistroyScreen } = route.params

  const HandleCancel = () => {
    if (appointment.serviceStatus === SERVICE_STATUS.CANCELLED) {
      setAlert({
        title: 'Info',
        message: 'This appointment is already cancelled.',
        positiveLabel: 'Ok',
        positiveCallback: () => setAlert(null)
      })
      return
    }

    const Cancel = async () => {
      try {
        setAlert(null)
        setIsLoading('Cancelling Appointment...')

        const serviceAvailmentDoc = doc(Firestore, 'services', appointment.service.id, 'serviceAvailments', appointment.id)
        await setDoc(serviceAvailmentDoc, { serviceStatus: SERVICE_STATUS.CANCELLED }, { merge: true })

        const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

        const notificationPayload = {
          type: NOTIFICATION_TYPES.SERVICE_CANCELLED,
          serviceId: appointment.service.id,
          receiver: appointment.dera.id,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
          serviceCancelledOn: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: 'Appointment Cancelled Successfully.',
          positiveLabel: 'OK',
          positiveCallback: () => {
            setAlert(null)
            navigation.goBack()
          }
        })
      } catch (error) {
        setIsLoading(null)
        setAlert({
          title: 'Error',
          message: FirebaseErrors[error.code] || error.message,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null),
        })
      }
    }

    setAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to cancel this appointment?',
      positiveLabel: 'Yes',
      positiveCallback: Cancel,
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleAccept = () => {
    if (appointment.serviceStatus === SERVICE_STATUS.BOOKED) {
      setAlert({
        title: 'Info',
        message: 'This appointment is already accepted.',
        positiveLabel: 'Ok',
        positiveCallback: () => setAlert(null)
      })
      return
    }

    const Accept = async () => {
      try {
        setAlert(null)
        setIsLoading('Accepting Appointment...')

        const serviceAvailmentDoc = doc(Firestore, 'services', appointment.service.id, 'serviceAvailments', appointment.id)
        await setDoc(serviceAvailmentDoc, { serviceStatus: SERVICE_STATUS.BOOKED }, { merge: true })

        const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

        const notificationPayload = {
          type: NOTIFICATION_TYPES.SERVICE_ACCEPTED,
          serviceId: appointment.service.id,
          receiver: appointment.dera.id,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
          serviceAcceptedOn: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: 'Appointment Accepted Successfully.',
          positiveLabel: 'OK',
          positiveCallback: () => {
            setAlert(null)
            navigation.goBack()
          }
        })
      } catch (error) {
        setIsLoading(null)
        setAlert({
          title: 'Error',
          message: FirebaseErrors[error.code] || error.message,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null),
        })
      }
    }

    setAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to accept this appointment?',
      positiveLabel: 'Yes',
      positiveCallback: Accept,
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleDelete = () => {
    const Delete = async () => {
      try {
        setAlert(null)
        setIsLoading('Deleting Appointment...')

        // const serviceAvailmentDoc = doc(Firestore, 'services', appointment.service.id, 'serviceAvailments', appointment.id)
        // await deleteDoc(serviceAvailmentDoc)

        // setIsLoading(null)
        // setAlert({
        //   title: 'Success',
        //   message: 'Appointment Deleted Successfully.',
        //   positiveLabel: 'OK',
        //   positiveCallback: () => {
        //     setAlert(null)
        //     navigation.goBack()
        //   }
        // })

        const response = await axios.delete(`${SERVER_URL}/dvmServiceEnrollments/${appointment.id}`)
        if (response.status === 200) {
          setIsLoading(null)
          setAlert({
            title: 'Success',
            message: 'Appointment Deleted Successfully.',
            positiveLabel: 'OK',
            positiveCallback: () => {
              setAlert(null)
              navigation.goBack()
            }
          })
        } else {
          setIsLoading(null)
          setAlert({
            title: 'Error',
            message: 'Something went wrong. Please try again later.',
            positiveLabel: 'OK',
            positiveCallback: () => setAlert(null),
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
    }

    setAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to delete this appointment record?',
      positiveLabel: 'Yes',
      positiveCallback: Delete,
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleComplete = () => {
    if (appointment.serviceStatus === SERVICE_STATUS.COMPLETED) {
      setAlert({
        title: 'Info',
        message: 'This appointment is already marked as completed.',
        positiveLabel: 'Ok',
        positiveCallback: () => setAlert(null)
      })
      return
    }

    const Completed = async () => {
      try {
        setAlert(null)
        setIsLoading('Marking Appointment as Completed...')

        const serviceAvailmentDoc = doc(Firestore, 'services', appointment.service.id, 'serviceAvailments', appointment.id)
        await setDoc(serviceAvailmentDoc, { serviceStatus: SERVICE_STATUS.COMPLETED }, { merge: true })

        const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))

        const notificationPayload = {
          type: NOTIFICATION_TYPES.SERVICE_COMPLETED,
          serviceId: appointment.service.id,
          receiver: appointment.dera.id,
          sender: currentUser.uid,
          timestamp: serverTimestamp(),
          serviceCompletedOn: serverTimestamp(),
        }

        const notificationsCollectionRef = collection(Firestore, 'notifications')
        await addDoc(notificationsCollectionRef, notificationPayload)

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: 'Appointment Marked as Completed Successfully.',
          positiveLabel: 'OK',
          positiveCallback: () => {
            setAlert(null)
            navigation.goBack()
          }
        })
      } catch (error) {
        setIsLoading(null)
        setAlert({
          title: 'Error',
          message: FirebaseErrors[error.code] || error.message,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null),
        })
      }
    }

    setAlert({
      title: 'Confirmation',
      message: 'Are you sure you want to mark this appointment as completed?',
      positiveLabel: 'Yes',
      positiveCallback: Completed,
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Appointment Details' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='Appointment Details' onGoBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <Image
          source={{ uri: appointment.service.serviceImage }}
          style={{ width: '100%', aspectRatio: 1 }}
        />

        <View style={{ backgroundColor: COLORS.COLOR_01, padding: 8 }}>
          <Text style={{
            fontFamily: 'NunitoSans-SemiBold',
            color: COLORS.COLOR_06,
            fontSize: 20,
            textAlign: 'center',
          }} numberOfLines={1} ellipsizeMode='tail'>{appointment.service.serviceTitle}</Text>
        </View>

        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 24, gap: 24, marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_08 }}>
            <Text style={{ fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}>Description: </Text>
            {appointment.service.serviceDescription}
          </Text>

          <CustomTable
            heading='Service Details'
            data={[
              { left: 'Status', right: `${appointment.serviceStatus}`.toUpperCase() },
              {
                left: 'Availed By',
                right: appointment.dera.businessName,
                onPress: () => {
                  const payload = { user: appointment.dera, distanceString: appointment.deraDistanceString.trim() }
                  navigation.navigate(ROUTES.DVM.VIEW_DERA_PROFILE, payload)
                }
              },
              { left: 'Timestamp', right: appointment.serviceAvailedAtString.trim() },
              { left: 'Distance', right: appointment.deraDistanceString.trim() },
              { left: 'Charges', right: `Rs. ${appointment.service.serviceCharges}` },
              { left: 'Charges Per', right: appointment.service.serviceChargesPer },
              { left: 'Service Type', right: appointment.service.serviceTypeString.trim() },
            ]}
            leftCellStyle={{ flex: 1.25 }}
          />

          {
            isFromHistroyScreen
              ?
              <View style={{ flexDirection: 'row', columnGap: 16 }}>
                <CustomButton
                  onPress={HandleDelete}
                  title='Delete Record'
                  containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
                  leftIcon={<MaterialIcons name='delete-outline' size={24} color={COLORS.COLOR_06} />}
                />
              </View>
              :
              <View style={{ flexDirection: 'row', columnGap: 16 }}>
                {
                  appointment.serviceStatus === SERVICE_STATUS.BOOKED &&
                  <CustomButton
                    onPress={HandleCancel}
                    title='Cancel'
                    containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
                    leftIcon={<MaterialIcons name='close' size={24} color={COLORS.COLOR_06} />}
                  />
                }
                {
                  appointment.serviceStatus === SERVICE_STATUS.PENDING &&
                  <>
                    <CustomButton
                      onPress={HandleCancel}
                      title='Cancel'
                      containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
                      leftIcon={<MaterialIcons name='close' size={24} color={COLORS.COLOR_06} />}
                    />
                    <CustomButton
                      onPress={HandleAccept}
                      title='Accept'
                      containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
                      leftIcon={<MaterialIcons name='check' size={24} color={COLORS.COLOR_06} />}
                    />
                  </>
                }
                {
                  appointment.serviceStatus === SERVICE_STATUS.BOOKED &&
                  <CustomButton
                    onPress={HandleComplete}
                    title='Completed'
                    containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
                    leftIcon={<MaterialIcons name='check' size={24} color={COLORS.COLOR_06} />}
                  />
                }
              </View>
          }

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default ViewAppointmentDetailsScreen

const styles = StyleSheet.create({}) 