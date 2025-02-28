import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import ScreenWapper from '../components/ScreenWrapper'
import Icon from '../assets/icons'
import { hp, wp } from '../configs/Common'
import { Theme } from '../configs/Theme'
import Avatar from '../components/Avatar'
import { MyUserContext } from '../configs/MyUserContext'
import { useNavigation } from '@react-navigation/native'
import APIs, { endpoints } from '../configs/APIs'
import PostCard from '../components/PostCard'
import Loading from '../components/Loading'
import EventCard from '../components/EventCard'
import SurveyCard from '../components/SurveyCard'

const Home = () => {
  const user = useContext(MyUserContext)
  const nav = useNavigation()
  const [loading, setLoading] = useState(false)
  const [mixItems, setMixItems] = useState([])
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  const [posts, setPosts] = useState([])
  const [postPage, setPostPage] = useState(1)
  const [hasMorePost, setHasMorePost] = useState(true)

  const [events, setEvents] = useState([])
  const [eventPage, setEventPage] = useState(1)
  const [hasMoreEvent, setHasMoreEvent] = useState(true)

  const [surveys, setSurveys] = useState([])
  const [surveyPage, setSurveyPage] = useState(1)
  const [hasMoreSurvey, setHasMoreSurvey] = useState(true)

  // const mixItems = [...posts, ...events, ...surveys].sort(
  //   (a, b) => new Date(b.created_date) - new Date(a.created_date)
  // )
 
  const loadPosts = async () => {
    setLoading(true)
    try {
      if(postPage > 0) {
        let res = await APIs.get(`${endpoints['posts']}?page=${postPage}`)
        let newPosts = res.data.results.map(post => ({ ...post, type: "post" }))
      
        if(postPage > 1) {
          setPosts(current => [...current, ...newPosts])
          setMixItems(current => [...current, ...newPosts])
        } else {
          setPosts(newPosts)
          if(isFirstLoad) {
            setMixItems(current => [...current, ...newPosts])
          }
        }

        if (!res.data.next) {
          setPostPage(0)
          setHasMorePost(false)
        }
      }
    } catch(ex) {
      console.error(ex)
    } finally {
      setLoading(false)
    }
  }

  const loadEvents = async () => {
    setLoading(true)
    try {
      if(eventPage > 0) {
        let res = await APIs.get(`${endpoints['events']}?page=${eventPage}`)
        let newEvents = res.data.results.map(event => ({ ...event, type: "event" }))
      
        if(eventPage > 1) {
          setEvents(current => [...current, ...newEvents])
          setMixItems(current => [...current, ...newEvents])
        } else {
          setEvents(newEvents)
          if(isFirstLoad) {
            setMixItems(current => [...current, ...newEvents])
          }
        }

        if (res.data.next === null) {
          setEventPage(0)
          setHasMoreEvent(false)
        }
      }
    } catch(ex) {
      console.error(ex)
    } finally {
      setLoading(false)
    }
  }

  const loadSurveys = async () => {
    setLoading(true)
    try {
      if(surveyPage > 0) {
        let res = await APIs.get(`${endpoints['surveys']}?page=${surveyPage}`)
        let newSurveys = res.data.results.map(survey => ({ ...survey, type: "survey" }))

        if(surveyPage > 1) {
          setSurveys(current => [...current, ...newSurveys])
          setMixItems(current => [...current, ...newSurveys])
        } else {
          setSurveys(newSurveys)          
          if(isFirstLoad) {
            setMixItems(current => [...current, ...newSurveys])
          }
        }

        if (res.data.next === null) {
          setSurveyPage(0)
          setHasMoreSurvey(false)
        }
      }
    } catch(ex) {
      console.error(ex)
    } finally {
      setLoading(false)
    }
  }

  // const loadMoreData = () => {
  //   if (!loading) {
  //     if (postPage > 0 && hasMorePost && posts.length>7) setPostPage(postPage + 1)
  //     if (eventPage > 0 && hasMoreEvent && events.length>7) setEventPage(eventPage + 1)
  //     if (surveyPage > 0 && hasMoreSurvey && surveys.length>7) setSurveyPage(surveyPage + 1)
  //   }
  // }

  // const refresh = () => {
  //   setMixItems([])
  //   setIsFirstLoad(true)

  //   setPostPage(1)
  //   setHasMorePost(true)

  //   setEventPage(1)
  //   setHasMoreEvent(true)

  //   setSurveyPage(1)
  //   setHasMoreSurvey(true)
  // }

  const loadData = async () => {
    setLoading(true);
    try {
        // Gọi API đồng thời để lấy tất cả bài viết, sự kiện và khảo sát
        const [postRes, eventRes, surveyRes] = await Promise.all([
            APIs.get(`${endpoints['posts']}?page=${postPage}`),
            APIs.get(`${endpoints['events']}?page=${eventPage}`),
            APIs.get(`${endpoints['surveys']}?page=${surveyPage}`)
        ]);

        // Định dạng dữ liệu, thêm thuộc tính type để phân biệt
        setPosts(postRes.data.results)
        const newPosts = postRes.data.results.map(post => ({ ...post, type: "post" }));
        const newEvents = eventRes.data.results.map(event => ({ ...event, type: "event" }));
        const newSurveys = surveyRes.data.results.map(survey => ({ ...survey, type: "survey" }));

        // Gộp tất cả dữ liệu lại và sắp xếp theo thời gian
        const allItems = [...newPosts, ...newEvents, ...newSurveys].sort(
            (a, b) => new Date(b.created_date) - new Date(a.created_date)
        );

        setMixItems(allItems);

        // Cập nhật trạng thái để biết có còn dữ liệu để load tiếp không
        setHasMorePost(postRes.data.next !== null);
        setHasMoreEvent(eventRes.data.next !== null);
        setHasMoreSurvey(surveyRes.data.next !== null);

        // Cập nhật page để load thêm nếu cần
        setPostPage(prev => (postRes.data.next ? prev + 1 : prev));
        setEventPage(prev => (eventRes.data.next ? prev + 1 : prev));
        setSurveyPage(prev => (surveyRes.data.next ? prev + 1 : prev));

    } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
}, []);

