import { collection, onSnapshot } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"
import { GetDistance } from "../../utils/Helpers"

const ServicesListener = ({
  currentUser = {},
  setIsServicesLoading = () => { },
  setServices = () => { },
}) => {
  return onSnapshot(collection(Firestore, 'services'), async (querySnapshot) => {
    setIsServicesLoading(true)

    const services = []
    querySnapshot.forEach((doc) => {
      services.push({ ...doc.data(), id: doc.id })
    })

    const dvmUsers = JSON.parse(await AsyncStorage.getItem('dvmUsers'))
    services.forEach((service, index) => {
      const user = dvmUsers.find((user) => user.id === service.owner)
      service.owner = user

      if (user) {
        const distance = GetDistance(
          { latitude: currentUser.geoLocation?.latitude, longitude: currentUser.geoLocation?.longitude },
          { latitude: user.geoLocation?.latitude, longitude: user.geoLocation?.longitude }
        )

        service.distance = distance
        service.distanceString = distance < 1000 ? `${distance.toFixed(2)} m` : `${(distance / 1000).toFixed(2)} km`
      }

      service.serviceTypeString = `${service.serviceType.isRemote ? 'Remote' : ''}${(service.serviceType.isRemote && service.serviceType.isOnSite) ? ' and ' : ''}${service.serviceType.isOnSite ? 'On-Site' : ''}`
    })

    services.sort((a, b) => a.distance - b.distance)
    await AsyncStorage.setItem('services', JSON.stringify(services))

    const servicesGrid = []
    for (let i = 0; i < services.length; i += 2) {
      if (i < 4) {
        servicesGrid.push(services.slice(i, i + 2))
      }
    }

    setServices(servicesGrid)
    setIsServicesLoading(false)
  }, (error) => {
    console.log(`Services Encountered Error: ${error}`)
  })
}

export default ServicesListener