import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { MyDispatchContext, MyUserContext } from '../configs/MyUserContext'
import Styles from '../styles/Styles'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteToken, hp, wp } from '../configs/Common'
import { useNavigation } from '@react-navigation/native'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import Button from '../components/Button'
import { Theme } from '../configs/Theme'
import Avatar from '../components/Avatar'
import Icon from '../assets/icons'
import {getFullName} from '../configs/Common'
import APIs, { endpoints } from '../configs/APIs'

const UserProfile = () => {
    const user = useContext(MyUserContext)
    const dispatch = useContext(MyDispatchContext)
    const nav = useNavigation()
    const [countPost, setCountPost] = useState(0)

    const countPosts = async () => {
      let res = await APIs.get(endpoints['timeline'](user.id))
      setCountPost(res.data.count)
  }

    const logout = async () => {
      await deleteToken('token')
      dispatch({
        'type': 'logout'
      }) 
    }

    useEffect(() => {
      countPosts()
    }, [])

  return (
    <ScreenWrapper bg='white'>
      <StatusBar style='dark'/> 

      <View style={styles.container}>
        <Avatar rounded={'50%'} size={hp(10)} uri={user?.avatar}/>
        <View style={styles.userInfoContainer}>
          <Text style={styles.usernameText}>
            {getFullName(user.first_name, user.last_name)}
          </Text>
          <View style={styles.infoView}>
            <TouchableOpacity onPress={() => 
              nav.navigate('time-line', {targetUser: user})
            }>
              <Text style={styles.count}>{countPost}</Text>
              <Text style={styles.text}>Bài viết</Text> 
            </TouchableOpacity>
            
            <TouchableOpacity>
              <Text style={styles.count}>0</Text> 
              <Text style={styles.text}>Bạn bè</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <TouchableOpacity onPress={() => {}}>
        <View style={styles.editProfile}>
          <Text>Chỉnh sửa thông tin cá nhân</Text>
            <View style={styles.editIcon}>
              <Icon name={'edit'} size={30} color={Theme.colors.dark}/>
            </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {nav.navigate('change-password')}}>
        <View style={[styles.editProfile, {marginTop: -hp(4)}]}>
          <Text>Đổi mật khẩu</Text>
          <View style={styles.editIcon}>  
            <Icon name={'edit'} size={30} color={Theme.colors.dark}/>
          </View>
        </View>
      </TouchableOpacity>
      
      <Button onPress={logout} title='Đăng xuất' buttonStyle={styles.logoutButton} textStyle={styles.logoutText}></Button>
    </ScreenWrapper>
  )
}

export default UserProfile  

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: wp(4),
    gap: 24,
    alignItems: 'center'
  },
  logoutButton: {
    backgroundColor: '#FF4040',
    marginHorizontal: wp(10)
  },
  logoutText: {
    color: 'white',
    fontWeight: Theme.fonts.medium
  },
  userInfoContainer: {
    // flexDirection: 'row'
  },
  infoView: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 24
  },
  usernameText: {
    fontWeight: Theme.fonts.bold,
    fontSize: 18,
    color: Theme.colors.text
  },
  count: {
    textAlign: 'center',
    fontSize: 16,
    color: Theme.colors.text,
  },
  text: {

  },
  editProfile: {
    marginTop: hp(2),
    marginBottom: hp(6),
    marginHorizontal: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: Theme.radius.xl,
    borderCurve: 'continuous',
    borderColor: Theme.colors.gray
  },
  editIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
})