const loadMoreData = () => {
  if (!loading) {
      loadData();
  }
};

const refresh = () => {
  setMixItems([]);
  setPostPage(1);
  setEventPage(1);
  setSurveyPage(1);
  setHasMorePost(true);
  setHasMoreEvent(true);
  setHasMoreSurvey(true);
  loadData();
};


//   useEffect(() => {
//     loadPosts()
//   }, [postPage])

//   useEffect(() => {
//     loadEvents()
//   }, [eventPage])

//   useEffect(() => {
//     loadSurveys()
//   }, [surveyPage])

//   useEffect(() => {
//     if (isFirstLoad) {
//       setMixItems(current => 
//           [...current].sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
//       )
//       setIsFirstLoad(false)
//     }
// }, [])

  const deletePost = (postId) => {
    setPosts(posts => posts.filter(post => post.id !== postId))
  }

  return (
    <ScreenWapper bg='white'>
      <View style={styles.container}>

        {/* HEADING */}
        <View style={styles.header}>
          <Text style={styles.title}>O-Alum</Text>
        
          <View style={styles.icons}>
            <TouchableOpacity>
              <Icon name={'heart'} size={hp(3.2)} strokeWidth={2} color={Theme.colors.text}/>
            </TouchableOpacity>

            {user.role === "ADMIN" && (
              <View style={{flexDirection: 'row', gap: 14}}>
                <TouchableOpacity onPress={() => {nav.navigate('create-event-post')}}>
                  <Icon name={'list'} size={hp(3.2)} strokeWidth={2} color={Theme.colors.text}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {nav.navigate('create-survey-post')}}>
                  <Icon name={'add'} size={hp(3.2)} strokeWidth={2} color={Theme.colors.text}/>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={() => {nav.navigate('create-new-post')}}>
              <Icon name={'plus'} size={hp(3.2)} strokeWidth={2} color={Theme.colors.text}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {nav.navigate('time-line', {targetUser: user})}}>
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

        {/* BODY (POSTS) */}
        {/* {<Loading/> && loading} */}
        <FlatList
          data={mixItems}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={(item) => `item-${item.type}-${item.id}`}
          renderItem={({ item }) =>
            item.type === "post" ? (
              <PostCard 
                post={item}
                onDeletePost={deletePost}
              />
            ) : item.type === "event" ? (
              <EventCard event={item} />
            ) : (
              <SurveyCard survey={item} />
            )
          }
          onEndReached={loadMoreData}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh}/>}
          ListFooterComponent={ hasMorePost || hasMoreEvent || hasMoreSurvey ? 
            (
            <View style={{magrinVertical: 30}}>
              <Loading/>
            </View>
          ): (
            <View style={{magrinVertical: 30}}>
              <Text style={styles.footerText}>Đã đọc hết bài viết!</Text>
            </View>
          )}
        />

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
  }, 
  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4)
  },
  footerText: {
    textAlign: 'center',
    color: Theme.colors.text,
    fontSize: 18,
    marginVertical: 30
  }
})