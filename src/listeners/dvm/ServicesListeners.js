import { collection, onSnapshot, query, where } from "firebase/firestore"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { Firestore } from "../../config/firebase"

const ServicesListeners = ({
  currentUser = {},
  setServices = () => { },
  setIsServicesLoading = () => { },
}) => {
  const servicesQuery = query(
    collection(Firestore, 'services'),
    where('owner', '==', currentUser.uid)
  )

  return onSnapshot(servicesQuery, async (querySnapshot) => {
    setIsServicesLoading(true)

    const services = []
    querySnapshot.forEach((doc) => {
      const service = doc.data()
      const serviceTypeString = `
      ${service.serviceType.isRemote ? 'Remote' : ''}
      ${(service.serviceType.isRemote && service.serviceType.isOnSite) ? ' and ' : ''}
      ${service.serviceType.isOnSite ? 'On-Site' : ''}`.replace(/\s+/g, ' ').trim()

      services.push({ ...service, id: doc.id, serviceTypeString })
    })

    await AsyncStorage.setItem('services', JSON.stringify(services))

    services.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)

    const servicesGrid = []
    for (let i = 0; i < services.length; i += 2) {
      if (i < 4) {
        servicesGrid.push(services.slice(i, i + 2))
      }
    }

    setServices(servicesGrid)
    setIsServicesLoading(false)
  }, (error) => {
    console.log(`Services Listener Error: ${error}`)
  })
}

export default ServicesListeners