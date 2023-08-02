import React, { useState } from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import * as Linking from 'expo-linking'

import CustomAppBar from '../../components/CustomAppBar'
import CustomButton from '../../components/CustomButton'
import CustomAlertDialog from '../../components/CustomAlertDialog'

import COLORS from '../../config/colors'

const AdminNotificationScreen = ({ navigation, route }) => {
  const [alert, setAlert] = useState(null)
  const { data } = route.params

  const HandleReadMore = async () => {
    Linking.canOpenURL(data.details.readMore).then((res) => {
      if (res) {
        Linking.openURL(data.details.readMore)
      } else {
        setAlert({
          title: 'Error',
          message: 'The link is invalid.',
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null),
        })
      }
    })
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

      <CustomAppBar title='Detatils' onGoBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <Image
          source={{ uri: data.details.image }}
          style={{ width: '100%', aspectRatio: 1 }}
        />
        <View style={{ backgroundColor: COLORS.COLOR_01, padding: 8 }}>
          <Text style={{
            fontFamily: 'NunitoSans-SemiBold',
            color: COLORS.COLOR_06,
            fontSize: 20,
            textAlign: 'center',
          }} numberOfLines={1} ellipsizeMode='tail'>{data.info.title}</Text>
        </View>

        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 24, gap: 24, marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_08 }}>
            <Text style={{ fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}>Description: </Text>
            {data.info.message}
          </Text>

          {
            data.details.readMore &&
            <CustomButton
              onPress={HandleReadMore}
              title='Read More'
              leftIcon={<MaterialIcons name='read-more' size={24} color={COLORS.COLOR_06} />}
            />
          }
        </View>

        <View style={{ height: 100 }} />
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default AdminNotificationScreen

const styles = StyleSheet.create({}) 