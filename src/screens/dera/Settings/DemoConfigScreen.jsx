import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { MaterialIcons } from '@expo/vector-icons'

import CustomAppBar from '../../../components/CustomAppBar'
import CustomLoading from '../../../components/CustomLoading'
import CustomAlertDialog from '../../../components/CustomAlertDialog'
import CustomTextInput from '../../../components/CustomTextInput'
import CustomButton from '../../../components/CustomButton'

import COLORS from '../../../config/colors'

const DemoConfigScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(null)
  const [alert, setAlert] = useState(null)

  const [url, setUrl] = useState('')

  React.useEffect(() => {
    const HandleLoad = async () => {
      setIsLoading('Loading...')
      const ENDPOINT = await AsyncStorage.getItem('demo_url') || ''
      setUrl(ENDPOINT)
      setIsLoading(null)
    }

    HandleLoad()
  }, [])

  const HandleClear = () => {
    setAlert({
      message: 'Are you sure you want to clear this information?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setUrl('')
        setAlert(null)
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  const HandleSubmit = async () => {
    const HandleSave = async () => {
      setIsLoading('Saving...')
      await AsyncStorage.setItem('demo_url', url)
      setIsLoading(null)

      navigation.goBack()
    }

    setAlert({
      message: 'Are you sure you want to submit this configuration?',
      positiveLabel: 'Yes',
      positiveCallback: () => {
        setAlert(null)
        HandleSave()
      },
      negativeLabel: 'No',
      negativeCallback: () => setAlert(null)
    })
  }

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.COLOR_06 }}>
        <CustomAppBar title='Demo Config' onGoBack={() => navigation.goBack()} />
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

      <CustomAppBar title='Demo Config' onGoBack={() => navigation.goBack()} />
      <KeyboardAwareScrollView enableOnAndroid={true} enableAutomaticScroll={true}>
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          <CustomTextInput
            label='API URL'
            placeholder='Enter API URL'
            value={url}
            onChangeText={(text) => setUrl(text)}
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

export default DemoConfigScreen

const styles = StyleSheet.create()