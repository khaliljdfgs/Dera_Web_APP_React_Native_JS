import React, { useState } from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons } from '@expo/vector-icons'
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import moment from 'moment/moment'
import axios from 'axios'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomButton from '../../../components/CustomButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTable from '../../../components/CustomTable'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { Firestore } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'
import { SERVER_URL, SERVICE_STATUS } from '../../../config/values'

const DvmAppointmentDetailsScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const { appointment } = route.params

  const HandleDelete = async () => {
    if (!(appointment.serviceStatus === SERVICE_STATUS.COMPLETED || appointment.serviceStatus === SERVICE_STATUS.CANCELLED)) {
      setAlert({
        title: 'Warning',
        message: 'You can only delete completed or cancelled appointments.',
        positiveLabel: 'Ok',
        positiveCallback: () => setAlert(null),
      })
      return
    }

    const Delete = async () => {
      try {
        setAlert(null)
        setIsLoading('Deleting Appointment...')

        // const serviceAvailmentDoc = doc(Firestore, 'services', appointment.service.id, 'serviceAvailments', appointment.id)
        // await deleteDoc(serviceAvailmentDoc)

        // setIsLoading(null)
        // setAlert({
        //   title: 'Success',
        //   message: 'Appointment Deleted Successfully!',
        //   positiveLabel: 'OK',
        //   positiveCallback: () => {
        //     navigation.goBack()
        //     setAlert(null)
        //   },
        // })

        const response = await axios.delete(`${SERVER_URL}/dvmServiceEnrollments/${appointment.id}`)
        if (response.status === 200) {
          setIsLoading(null)
          setAlert({
            title: 'Success',
            message: 'Appointment Deleted Successfully.',
            positiveLabel: 'OK',
            positiveCallback: () => {
              navigation.goBack()
              setAlert(null)
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
      title: 'Delete Appointment',
      message: 'Are you sure you want to delete this appointment?',
      positiveLabel: 'Yes',
      positiveCallback: Delete,
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleCancel = () => {
    if (!(appointment.serviceStatus === SERVICE_STATUS.PENDING || appointment.serviceStatus === SERVICE_STATUS.BOOKED)) {
      setAlert({
        title: 'Warning',
        message: 'You can only cancel pending or booked appointments.',
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
        await setDoc(serviceAvailmentDoc, { serviceStatus: SERVICE_STATUS.CANCELLED, }, { merge: true })

        setIsLoading(null)
        setAlert({
          title: 'Success',
          message: 'Appointment Cancelled Successfully!',
          positiveLabel: 'OK',
          positiveCallback: () => {
            navigation.goBack()
            setAlert(null)
          },
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
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment?',
      positiveLabel: 'Yes',
      positiveCallback: Cancel,
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
              { left: 'Booked On', right: moment(appointment.serviceAvailedOn).format('DD MMM YYYY, hh:mm A') },
              { left: 'Status', right: `${appointment.serviceStatus}`.toUpperCase() },
              {
                left: 'Offered By',
                right: appointment.service.owner.fullname,
                onPress: () => {
                  const payload = { user: appointment.service.owner, distanceString: appointment.service.distanceString }
                  navigation.navigate(ROUTES.DERA.VIEW_DVM_PROFILE, payload)
                }
              },
              { left: 'Distance', right: appointment.service.distanceString },
              { left: 'Charges', right: `Rs. ${appointment.service.serviceCharges}` },
              { left: 'Charges Per', right: appointment.service.serviceChargesPer },
              { left: 'Service Type', right: appointment.service.serviceTypeString },
            ]}
            leftCellStyle={{ flex: 1.25 }}
          />

          <View style={{ flexDirection: 'row', columnGap: 8 }}>
            <CustomButton
              onPress={HandleDelete}
              title='Delete'
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              leftIcon={<MaterialIcons name='delete-outline' size={24} color={COLORS.COLOR_06} />}
            />
            <CustomButton
              onPress={HandleCancel}
              title='Cancel'
              containerStyle={{ flex: 1, backgroundColor: COLORS.SECONDARY }}
              leftIcon={<MaterialIcons name='close' size={24} color={COLORS.COLOR_06} />}
            />
          </View>

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default DvmAppointmentDetailsScreen

const styles = StyleSheet.create({}) 