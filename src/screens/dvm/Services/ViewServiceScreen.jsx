import React, { useCallback, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, View, Image, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { MaterialIcons } from '@expo/vector-icons'
import { deleteDoc, doc } from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'
import CustomButton from '../../../components/CustomButton'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTable from '../../../components/CustomTable'

import COLORS from '../../../config/colors'
import ROUTES from '../../../config/routes'
import { SERVER_URL } from '../../../config/values'
import { Firestore, Storage } from '../../../config/firebase'
import FirebaseErrors from '../../../utils/FirebaseErrors'

const ViewServiceScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const { service, isFromHomeScreen } = route.params

  const Refresh = async () => {
    if (isFromHomeScreen) {
      const goToHomeScreen = await AsyncStorage.getItem('EditServiceGoToHomeScreen')

      if (goToHomeScreen === 'true') {
        await AsyncStorage.removeItem('EditServiceGoToHomeScreen')
        navigation.goBack()
      }

      return
    }

    const result = await AsyncStorage.getItem('EditServiceDataChanged')
    if (result === 'true') {
      navigation.goBack()
      return
    }
  }

  useFocusEffect(useCallback(() => { Refresh() }, []))

  const HandleDelete = () => {
    setAlert({
      message: 'Are you sure you want to delete this service?',
      positiveLabel: 'Yes',
      positiveCallback: async () => {
        setIsLoading('Deleting Service...')
        setAlert(null)

        try {
          // const imageRef = ref(Storage, service.serviceImage.split('.com/o/')[1].split('?')[0])
          // await deleteObject(imageRef)
          // await deleteDoc(doc(Firestore, 'services', service.id))
          // await AsyncStorage.setItem('EditServiceDataChanged', 'true')
          // navigation.goBack()

          const response = await axios.delete(`${SERVER_URL}/services/${service.id}`)
          if (response.status === 200) {
            await AsyncStorage.setItem('EditServiceDataChanged', 'true')
            navigation.goBack()
          } else {
            setAlert({
              title: 'Error',
              message: 'Something went wrong. Please try again later.',
              positiveLabel: 'OK',
              positiveCallback: () => setAlert(null),
            })
          }

          setIsLoading(null)
        } catch (error) {
          setAlert({
            title: 'Error',
            message: FirebaseErrors[error.code] || error.message,
            positiveLabel: 'OK',
            positiveCallback: () => setAlert(null),
          })
        }

        setIsLoading(null)
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleEdit = () => {
    const payload = { service, isFromHomeScreen }
    navigation.navigate(ROUTES.DVM.EDIT_SERVICE, payload)
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
            ]}
            leftCellStyle={{ flex: 1.25 }}
          />

          <View style={{ flexDirection: 'row', columnGap: 16 }}>
            <CustomButton
              onPress={HandleDelete}
              title='Delete'
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              leftIcon={<MaterialIcons name='delete-outline' size={24} color={COLORS.COLOR_06} />}
            />
            <CustomButton
              onPress={HandleEdit}
              title='Edit'
              containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
              leftIcon={<MaterialIcons name='edit' size={24} color={COLORS.COLOR_06} />}
            />
          </View>

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default ViewServiceScreen

const styles = StyleSheet.create({}) 