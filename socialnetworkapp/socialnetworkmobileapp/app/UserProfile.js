import { StyleSheet, Text, View } from 'react-native'
import React, { useContext } from 'react'
import { MyDispatchContext, MyUserContext } from '../configs/MyUserContext'
import Styles from '../styles/Styles'
import { Button } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteToken } from '../configs/Common'
import { useNavigation } from '@react-navigation/native'

const UserProfile = () => {
    const user = useContext(MyUserContext)
    const dispatch = useContext(MyDispatchContext)
    const nav = useNavigation()

    const logout = async () => {
      await deleteToken('token')
      dispatch({
        'type': 'logout'
      })
    }

  return (
    <View style={Styles.container}>
      <Text style={Styles.subject}>
        Hello {user?.username} !!!
      </Text>

      <Button onPress={logout} mode='contained-tonal'>Dang xuat</Button>
    </View>
  )
}

export default UserProfile  

const styles = StyleSheet.create({})