import { FlatList, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import Avatar from '../components/Avatar'
import { getFullName, hp, wp } from '../configs/Common'
import { Theme } from '../configs/Theme'
import { MyUserContext } from '../configs/MyUserContext'
import APIs, { endpoints } from '../configs/APIs'
import PostCard from '../components/PostCard'
import BackButton from '../components/BackButton'
import { useNavigation, useRoute } from '@react-navigation/native'
import Button from '../components/Button'
import Loading from '../components/Loading'

const TimeLine = () => {
    const route = useRoute()
    const user = useContext(MyUserContext)
    const nav = useNavigation()
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const {targetUser} = route?.params
    const backgroundDefault = 'https://res.cloudinary.com/dbmwgavqz/image/upload/v1739285564/plain-grey-background-ydlwqztavi78gl24_nq4dro.jpg'

    // console.log(targetUser)

    const loadPosts = async () => {
      if(page > 0) {
        setLoading(true)
        try {
          let url = `${endpoints['timeline'](targetUser.id)}?page=${page}`
          let res = await APIs.get(url)
          
          if (page > 1)
            setPosts(current => [...current, ...res.data.results])
          else
            setPosts(res.data.results)  

          if (res.data.next === null)
            setPage(0)

        } catch(ex) {
          console.error(ex)
        } finally {
          setLoading(false)
        }
      }
    }

    useEffect(() => {
      loadPosts()
    }, [page])

    useEffect(() => {
      setPosts([])
      setPage(1)
    }, [targetUser])

    const loadMore = () => {
      if (page > 0 && !loading)
        setPage(page + 1)
    }

  return (
    <ScreenWrapper bg='white'>
    <StatusBar style='dark'/> 
    <BackButton title={''} style={{color: Theme.colors.text}}/>

    <ScrollView 
      style={styles.container}
      onScroll={({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
          loadMore()
        }
      }}
      scrollEventThrottle={400}
    >
      <Avatar uri={backgroundDefault} size={hp(12)} style={{width: '100%'}}/>

      <View style={{width: '100%', height: '90'}}>
        <View style={styles.infoContainer}>
          <Avatar rounded={'50%'} size={hp(10)} uri={targetUser?.avatar} style={{backgroundColor: 'white'}}/>
          <View style={styles.userInfoContainer}>
            {targetUser.introduce!=="" ? 
              (
                <Text style={[styles.usernameText, {marginTop: 10}]}>
                  {getFullName(targetUser.first_name, targetUser.last_name)}
                </Text>
              ):
              (
                <View>
                  <Text style={styles.usernameText}>
                    {getFullName(targetUser.first_name, targetUser.last_name)}
                  </Text>
                  <View style={{width: '86%'}}>
                    <Text style={styles.bioText}>
                      {targetUser.introduce}
                    </Text>
                  </View>
                </View>
              )
            }
          </View>
        </View>
      </View>

      {
        user.id === targetUser.id ? (
          <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 4}}>
            <Button title='Chỉnh sửa trang cá nhân' hasShadow={false} buttonStyle={styles.editButton} textStyle={styles.buttonText}/>
          </View>
        ) : (
          <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 4}}>
            <Button title='Thêm bạn bè' hasShadow={false} buttonStyle={styles.primaryButton} textStyle={styles.buttonText}/>
            <Button 
              title='Nhắn tin' 
              hasShadow={false} 
              buttonStyle={styles.secondaryButton} 
              textStyle={styles.buttonText}
              onPress={() => nav.navigate('chat', {screen: "chatscreen", params: { senderId: user.id, receiverId: targetUser.id }})}
            />
          </View>
        )
      }
      
      {/* <FlatList
        data={posts}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        onEndReached={loadMore}
        renderItem={({ item }) => <PostCard post={item} />}
      /> */}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {loading && <Loading/>}

    </ScrollView>

    
  </ScreenWrapper>
  )
}

export default TimeLine

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wp(4),
    gap: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
    position: 'absolute',
    top: -30,
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
    marginLeft: 20,
    marginTop: 26
  },
  usernameText: {
    fontWeight: Theme.fonts.bold,
    fontSize: 24,
    color: Theme.colors.text,
  },
  bioText: {
    fontWeight: Theme.fonts.extraLight,
    fontSize: 16,
    color: Theme.colors.text,
    marginTop: 4,
  },
  primaryButton: {
    width: wp(40),
    height: hp(6),
    marginBottom: 16,
  },
  secondaryButton: {
    width: wp(40),
    height: hp(6),
    marginBottom: 16,
    backgroundColor: Theme.colors.blue,
    marginLeft: 16,
  },
  editButton: {
    width: wp(80),
    height: hp(6),
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: Theme.fonts.medium
  }
})