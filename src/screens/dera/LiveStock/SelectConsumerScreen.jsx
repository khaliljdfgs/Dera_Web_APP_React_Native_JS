import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FlashList } from '@shopify/flash-list'

import CustomLoading from '../../../components/CustomLoading'
import CustomAppBar from '../../../components/CustomAppBar'

import COLORS from '../../../config/colors'

import IMAGE_PLACEHOLDER_SQUARE from '../../../../assets/images/image-placeholder-square.png'

const LiveStockFeaturesScreen = ({ navigation, route }) => {
  const { requests } = route.params

  const [isLoading, setIsLoading] = useState(null)
  const [consumersData, setConsumersData] = useState([])

  useEffect(() => {
    const Prepare = async () => {
      setIsLoading('Loading...')
      const consumerUsersData = JSON.parse(await AsyncStorage.getItem('consumerUsers'))

      const filteredData = []
      requests?.forEach(request => {
        const user = consumerUsersData?.filter(x => x.id === request)[0]
        filteredData.push(user)
      })

      setConsumersData(filteredData)
      setIsLoading(null)
    }

    Prepare()
  }, [])

  const RenderListItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.65}
        onPress={async () => {
          const payload = { id: item.id, fullname: item.fullname }
          await AsyncStorage.setItem('liveStockSoldOutTo', JSON.stringify(payload))
          navigation.goBack()
        }}>
        <Image source={item.profilePhoto ? { uri: item.profilePhoto } : IMAGE_PLACEHOLDER_SQUARE}
          style={{
            width: 48, height: 48, borderRadius: 25,
            ...(!item.profilePhoto && { backgroundColor: `${COLORS.COLOR_01}20`, tintColor: COLORS.COLOR_01 })
          }} />
        <View style={{ gap: 4, flex: 1 }} >
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}
            numberOfLines={1} ellipsizeMode='tail'>
            {item.fullname}
          </Text>

          <Text style={{ fontSize: 14, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_01 }}
            numberOfLines={1} ellipsizeMode='tail'>
            {item.address}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Select Consumer' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
      <CustomAppBar title='Select Consumer' onGoBack={() => navigation.goBack()} />

      <FlashList
        data={consumersData}
        renderItem={RenderListItem}
        estimatedItemSize={79}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: `${COLORS.COLOR_01}25` }} />}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </SafeAreaView>
  )
}

export default LiveStockFeaturesScreen

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: `${COLORS.COLOR_01}10`,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
}) 