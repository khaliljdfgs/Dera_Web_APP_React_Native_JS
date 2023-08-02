import React, { useState } from 'react'
import { StyleSheet, View, Image, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Timestamp } from 'firebase/firestore'
import moment from 'moment'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomLoading from '../../components/CustomLoading'
import CustomAppBar from '../../components/CustomAppBar'
import CustomTable from '../../components/CustomTable'
import CustomButton from '../../components/CustomButton'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'

const NotificationDetailsScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)

  const { data } = route.params

  // If loading state has a value, return our loading component
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Details' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
      <CustomAppBar title='Details' onGoBack={() => navigation.goBack()} />

      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <Image
          source={{ uri: data.product.productImage }}
          style={{ width: '100%', aspectRatio: 1 }}
        />

        <View style={{ backgroundColor: COLORS.COLOR_01, padding: 8 }}>
          <Text style={{
            fontFamily: 'NunitoSans-SemiBold',
            color: COLORS.COLOR_06,
            fontSize: 20,
            textAlign: 'center',
          }} numberOfLines={1} ellipsizeMode='tail'>{data.product.productName}</Text>
        </View>

        <View style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 24, gap: 24, marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_08 }}>
            <Text style={{ fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}>Description: </Text>
            {data.product.productDescription}
          </Text>

          <CustomTable
            heading={
              data.isSubscription ? 'Subscription Details' : 'Order Details'
            }
            data={(() => {
              const _data = []

              const prepareDate = (obj) => moment(
                new Timestamp(obj?.seconds, obj?.nanoseconds).toDate()
              ).format('DD MMM YYYY, hh:mm A')

              _data.push({
                left: 'Quantity',
                right: `${data.quantity} ${data.product.priceUnit}`,
              })

              _data.push({
                left: 'Price',
                right: `Rs. ${data.product.productPrice} / ${data.product.priceUnit}`,
              })

              _data.push({
                left: 'Type',
                right: data.isSubscription ? 'Subscription' : 'Single Order',
              })

              _data.push({
                left: 'Time',
                right: data.deliveryTime,
              })

              _data.push({
                left: 'Status',
                right: data.statusChip
              })

              _data.push({
                left: 'Category',
                right: data.product.productCategory,
              })

              _data.push({
                left: data.isSubscription ? 'Subscribed On' : 'Ordered On',
                right: prepareDate(data.placedOn),
              })

              return _data
            })()}
            leftCellStyle={{ flex: 1.25 }}
          />

          <CustomTable
            heading='Customer Details'
            data={(() => {
              const _data = []

              _data.push({
                left: 'Ordered By',
                right: data.placedBy.fullname,
              })

              _data.push({
                left: 'Phone',
                right: (data.placedBy.phone && `${data.placedBy.phone?.primary}${data.placedBy.phone?.secondary ? `\n${data.placedBy.phone?.secondary}` : ''}`) || 'N/A'
              })

              _data.push({
                left: 'Address',
                right: data.placedBy.address,
              })

              _data.push({
                left: 'Distance',
                right: `${data.placedBy.distanceString}`,
              })

              return _data
            })()}
            leftCellStyle={{ flex: 1.25 }}
          />

          <CustomButton
            title="Chat with Customer"
            leftIcon={<MaterialIcons name='chat' size={24} color={COLORS.COLOR_06} />}
            onPress={async () => {
              const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
              const payload = { user: data.placedBy, currentUser: currentUser, fromProfile: true }
              navigation.navigate(ROUTES.COMMON.CHAT_SCREEN, payload)
            }}
          />

          <View style={{ height: 100 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default NotificationDetailsScreen

const styles = StyleSheet.create({}) 