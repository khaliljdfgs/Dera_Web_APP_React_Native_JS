import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'

import NotAvailableHomeScreen from './NotAvailableHomeScreen'

import COLORS from '../../config/colors'

import IMAGE_PLACEHOLDER_SQUARE from '../../../assets/images/image-placeholder-square.png'

const ItemCardsHomeScreen = ({
  isLoading = true,
  data = [],
  navigation = (item) => { },
  imageKey = '',
  renderImage = (item) => { },
  titleKey = '',
  details = [],
}) => {
  if (data.length === 0) {
    return (
      <NotAvailableHomeScreen text={isLoading ? 'Loading...' : 'Nothing Available'} />
    )
  }

  return (
    <>
      {
        data.map((row, rowIndex) => {
          return (
            <View style={{ flexDirection: 'row', gap: 16 }} key={rowIndex}>
              {
                row.map((item, index) => {
                  return (
                    <TouchableOpacity activeOpacity={0.70} style={styles.itemContainer} key={item.id}
                      onPress={() => { navigation(item) }}>

                      {
                        renderImage && renderImage(item)?.length > 0 &&
                        <Image source={{ uri: renderImage(item) }} style={styles.itemImage} />
                      }

                      {
                        imageKey.length > 0 && item[imageKey]?.length > 0
                        && <Image source={{ uri: item[imageKey] }} style={styles.itemImage} />
                      }

                      {
                        (renderImage && renderImage(item)?.length === 0) &&
                        (imageKey.length > 0 && item[imageKey]?.length === 0) &&
                        <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                          <Image source={IMAGE_PLACEHOLDER_SQUARE} style={styles.itemImagePlaceholder} />
                        </View>
                      }

                      <View style={{
                        ...styles.itemDetailsContainer,
                        ...(details.length === 0 && { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, paddingBottom: 0 }),
                      }}>
                        <Text style={styles.itemTitle} numberOfLines={1} ellipsizeMode='tail'>
                          {item[titleKey]}
                        </Text>
                        {
                          details.map((detail, index) => {
                            return (
                              <View style={{ ...styles.itemFeatureContainer, ...detail.containterStyle }} key={index}>
                                {detail.icon}
                                {detail.render
                                  ?
                                  <Text style={styles.itemFeature} numberOfLines={1} ellipsizeMode='tail'>
                                    {detail.render(item)}
                                  </Text>
                                  :
                                  <Text style={styles.itemFeature} numberOfLines={1} ellipsizeMode='tail'>
                                    {item[detail.key]}
                                  </Text>
                                }
                              </View>
                            )
                          })
                        }
                      </View>
                    </TouchableOpacity>
                  )
                })
              }

              {
                row.length === 1 &&
                <View style={{ flex: 1 }} />
              }
            </View>
          )
        })
      }
    </>
  )
}

export default ItemCardsHomeScreen

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: COLORS.COLOR_06,
    flex: 1,
    borderRadius: 8,
    elevation: 4,
  },
  itemImage: {
    aspectRatio: 1,
    width: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  itemImagePlaceholder: {
    aspectRatio: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  itemDetailsContainer: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
    gap: 8,
    paddingBottom: 8,
    backgroundColor: COLORS.COLOR_06,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: 'NunitoSans-SemiBold',
    color: COLORS.COLOR_06,
    backgroundColor: COLORS.COLOR_01,
    padding: 8,
    paddingHorizontal: 12,
  },
  itemFeatureContainer: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemFeature: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: COLORS.COLOR_01,
    backgroundColor: COLORS.COLOR_06,
    flex: 1,
  }
})