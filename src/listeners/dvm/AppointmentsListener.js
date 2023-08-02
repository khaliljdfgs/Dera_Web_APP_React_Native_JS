import { collectionGroup, getDocs, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"
import moment from 'moment'

import { Firestore } from "../../config/firebase"
import { GetDistance } from "../../utils/Helpers"

const AppointmentsListener = ({
  currentUser = {},
}) => {
  const appointmentsQuery = query(
    collectionGroup(Firestore, 'serviceAvailments'),
    where('serviceOfferedBy', '==', currentUser.uid)
  )

  return onSnapshot(appointmentsQuery, async (querySnapshot) => {
    const loadedData = []
    const deraUserIds = []

    querySnapshot.forEach((doc) => {
      loadedData.push({ id: doc.id, ...doc.data() })
    })

    loadedData.sort((a, b) => b.serviceAvailedAt.seconds - a.serviceAvailedAt.seconds)

    const dvmServices = JSON.parse(await AsyncStorage.getItem('services'))
    loadedData.forEach((item) => {
      item.service = dvmServices.find((dvmService) => dvmService.id === item.serviceId)
      if (!deraUserIds.includes(item.serviceAvailedBy)) deraUserIds.push(item.serviceAvailedBy)
    })

    if (deraUserIds.length > 0) {
      const deraUserQuery = query(
        collectionGroup(Firestore, 'users'),
        where('uid', 'in', deraUserIds)
      )

      const deraUserQuerySnapshot = await getDocs(deraUserQuery)
      const deraUsers = []
      deraUserQuerySnapshot.forEach((doc) => {
        deraUsers.push({ id: doc.id, ...doc.data() })
      })

      loadedData.forEach((item) => {
        item.dera = deraUsers.find((deraUser) => deraUser.uid === item.serviceAvailedBy)

        const distance = GetDistance(
          { latitude: currentUser.geoLocation?.latitude, longitude: currentUser.geoLocation?.longitude },
          { latitude: item.dera.geoLocation?.latitude, longitude: item.dera.geoLocation?.longitude }
        )

        item.deraDistance = distance
        item.deraDistanceString = distance < 1000 ? `${distance.toFixed(2)} m` : `${(distance / 1000).toFixed(2)} km`

        item.serviceAvailedAtString = moment(item.serviceAvailedAt.toDate()).format('DD MMM YYYY, hh:mm A')
      })
    }

    await AsyncStorage.setItem('appointments', JSON.stringify(loadedData))
  }, (error) => {
    console.log(`Appointments Listener Error: ${error}`)
  })
}

export default AppointmentsListener