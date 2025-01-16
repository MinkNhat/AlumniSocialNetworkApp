import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext } from 'react'
import ScreenWapper from '../components/ScreenWrapper'
import Icon from '../assets/icons'
import { hp, wp } from '../configs/Common'
import { Theme } from '../configs/Theme'
import Avatar from '../components/Avatar'
import { MyUserContext } from '../configs/MyUserContext'

const Home = () => {
  const user = useContext(MyUserContext)
  console.log(user)

  return (
    <ScreenWapper bg='white'>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>O-Alum</Text>
        
          <View style={styles.icons}>
            <TouchableOpacity>
              <Icon name={'heart'} size={hp(3.2)} strokeWidth={2} color={Theme.colors.text}/>
            </TouchableOpacity>
            <TouchableOpacity>
              <Icon name={'plus'} size={hp(3.2)} strokeWidth={2} color={Theme.colors.text}/>
            </TouchableOpacity>
            <TouchableOpacity>
              {user.avatar? 
                <Avatar 
                  uri={user.avatar}
                  size={hp(4.2)}
                  rounded={Theme.radius.sm}
                /> : 
                <Icon name={'user'} size={hp(3.2)} strokeWidth={2} color={Theme.colors.text}/>
              }
              
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </ScreenWapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1
  }, 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(6)
  }, 
  title: {
    color: Theme.colors.text,
    fontSize: 26,
    fontWeight: Theme.fonts.bold
  },
  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14
  }
})