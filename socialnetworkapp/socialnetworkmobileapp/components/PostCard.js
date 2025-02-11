import { Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { Theme } from '../configs/Theme'
import { getFullName, getTimeFromNow, getToken, hp, stripHtmlTags, wp } from '../configs/Common'
import Avatar from './Avatar'
import Icon from '../assets/icons'
import HTMLView from 'react-native-htmlview'
import APIs, { authApis, endpoints } from '../configs/APIs'
import Carousel from 'react-native-reanimated-carousel'

import AnimatedPaginationDot from 'react-native-animated-pagination-dot';
import { Video } from 'expo-av'

import Loading from './Loading'
import { MyUserContext } from '../configs/MyUserContext'
import { useNavigation } from '@react-navigation/native'
import { Divider, Menu, PaperProvider, Portal } from 'react-native-paper'
import Constants from 'expo-constants';

const PostCard = ({
    post,
    hasShadow = true,
    onDeletePost
}) => {
    const [media, setMedia] = useState([])
    const [loading, setLoading] = useState(true)
    const [action, setAction] = useState(null)
    const [actions, setActions] = useState([])
    const [commentsCount, setCommentsCount] = useState(0)
    const [currentIndex, setCurrentIndex] = useState(0)
    const user = useContext(MyUserContext)
    const nav = useNavigation()
    const [visibleMenu, setVisibleMenu] = useState(false)
    // const WEBSOCKET_URL = 'ws://192.168.2.6:8000/ws/posts/'
    const [socket, setSocket] = useState(null)
    const [showActionMenu, setShowActionMenu] = useState(false)
    const { WEBSOCKET_URL } = Constants.expoConfig.extra

    const ActionIcons = {
        0: { name: 'like', color: Theme.colors.blue },
        1: { name: 'smile', color: Theme.colors.yellow },
        2: { name: 'heart', color: Theme.colors.rose },
        3: { name: 'sad', color: Theme.colors.yellow }
    }
    
    const shawdowStyles = {
        shadowOffset: {
            with: 0,
            height: 2
        },
        shadowOpacity: 0.06, 
        shadowRadius: 6,
        elevantion: 1
    }

    const renderItem = ({ item }) => {
        if (item.media_type?.startsWith('image')) {
            return (
                <Image
                    source={{ uri: item.file }}
                    style={styles.carouselMedia}
                    resizeMode="cover"
                />
            );
        } else if (item.media_type?.startsWith('video')) {
            return (
                <Video
                    source={{ uri: item.file }}
                    style={styles.carouselMedia}
                    resizeMode="contain"
                    useNativeControls
                />
            );
        }
        return null;
    };

    const onShare = async () => {
        let content = {message: stripHtmlTags(post?.caption)}

        if(media.length > 0) {
            const imageUrl = media[0]?.file; 
            content = { ...content, url: imageUrl };
        }

        try {
            await Share.share(content)
        } catch(ex) {
            console.error(ex)
        }
    }

    const loadAction = async () => {
        let res = await APIs.get(endpoints['action'](post.id))
        setActions(res.data.filter(action => action.active === true))
        const action = res.data.find(action => action.user.id === user.id && action.active === true)
        setAction(action.type)
    }

    const loadMedia = async () => {
        setLoading(true)
        try {
            let res = await APIs.get(endpoints['media'](post.id))
            setMedia(res.data)
        } catch(ex) {
            console.error(ex)
        } finally {
            setLoading(false)
        }
    }   
    
    const loadCommentsCount = async () => {
        let res = await APIs.get(endpoints['comments'](post.id))
        setCommentsCount(res.data.count)
    }

    useEffect(() => {
        loadMedia()
        loadCommentsCount()
        loadAction()
    }, [])

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}${post.id}/`)
    
        ws.onmessage = (event) => {
            const newEvent = JSON.parse(event.data)
            if(newEvent.type === "action")
                loadAction()
            // if(newEvent.type === "comment") 
            //     loadCommentsCount()
        }
    
        ws.onerror = (error) => {
            console.log('WebSocket error:', error)
        }

        setSocket(ws)
    
        return () => {
            ws.close()
        }
    }, [post.id])

    const openMenu = () => {
        setVisibleMenu(true)
    }
    const closeMenu = () => {
        setVisibleMenu(false)
    }

    const handleUpdatePost = async () => {
        nav.navigate('create-new-post', {
            isUpdate: true,
            title: "Chỉnh sửa bài viết",
            buttonText: "Chỉnh sửa",
            post: post,
            media: media

        })
        setVisibleMenu(false)
    }

    const handleDeletePost = async () => {
        const token = await getToken('token')
        try {
            await authApis(token).delete(endpoints['post-details'](post.id))
            onDeletePost(post.id)
        } catch(ex) {
            console.error(ex)
        }
        setVisibleMenu(false)
    }

    const handleCommentCountChange = (change) => {
        setCommentsCount(prev => Math.max(0, prev + change));
    }

    const handleAction = async (type) => {
        setAction(type)
        setShowActionMenu(false)
    
        const token = await getToken('token')
        let res = await authApis(token).post(endpoints['action'](post.id), { 
            "type": type 
        })

        if(res.data.active === false) setAction(null)
    
        if (socket) {
            socket.send(JSON.stringify({
                "type": "action",
                "data": res.data
            }));
        }
    };


  return (
    <View style={[styles.container, hasShadow && shawdowStyles]}>
      <View style={styles.header}>
            <View style={styles.userInfo}>
                <Avatar
                    size={hp(4.5)}
                    rounded={Theme.radius.md} 
                    uri={post?.user?.avatar}
                />
                <View style={{gap: 4}}>
                    <Text style={styles.username}>{getFullName(post?.user?.first_name, post?.user?.last_name)}</Text>
                    <Text style={styles.postTime}>{getTimeFromNow(post?.created_date)}</Text>
                </View>
            </View>

            {/* <TouchableOpacity>
                <Icon name={'threeDotsHorizontal'} size={hp(3.4)} strokeWidth={3} color={Theme.colors.text}/>
            </TouchableOpacity> */}
            
            <View style={styles.menuContainer}>
                <Menu
                    visible={visibleMenu}
                    onDismiss={closeMenu}
                    anchor={
                        <TouchableOpacity onPress={openMenu}>
                            <Icon name={'threeDotsHorizontal'} size={hp(3.4)} strokeWidth={3} color={Theme.colors.text}/>
                        </TouchableOpacity>
                    }
                    contentStyle={styles.menuStyle}
                >
                    <Menu.Item onPress={() => closeMenu()} title="Lưu bài viết" />
                    <Menu.Item onPress={() => closeMenu()} title="Báo cáo bài viết" />
                    {post?.user?.id === user.id && (
                        <View>
                            <Menu.Item onPress={() => handleUpdatePost()} title="Chỉnh sửa bài viết" />
                            <Menu.Item onPress={() => handleDeletePost()} title="Xoá bài viết" titleStyle={{color: 'red'}}/>
                        </View>
                    )}
                    {post?.user?.id !== user.id && user.role === "ADMIN" && (
                        <Menu.Item onPress={() => handleDeletePost()} title="Xoá bài viết" titleStyle={{color: 'red'}}/>
                    )}
                </Menu>
            </View>
      </View>

      <View style={styles.content}>
            <View style={styles.postBody}>
                {
                    post?.caption && (
                        <HTMLView
                            value={post?.caption}
                            stylesheet={styles.tagsStyle}
                            // onLinkPress={(url) => console.log(`Link clicked: ${url}`)}
                        />
                    )
                }
            </View>

            {media.length > 0 && (
                <View style={styles.carouselContainer}>
                    {<Loading/> && loading}
            
                    <Carousel
                        data={media}
                        renderItem={renderItem}
                        width={wp(88)}
                        height={hp(30)}
                        loop={false}
                        mode="parallax"
                        onSnapToItem={(index) => setCurrentIndex(index)}
                        modeConfig={{
                            parallaxScrollingScale: 0.95,
                            parallaxScrollingOffset: 20, 
                            parallaxAdjacentItemScale: 0.85
                        }}
                    />

                    {media.length > 1 && (
                        <View style={styles.paginationContainer}>
                            <AnimatedPaginationDot
                                activeDotColor={Theme.colors.primary} 
                                curPage={currentIndex}
                                maxPage={media.length} 
                                containerStyle={styles.paginationDots}
                                animatedDuration={100} 
                            />
                        </View>)
                    }
                    
                </View>
            )}
      </View>

      <View style={styles.footer}>
            <View style={styles.footerButton}>
                <TouchableOpacity onPress={() => handleAction(2)} onLongPress={() => setShowActionMenu(true)}>
                <Icon 
                    name={ActionIcons[action]?.name || 'heart'}
                    size={24} 
                    fill={action !== null ? ActionIcons[action]?.color : 'transparent'}
                    color={Theme.colors.textLight}
                />
                    {/* <Icon name='heart' size={24} fill={action ? Theme.colors.rose : 'transparent'} color={action ? Theme.colors.rose : Theme.colors.textLight} /> */}
                </TouchableOpacity>

                {showActionMenu && (
                    <View style={styles.reactionMenu}>
                        {Object.keys(ActionIcons).map(key => (
                            <TouchableOpacity key={key} onPress={() => handleAction(parseInt(key))}>
                                <Icon 
                                    name={ActionIcons[key].name} 
                                    size={28} 
                                    color={Theme.colors.textLight} 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <Text style={styles.count}>
                    {actions?.length}
                </Text>
            </View>

            <View style={styles.footerButton}>
                <TouchableOpacity onPress={() => {nav.navigate('post-details', {
                    postId: post.id, 
                    onCommentCountChange: handleCommentCountChange
                })}}>
                        <Icon name='comment' size={24} color={Theme.colors.textLight} />
                </TouchableOpacity>
                <Text style={styles.count}>
                    {commentsCount}
                </Text>
            </View>

            <View style={styles.footerButton}>
                <TouchableOpacity onPress={onShare}>
                    <Icon name='share' size={24} color={Theme.colors.textLight} />
                </TouchableOpacity>
            </View>
      </View>
    </View>
  )
}

export default PostCard

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginBottom: 15,
        borderRadius: Theme.radius.xxl,
        padding: 10,
        paddingVertical: 12,
        borderCurve: 'continuous',
        borderWidth: 0.5,
        backgroundColor: 'white',
        shadowColor: '#000',
        borderColor: Theme.colors.gray
    }, 
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    username: {
        fontSize: 18,
        color: Theme.colors.textDrak,
        fontWeight: Theme.fonts.medium
    },
    postTime: {
        fontSize: 14,
        color: Theme.colors.textLight,
        fontWeight: Theme.fonts.medium
    },
    content: {
        gap: 10
    },
    postMedia: {
        height: hp(40),
        width: '100%',
        borderRadius: Theme.radius.xl,
        borderCurve: 'continuous'
    },
    postBody: {
        marginLeft: 12,
        marginTop: 10,
        // marginBottom: -30
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginTop: hp(1)
    },
    footerButton: {
        marginLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 18
    },
    count: {
        color: Theme.colors.text,
        fontSize: 16
    },
    tagsStyle: {
        color: Theme.colors.text,
        fontSize: 18,

        p: {
            color: Theme.colors.text,
            fontSize: 18,
        },

        div: {
            color: Theme.colors.text,
            fontSize: 18,
        }
    },
    carouselContainer: {
        overflow: 'hidden',
        // marginTop: hp(3),
        marginBottom: hp(-1)
    },
    carouselMedia: {
        flex: 1,
        alignItems: 'center',
        width: wp(88),
        height: hp(30),
        borderRadius: 10,
    },
    paginationContainer: {
        alignItems: 'center',
        marginTop: 4,
    },
    paginationDots: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    menuContainer: {
        position: 'absolute',
        top: 4,  
        right: 6, 
        zIndex: 2
    },
    menuStyle: {
        backgroundColor: 'white',
        borderRadius: 5,
        elevation: 3,
    },
    reactionMenu: {
        position: 'absolute',
        bottom: 40,
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        alignItems: 'center',
        gap: 10
    }
})