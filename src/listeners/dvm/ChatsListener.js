import { collection, collectionGroup, getDocs, onSnapshot, or, query, where } from "firebase/firestore"
import { Timestamp } from 'firebase/firestore'
import AsyncStorage from "@react-native-async-storage/async-storage"
import moment from "moment"

import { Firestore } from "../../config/firebase"

const ChatsListener = ({
  currentUser = {},
  setChatsData = () => { },
  setIsLoading = () => { }
}) => {
  setIsLoading('Loading...')

  const chatsQuery = query(
    collection(Firestore, 'chats'),
    or(
      where('sender', '==', currentUser.uid),
      where('receiver', '==', currentUser.uid)
    )
  )

  return onSnapshot(chatsQuery, async (querySnapshot) => {
    const loadedData = []
    const userIds = []

    querySnapshot.forEach((doc) => {
      const data = doc.data()
      loadedData.push({ id: doc.id, ...data })

      if (!userIds.includes(data.sender)) {
        userIds.push(data.sender)
      }

      if (!userIds.includes(data.receiver)) {
        userIds.push(data.receiver)
      }
    })

    if (userIds.length > 0) {
      const usersQuery = query(
        collectionGroup(Firestore, 'users'),
        where('uid', 'in', userIds)
      )

      const usersQuerySnapshot = await getDocs(usersQuery)
      const users = []
      usersQuerySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() })
      })

      loadedData.forEach((item) => {
        item.sender = users.find((user) => user.uid === item.sender)
        item.receiver = users.find((user) => user.uid === item.receiver)
      })
    }

    const filteredChats = []
    loadedData.forEach(chat => {
      const createdAtDate = new Timestamp(chat.createdAt?.seconds, chat.createdAt?.nanoseconds).toDate()

      const createdAt = {
        time: moment(createdAtDate).format('hh:mm A'),
        date: moment(createdAtDate).format('DD/MM/YYYY'),
      }

      const chatData = {
        id: chat.id,
        createdAt: createdAt,
        lastMessage: chat.lastMessage,
      }

      if (chat.sender?.id === currentUser.uid) {
        chatData.user = chat.receiver
        chatData.myself = chat.sender
      } else {
        chatData.user = chat.sender
        chatData.myself = chat.receiver
      }

      filteredChats.push({ ...chat, ...chatData })
    })

    await AsyncStorage.setItem('chats', JSON.stringify(filteredChats))

    setChatsData(filteredChats)
    setIsLoading(null)
  }, (error) => {
    console.log(`Chats Listener Error: ${error}`)
  })
}

export default ChatsListener