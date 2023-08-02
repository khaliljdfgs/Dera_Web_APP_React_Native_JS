import React from 'react'
import { StyleSheet, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import CustomTextInput, { Label } from './CustomTextInput'
import CustomIconButton from './CustomIconButton'

import COLORS from '../config/colors'

const CustomSearch = ({
  search = '',
  setSearch = () => { },
  onRightIconPress = () => { },
  handleSearch = () => { },
  placeholder = '',
  containerStyle = {},
}) => {
  return (
    <View style={{ padding: 24, paddingBottom: 12, ...containerStyle }}>
      <Label label='Search' />
      <View style={{ flexDirection: 'row' }}>
        <CustomTextInput
          placeholder={placeholder}
          value={search}
          onChangeText={setSearch}
          rightIcon={search && <MaterialIcons name='clear' color={COLORS.COLOR_01} size={20} />}
          onRightIconPress={onRightIconPress}
          containerStyle={{ flex: 1 }}
        />
        <CustomIconButton
          icon={<MaterialIcons name='search' color={COLORS.COLOR_06} size={26} />}
          onPress={handleSearch}
          containerStyle={{ marginLeft: 8 }}
        />
      </View>
    </View>
  )
}

export default CustomSearch

const styles = StyleSheet.create({})