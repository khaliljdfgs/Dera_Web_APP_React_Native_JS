import React from 'react'
import { StyleSheet, View } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker'

import { Label } from './CustomTextInput'

import COLORS from '../config/colors'

const CustomDropDownPicker = ({
  open,
  setOpen,
  value,
  setValue,
  items,
  setItems,
  placeholder = 'Select',
  listMode = 'SCROLLVIEW',
  containerStyle = {},
  label = null,
  labelStyle = {},
  onOpen = () => { },
}) => {
  return (
    <View style={{ ...containerStyle }}>
      {label && <Label label={label} labelStyle={labelStyle} />}
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        onOpen={onOpen}
        placeholder={placeholder}
        listMode={listMode}
        style={{
          borderColor: COLORS.COLOR_01,
          borderWidth: 2,
          borderRadius: 6,
          paddingVertical: 12,
          minHeight: 0,
        }}
        arrowIconStyle={{ tintColor: COLORS.COLOR_01 }}
        tickIconStyle={{ tintColor: COLORS.COLOR_01 }}
        labelStyle={styles.dropDownStyle}
        placeholderStyle={{ ...styles.dropDownStyle, opacity: 0.35 }}
        listItemLabelStyle={styles.dropDownStyle}
        dropDownContainerStyle={{
          backgroundColor: COLORS.COLOR_06,
          borderColor: COLORS.COLOR_01,
          borderWidth: 2,
          borderRadius: 6,
          borderTopWidth: 0,
          paddingHorizontal: 12,
          position: 'relative',
          top: 0,
        }}
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
        props={{ activeOpacity: 1 }}
        itemSeparator={true}
        itemSeparatorStyle={{ backgroundColor: COLORS.COLOR_01, opacity: 0.25 }}
      />
    </View>
  )
}

export default CustomDropDownPicker

const styles = StyleSheet.create({
  dropDownStyle: {
    fontSize: 18,
    fontFamily: 'NunitoSans-Regular',
    paddingVertical: 0,
    marginVertical: 0,
  }
})