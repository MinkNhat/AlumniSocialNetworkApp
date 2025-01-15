import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import { Theme } from '../configs/Theme'

const Loading = ({size="large", color=Theme.colors.primary}) => {
  return (
    <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size={size} color={color}/>
    </View>
  )
}

export default Loading