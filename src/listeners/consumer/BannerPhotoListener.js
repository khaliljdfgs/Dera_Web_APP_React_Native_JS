import { doc, onSnapshot } from "firebase/firestore"

import { Firestore } from "../../config/firebase"
import { ROLES } from "../../config/values"

const BannerPhotoListener = ({
  setBannerPhotos = () => { },
}) => {
  const bannerPhotosDocRef = doc(Firestore, 'configs', ROLES.CONSUMER)

  return onSnapshot(bannerPhotosDocRef, (doc) => {
    const bannerPhotos = doc.data()?.bannerPhotos || []
    const validBannerPhotos = bannerPhotos.filter((photo) => photo) || []

    if (validBannerPhotos.length > 0) {
      setBannerPhotos(validBannerPhotos)
    }
  }, (error) => {
    console.log(`Banner Photo Listener Error: ${error}`)
  })
}

export default BannerPhotoListener