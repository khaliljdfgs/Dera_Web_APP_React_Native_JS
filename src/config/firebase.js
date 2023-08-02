import { getApp, getApps, initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, initializeAuth } from 'firebase/auth'
import { getReactNativePersistence } from 'firebase/auth/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAy4uyjNpPdSuGY2KaLPnFOMJb1n7dKmlA",
  authDomain: "dera-dfce2.firebaseapp.com",
  projectId: "dera-dfce2",
  storageBucket: "dera-dfce2.appspot.com",
  messagingSenderId: "59856671342",
  appId: "1:59856671342:web:7fa762cc805f04f54dcc7f"
}

let FirebaseApp = null
let Authentication = null

if (getApps().length === 0) {
  FirebaseApp = initializeApp(FIREBASE_CONFIG)
  Authentication = initializeAuth(FirebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
} else {
  FirebaseApp = getApp()
  Authentication = getAuth()
}

const Firestore = getFirestore(FirebaseApp)
const Storage = getStorage(FirebaseApp)

export { Authentication, Firestore, Storage }