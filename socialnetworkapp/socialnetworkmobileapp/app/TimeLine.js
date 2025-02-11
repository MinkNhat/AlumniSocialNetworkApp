import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import Avatar from '../components/Avatar'
import { getFullName, hp, wp } from '../configs/Common'
import { Theme } from '../configs/Theme'
import { MyUserContext } from '../configs/MyUserContext'
import APIs, { endpoints } from '../configs/APIs'
import PostCard from '../components/PostCard'

const TimeLine = () => {
    const user = useContext(MyUserContext)
    const [posts, setPosts] = useState([])

    const loadPosts = async () => {
        let res = await APIs.get(endpoints['timeline'](user.id))
        setPosts(res.data)
        console.info(res.data)
    }

    useEffect(() => {
        loadPosts()
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
      </View>
    </View>

    <FlatList
        data={posts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
        <PostCard
            post={item}
            />
        }
    />
  </ScreenWrapper>
  )
}

export default TimeLine

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginHorizontal: wp(4),
      gap: 24,
      alignItems: 'center',
      marginBottom: 20
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
    
    usernameText: {
      fontWeight: Theme.fonts.bold,
      fontSize: 24,
      color: Theme.colors.text
    },
    
  })