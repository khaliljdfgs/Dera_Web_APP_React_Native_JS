import React, { useEffect, useState, useCallback } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Bubble, Composer, GiftedChat, InputToolbar, Message, Send, Time } from 'react-native-gifted-chat'
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons'
import { Timestamp, addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { v4 as uuidv4 } from 'uuid'

import CustomLoading from '../../components/CustomLoading'
import CustomAppBar from '../../components/CustomAppBar'

import ROUTES from '../../config/routes'
import COLORS from '../../config/colors'
import { ROLES } from '../../config/values'
import { Firestore } from '../../config/firebase'
import { GetDistance } from '../../utils/Helpers'

const ChatScreen = ({ navigation, route }) => {
  const [isLoading, setIsLoading] = useState(null)

  const { user, currentUser, message } = route.params

  let chatId = route.params.chatId
  let requestForLivestock = route.params.requestForLivestock

  const [messages, setMessages] = useState([])

  useEffect(() => {
    let ChatListener = () => { }

    const Setup = async (id) => {
      if (id) {
        const messageCollection = collection(Firestore, 'chats', id, 'messages')
        ChatListener = onSnapshot(messageCollection, snapshot => {
          const messages = snapshot.docs.map(doc => {
            const data = doc.data()

            const message = {
              _id: doc.id,
              text: data.text,
              user: {
                _id: data.user._id,
                name: data.user.name
              }
            }

            message.createdAt = data.createdAt
              ? new Timestamp(data.createdAt?.seconds, data.createdAt?.nanoseconds).toDate()
              : new Date()

            return message
          })

          messages.sort((a, b) => b.createdAt - a.createdAt)

          setMessages(messages)
        })
      } else { setIsLoading(null) }
    }

    const IsAlreadyHavingChat = async () => {
      const chats = JSON.parse(await AsyncStorage.getItem('chats'))

      const filteredChats = chats?.filter(chat => {
        return chat.sender?.id === currentUser.uid && chat.receiver?.id === user.id
          || chat.sender?.id === user.id && chat.receiver?.id === currentUser.uid
      })

      const __id = filteredChats?.length > 0 ? filteredChats[0].id : uuidv4()
      chatId = __id

      await Setup(__id)
    }

    setIsLoading('Loading Chat...')
    IsAlreadyHavingChat().then(() => {
      // setIsLoading(null)
      console.log('ChatScreen: IsAlreadyHavingChat: Done')
      setTimeout(() => {
        setIsLoading(null)
      }, 1500)
    })
    return () => ChatListener()
  }, [])

  const onSend = useCallback(async (messages = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, messages))

    if (requestForLivestock) {
      const livestockPayload = {
        requests: [...requestForLivestock.requests, currentUser.uid]
      }

      const livestockDocumentRef = doc(Firestore, 'livestocks', requestForLivestock.id)
      await setDoc(livestockDocumentRef, livestockPayload, { merge: true })

      requestForLivestock = null
    }

    const payload = {
      sender: currentUser.uid,
      receiver: user.id,
      lastMessage: messages[0].text,
      createdAt: serverTimestamp(),
    }

    const chatDoc = doc(Firestore, 'chats', chatId)
    await setDoc(chatDoc, payload, { merge: true })

    const messageCollection = collection(Firestore, 'chats', chatId, 'messages')

    const messageData = {
      text: messages[0].text,
      createdAt: serverTimestamp(),
      user: {
        _id: currentUser.uid,
        name: currentUser.accountType === ROLES.DERA
          ? currentUser.businessName
          : currentUser.fullname
      }
    }

    await addDoc(messageCollection, messageData)
  }, [])

  const RenderChatEmpty = () => {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{
          color: `${COLORS.COLOR_08}50`,
          fontSize: 18,
          fontFamily: 'NunitoSans-Regular',
          transform: [{ rotateX: '180deg' }]
        }}>Start a new conversation!</Text>
      </View>
    )
  }

  const RenderBubble = (props) => {
    return (
      <Bubble
        {...props}
        currentMessage={props.currentMessage}
        renderTime={(props) => {
          return (
            <Time
              {...props}
              timeTextStyle={{
                left: {
                  color: COLORS.COLOR_01,
                  fontSize: 12,
                  fontFamily: 'NunitoSans-Light',
                },
                right: {
                  color: COLORS.COLOR_01,
                  fontSize: 12,
                  fontFamily: 'NunitoSans-Light',
                }
              }}
            />
          )
        }}
        wrapperStyle={{
          left: {
            backgroundColor: `${COLORS.COLOR_01}20`,
            borderWidth: 1,
            borderColor: COLORS.COLOR_01,
            borderRadius: 8,
            paddingHorizontal: 2,
            paddingVertical: 4,
          },
          right: {
            backgroundColor: COLORS.COLOR_06,
            borderWidth: 1,
            borderColor: COLORS.COLOR_01,
            borderRadius: 8,
            paddingHorizontal: 2,
            paddingVertical: 4,
          },
        }}
        textStyle={{
          left: {
            color: COLORS.COLOR_01,
            fontSize: 18,
            fontFamily: 'NunitoSans-Regular',
          },
          right: {
            color: COLORS.COLOR_01,
            fontSize: 18,
            fontFamily: 'NunitoSans-Regular',
          }
        }}
      />
    )
  }

  const RenderMessage = (props) => {
    return (
      <Message
        {...props}
        containerStyle={{
          left: { paddingLeft: 8, paddingBottom: 8 },
          right: { paddingRight: 8, paddingBottom: 8 },
        }}
      />
    )
  }

  const RenderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: COLORS.COLOR_06,
          borderTopWidth: 1,
          borderTopColor: COLORS.COLOR_01,
        }}
        renderComposer={(props) => {
          return (
            <Composer
              {...props}
              textInputStyle={{
                color: COLORS.COLOR_01,
                fontSize: 18,
                fontFamily: 'NunitoSans-Regular',
                padding: 8,
              }}
              placeholderTextColor={COLORS.COLOR_01}
            />
          )
        }}
        renderSend={(props) => {
          return (
            <Send
              {...props}
              alwaysShowSend={true}
              containerStyle={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 8,
              }}>
              <MaterialIcons name='send' size={26} color={COLORS.COLOR_01} />
            </Send>
          )
        }}
      />
    )
  }

  const AppBar = () => (
    <CustomAppBar
      title={
        user.accountType === ROLES.DERA
          ? user.businessName
          : user.fullname
      }
      onGoBack={() => navigation.goBack()}
      onRightIconPress={async () => {
        const distance = GetDistance(
          { latitude: currentUser.geoLocation?.latitude, longitude: currentUser.geoLocation?.longitude },
          { latitude: user.geoLocation?.latitude, longitude: user.geoLocation?.longitude }
        )

        const payload = {
          user: user,
          distanceString: distance < 1000 ? `${distance.toFixed(2)} m` : `${(distance / 1000).toFixed(2)} km`,
          fromChatScreen: true
        }

        if (user.accountType === ROLES.DERA) {
          navigation.navigate(ROUTES.DVM.VIEW_DERA_PROFILE, payload)
        } else if (user.accountType === ROLES.DVM) {
          navigation.navigate(ROUTES.DERA.VIEW_DVM_PROFILE, payload)
        }
        //  else if (user.accountType === ROLES.CONSUMER && currentUser.accountType === ROLES.DERA) {
        //   navigation.navigate(ROUTES.DERA.VIEW_DVM_PROFILE, payload)
        // }
      }}
      rightIcon={<MaterialCommunityIcons name='account-circle' size={26} color={COLORS.COLOR_06} />}
    />
  )

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <AppBar />
        <CustomLoading message='Loading Chat...' />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
      <AppBar />
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: currentUser?.uid,
          name: currentUser?.accountType === ROLES.DERA
            ? currentUser?.businessName
            : currentUser?.fullname
        }}
        initialText={message}
        alignTop={messages.length > 0}
        timeFormat='hh:mm:ss A'
        dateFormat='DD-MMM-YYYY'
        isKeyboardInternallyHandled={false}
        inverted={true}
        messagesContainerStyle={{ backgroundColor: COLORS.COLOR_06 }}
        renderMessage={RenderMessage}
        renderAvatar={null}
        renderChatEmpty={RenderChatEmpty}
        renderBubble={RenderBubble}
        renderInputToolbar={RenderInputToolbar}
      />

      {
        Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />
      }

    </SafeAreaView>
  )
}

export default ChatScreen

const styles = StyleSheet.create({})