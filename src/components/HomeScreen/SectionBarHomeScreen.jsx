import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'

import COLORS from '../../config/colors'

const SectionBarHomeScreen = ({
  title = '',
  expandText = 'View All',
  onExpand = () => { },
  titleStyle = {},
  expandContainerStyle = {},
  expandTextStyle = {},
  isLoading = false,
}) => {
  return (
    <View style={{ ...styles.sectionContainer, ...titleStyle }}>
      <View>
        <Text style={{ ...styles.sectionTitle, ...titleStyle }}>{title}</Text>
        {/* <View style={{
          height: 4,
          backgroundColor: COLORS.COLOR_01,
          marginTop: 4,
        }} /> */}
      </View>
      {
        !isLoading &&
        <TouchableOpacity activeOpacity={0.55} onPress={onExpand}
          style={{ ...styles.expandContainer, ...expandContainerStyle }}>
          <Text style={{ ...styles.expandText, ...expandTextStyle }}>{expandText}</Text>
        </TouchableOpacity>
      }
    </View>
  )
}

export default SectionBarHomeScreen

const styles = StyleSheet.create({
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: COLORS.COLOR_01,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 6,
    borderStyle: 'dashed',
    paddingRight: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Ubuntu-Bold',
    color: COLORS.COLOR_01,
    textTransform: 'uppercase',
    borderColor: COLORS.COLOR_01,
    borderLeftColor: COLORS.COLOR_01,
    borderLeftWidth: 6,
    paddingLeft: 16,
    paddingVertical: 4
  },
  expandContainer: {
    backgroundColor: COLORS.COLOR_01,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  expandText: {
    fontSize: 14,
    fontFamily: 'Ubuntu-Regular',
    color: COLORS.COLOR_06,
  },
})