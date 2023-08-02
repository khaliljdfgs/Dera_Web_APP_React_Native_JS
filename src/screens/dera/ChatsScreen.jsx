import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'
import AsyncStorage from '@react-native-async-storage/async-storage'

import CustomAlertDialog from '../../components/CustomAlertDialog'
import CustomLoading from '../../components/CustomLoading'
import CustomAppBar from '../../components/CustomAppBar'
import NoDataFound from '../../components/NoDataFound'

import COLORS from '../../config/colors'
import ROUTES from '../../config/routes'
import { ROLES } from '../../config/values'

import ChatsListener from '../../listeners/dera/ChatsListener'

import IMAGE_PLACEHOLDER_SQUARE from '../../../assets/images/image-placeholder-square.png'

const ChatsScreen = ({ navigation }) => {
  const [alert, setAlert] = useState(null)
  const [isLoading, setIsLoading] = useState(null)

  const [chatsData, setChatsData] = useState([])
  const [currentUser, setCurrentUser] = useState({})

  useEffect(() => {
    let __ChatsListener = () => { }

    const Setup = async () => {
      const currentUser = JSON.parse(await AsyncStorage.getItem('currentUser'))
      setCurrentUser(currentUser)

      __ChatsListener = ChatsListener({ currentUser, setChatsData, setIsLoading })
    }

    Setup()
    return () => __ChatsListener()
  }, [])

  const HandleOnPress = (item) => {
    const payload = {
      user: item.user,
      chatId: item.id,
      currentUser: currentUser,
    }
    navigation.navigate(ROUTES.COMMON.CHAT_SCREEN, payload)
  }

  const RenderListEmptyComponent = () => (
    <Text style={{
      textAlign: 'center',
      fontSize: 18,
      fontFamily: 'NunitoSans-SemiBoldItalic',
      color: COLORS.COLOR_04,
      marginTop: 8,
      paddingVertical: 16,
    }}>No Chat Found!</Text>
  )

  const RenderListItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.65}
        onPress={() => HandleOnPress(item)}>
        <Image source={
          item.user?.profilePhoto
            ? { uri: item.user?.profilePhoto }
            : IMAGE_PLACEHOLDER_SQUARE
        } style={{
          width: 48, height: 48, borderRadius: 25,
          ...(!item.user?.profilePhoto && { backgroundColor: `${COLORS.COLOR_01}20`, tintColor: COLORS.COLOR_01 })
        }} />
        <View style={{ gap: 4, flex: 1 }} >
          <Text style={{ fontSize: 18, fontFamily: 'NunitoSans-SemiBold', color: COLORS.COLOR_01 }}
            numberOfLines={1} ellipsizeMode='tail'>
            {item.user?.accountType === ROLES.DERA ? item.user?.businessName : item.user?.fullname}
          </Text>

          <Text style={{ fontSize: 14, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_01 }}
            numberOfLines={1} ellipsizeMode='tail'>
            {item.lastMessage}
          </Text>
        </View>
        <View style={{ gap: 4, alignItems: 'flex-end' }} >
          <Text style={{ fontSize: 12, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_01 }}
            numberOfLines={1} ellipsizeMode='tail'>
            {item.createdAt.time}
          </Text>
          <Text style={{ fontSize: 12, fontFamily: 'NunitoSans-Regular', color: COLORS.COLOR_01 }}
            numberOfLines={1} ellipsizeMode='tail'>
            {item.createdAt.date}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Chats' onGoBack={null} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
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

      <CustomAppBar title='Chats' onGoBack={null} />

      {
        chatsData?.length
          ?
          <FlashList
            data={chatsData}
            renderItem={RenderListItem}
            estimatedItemSize={156}
            ListEmptyComponent={RenderListEmptyComponent}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: `${COLORS.COLOR_01}25` }} />}
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
          :
          <NoDataFound message='No Chat Found!' />
      }
    </SafeAreaView>
  )
}

export default ChatsScreen

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: `${COLORS.COLOR_01}10`,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
}) 