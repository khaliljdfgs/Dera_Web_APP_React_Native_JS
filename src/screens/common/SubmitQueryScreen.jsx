import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { serverTimestamp, addDoc, collection } from 'firebase/firestore'
import { MaterialIcons } from '@expo/vector-icons'

import CustomAppBar from '../../components/CustomAppBar'
import CustomLoading from '../../components/CustomLoading'
import CustomAlertDialog from '../../components/CustomAlertDialog'
import CustomTextInput from '../../components/CustomTextInput'
import CustomButton from '../../components/CustomButton'

import COLORS from '../../config/colors'
import { Firestore } from '../../config/firebase'
import FirebaseErrors from '../../utils/FirebaseErrors'
import { InputStringValidation } from '../../utils/Validation'

const SubmitQueryScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [subject, setSubject] = useState('')
  const [query, setQuery] = useState('')

  const HandleClear = () => {
    setAlert({
      message: 'Are you sure you want to clear this information?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setSubject('')
        setQuery('')
        setAlert(null)
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleSubmit = async () => {
    const SubmitQuery = async () => {
      setIsLoading('Submitting...')
      const { uid } = JSON.parse(await AsyncStorage.getItem('currentUser'))

      try {
        const payload = {
          subject: subject.trim(),
          query: query.trim(),
          submittedBy: uid,
          submittedAt: serverTimestamp(),
        }

        await addDoc(collection(Firestore, 'queries'), payload)

        setAlert({
          title: 'Success',
          message: 'Your query has been submitted successfully!',
          positiveLabel: 'OK',
          positiveCallback: () => navigation.goBack()
        })
      } catch (error) {
        setAlert({
          message: FirebaseErrors[error.code] || error.message,
          positiveLabel: 'OK',
          positiveCallback: () => setAlert(null)
        })
      }

      setIsLoading(null)
    }

    const validation = [
      { field: 'Subject', value: subject, min: 3, max: 50 },
      { field: 'Query', value: query, min: 3, max: 750 },
    ]

    for (let i = 0; i < validation.length; i++) {
      let _validation = InputStringValidation(validation[i])
      if (_validation != null) {
        setAlert({ message: _validation, positiveCallback: () => setAlert(null) })
        return
      }
    }

    setAlert({
      message: 'Are you sure you want to submit this query?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setAlert(null)
        SubmitQuery()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Submit Query' onGoBack={() => navigation.goBack()} />
        <CustomLoading message={isLoading} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
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

      <CustomAppBar title='Submit Query' onGoBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          <CustomTextInput
            label='Subject'
            placeholder='Enter Subject'
            value={subject}
            onChangeText={(text) => setSubject(text)}
          />

          <CustomTextInput
            label='Query'
            placeholder='Enter Query'
            value={query}
            onChangeText={(text) => setQuery(text)}
            multiline={true}
          />

          <View style={{ flex: 1, flexDirection: 'row', gap: 16 }}>
            <CustomButton
              title='Clear'
              leftIcon={<MaterialIcons name='clear' size={24} color={COLORS.COLOR_06} />}
              containerStyle={{ flex: 1, backgroundColor: COLORS.DANGER }}
              onPress={HandleClear}
            />

            <CustomButton
              title='Submit'
              containerStyle={{ flex: 1, backgroundColor: COLORS.SUCCESS }}
              leftIcon={<MaterialIcons name='done' size={24} color={COLORS.COLOR_06} />}
              onPress={HandleSubmit}
            />
          </View>

          <View style={{ height: 200 }} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}

export default SubmitQueryScreen

const styles = StyleSheet.create()