import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { MaterialIcons, Feather, AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomAlertDialog from '../../../components/CustomAlertDialog'

import ROUTES from '../../../config/routes'
import COLORS from '../../../config/colors'

const SettingsScreen = ({ navigation }) => {
  const [alert, setAlert] = useState(null)

  const HandleEditAccountInfo = () => navigation.navigate(ROUTES.DVM.EDIT_ACCOUNT_INFO)
  const HandleLocationAndAddress = () => navigation.navigate(ROUTES.DVM.LOCATION_AND_ADDRESS)
  const HandlePaymentWallets = () => navigation.navigate(ROUTES.DVM.PAYMENT_WALLETS)
  const HandleSocialMediaHandles = () => navigation.navigate(ROUTES.DVM.SOCIAL_MEDIA_HANDLES)
  const HandleAppointmentsHistory = () => navigation.navigate(ROUTES.DVM.APPOINTMENTS_HISTORY)
  const HandleSubmitQuery = () => navigation.navigate(ROUTES.COMMON.SUBMIT_QUERY)

  const HandleLogOut = async () => {
    setAlert({
      title: 'Logout',
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
      negativeCallback: () => { setAlert(null) }
    })
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
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

      <ScrollView contentContainerStyle={{ padding: 24, backgroundColor: COLORS.COLOR_06 }}>
        <Text style={{ fontSize: 30, fontFamily: 'NunitoSans-Regular', letterSpacing: 1, marginBottom: 12 }}>
          Settings
        </Text>

        <View style={{ borderRadius: 8, elevation: 4, backgroundColor: COLORS.COLOR_06 }}>
          <Text style={styles.sectionHeading}>Account</Text>
          {
            [
              {
                icon: <Feather name='user' size={22} color={COLORS.COLOR_01} />,
                title: 'Edit Account Info',
                onPress: HandleEditAccountInfo
              },
              {
                icon: <MaterialIcons name='my-location' size={22} color={COLORS.COLOR_01} />,
                title: 'Location & Address',
                onPress: HandleLocationAndAddress
              },
              {
                icon: <AntDesign name='wallet' size={22} color={COLORS.COLOR_01} />,
                title: 'Payment Wallets',
                onPress: HandlePaymentWallets
              },
              {
                icon: <Ionicons name='share-social-outline' size={22} color={COLORS.COLOR_01} />,
                title: 'Social Media Handles',
                onPress: HandleSocialMediaHandles
              },
            ].map((item, index, data) => (
              <View style={index > data.length - 2 ? styles.patch : {}} key={index}>
                <Pressable onPress={item.onPress}
                  style={{ paddingHorizontal: 10 }}
                  android_ripple={{ color: COLORS.COLOR_01 }}>
                  <View style={{ borderBottomWidth: index < data.length - 1 ? 1 : 0, ...styles.sectionItem }}>
                    {item.icon}
                    <Text style={styles.sectionItemTitle}>{item.title}</Text>
                    <MaterialIcons name='arrow-forward-ios' size={16} color={COLORS.COLOR_01} />
                  </View>
                </Pressable>
              </View>
            ))
          }
        </View>

        <View style={{ marginVertical: 12 }} />

        <View style={{ borderRadius: 8, elevation: 4, backgroundColor: COLORS.COLOR_06 }}>
          <Text style={styles.sectionHeading}>Others</Text>

          {
            [
              {
                icon: <Feather name='box' size={22} color={COLORS.COLOR_01} />,
                title: 'Appointments History',
                onPress: HandleAppointmentsHistory
              },
              {
                icon: <MaterialCommunityIcons name='note-outline' size={22} color={COLORS.COLOR_01} />,
                title: 'Submit Query',
                onPress: HandleSubmitQuery
              },
              {
                icon: <Feather name='log-out' size={22} color={COLORS.COLOR_01} />,
                title: 'Logout',
                onPress: HandleLogOut
              },
            ].map((item, index, data) => (
              <View style={index > data.length - 2 ? styles.patch : {}} key={index}>
                <Pressable onPress={item.onPress}
                  style={{ paddingHorizontal: 10 }} android_ripple={{ color: COLORS.COLOR_01 }}>
                  <View style={{ borderBottomWidth: index < data.length - 1 ? 1 : 0, ...styles.sectionItem }}>
                    {item.icon}
                    <Text style={styles.sectionItemTitle}>{item.title}</Text>
                    <MaterialIcons name='arrow-forward-ios' size={18} color={COLORS.COLOR_01} />
                  </View>
                </Pressable>
              </View>
            ))
          }
        </View>
      </ScrollView>

    </SafeAreaView>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Regular',
    letterSpacing: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.COLOR_01,
    color: COLORS.COLOR_06,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  sectionItem: {
    borderColor: '#e6e6e6',
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  sectionItemTitle: {
    fontFamily: 'NunitoSans-Regular',
    fontSize: 18,
    flex: 1,
  },
  patch: {
    overflow: 'hidden',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8
  }
})