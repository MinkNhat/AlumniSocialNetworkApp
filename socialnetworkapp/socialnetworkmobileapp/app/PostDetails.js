import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import Input from '../components/Input'
import { getToken, hp, wp } from '../configs/Common'
import { Theme } from '../configs/Theme'
import Icon from '../assets/icons'
import CommentItem from '../components/CommentItem'
import APIs, { authApis, endpoints } from '../configs/APIs'
import Loading from '../components/Loading'
import Constants from 'expo-constants';

const PostDetails = () => {
    const route = useRoute()
    const { postId, onCommentCountChange } = route?.params
    const [comments, setComments] = useState([])
    const [comment, setComment] = useState('')
    const [socket, setSocket] = useState(null)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [updatedCommentId, setUpdatedCommentId] = useState(null)
    const { WEBSOCKET_URL } = Constants.expoConfig.extra

    const loadComments = async () => {
        setLoading(true)
        try {
            if(page > 0) {
                let url = `${endpoints['comments'](postId)}?page=${page}`
                let res = await APIs.get(url)
            
                if(page > 1) {
                    setComments(current => [...current, ...res.data.results])
                } else {
                    setComments(res.data.results)
                }
        
                if (res.data.next === null) {
                    setPage(0)
                    setHasMore(false)
                }
            }
        } catch(ex) {
            console.error(ex)
        } finally {
            setLoading(false)
        }
    }

    const loadMoreComments = () => {
        if(page > 0 && !loading) {
          setPage(page + 1)
        } 
      }

    const onComment = async () => {
        if(comment!=='') {
            const token = await getToken('token')
            if(editingCommentId != null) {
                let res = await authApis(token).patch(endpoints['comment-details'](editingCommentId), {
                    "content": comment
                })

                if (socket) {
                    socket.send(JSON.stringify({
                        "type": "update-comment",
                        "data": res.data
                    }))
                }
            } else {
                let res = await authApis(token).post(endpoints['comments'](postId), {
                    "content": comment
                })

                if (socket) {
                    socket.send(JSON.stringify({
                        "type": "comment",
                        "data": res.data
                    }))
                }
            }
            setComment('')
            
        } else {
            Alert.alert('Đã xảy ra lỗi!', 'Vui lòng viết bình luận trước khi gửi')
        }
    }

    useEffect(() => {
        loadComments()
    }, [page])

    useEffect(() => {
        const ws = new WebSocket(`${WEBSOCKET_URL}${postId}/`)
    
        ws.onmessage = (event) => {
            const newEvent = JSON.parse(event.data)
            if(newEvent.type === "comment")
                setComments(prev => [newEvent.data, ...prev])
                onCommentCountChange(1)

            if(newEvent.type === "update-comment") {
                setComments(prev => prev.map(comment =>
                    comment.id === newEvent.data.id ? { ...comment, content: newEvent.data.content } : comment
                ));

                setEditingCommentId(null)
                setUpdatedCommentId(newEvent.data.id)
            }
        }
    
        ws.onerror = (error) => {
            console.log('WebSocket error:', error)
        }

        setSocket(ws)
    
        return () => {
            ws.close()
        }
    }, [postId])

    const handleUpdateComment = (comment) => {
        setComment(comment.content)
        setEditingCommentId(comment.id)
    }

    const handleDeleteComment = (comment) => {
        setComments(prev => prev.filter(cmt => cmt.id !== comment.id))
        onCommentCountChange(-1)
    }

  return (
    <View style={styles.container}>
        {loading && <Loading/>}
        <FlatList
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => 
                <CommentItem 
                    item={item} 
                    onUpdateComment={handleUpdateComment}
                    updatedCommentId={updatedCommentId}
                    onDeteleComment={handleDeleteComment}
                />}
            onEndReached={loadMoreComments}
            ListFooterComponent={hasMore ? (
                <View style={{magrinVertical: 30}}>
                    <Loading/>
                </View>
                ): <></>}
        />

        {comments?.length === 0 && (
            <View style={styles.textComment}>
                <Text style={{ color: Theme.colors.text, marginLeft: 5, fontSize: 16 }}>
                    Hãy viết bình luận đầu tiên!
                </Text>
            </View>
        )}

        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"} 
            keyboardVerticalOffset={Platform.OS === "ios" ? 75 : 0}
            style={[styles.inputWrapper]}
        >
            <View style={styles.inputContainer}>
                <Input
                    value={comment}
                    onChangeText={value => setComment(value)}
                    placeholder='Viết bình luận...'
                    containerStyles={{
                        flex: 1,
                        height: hp(6.2),
                        borderRadius: Theme.radius.xl,
                    }}
                />

                <TouchableOpacity style={styles.sendIcon} onPress={onComment}>
                    <Icon name='send' color={Theme.colors.primaryDark}/>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    </View>
  )
}

export default PostDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: wp(7),
    },
    list: {
        paddingHorizontal: wp(4),
        paddingBottom: 45
    },
    inputWrapper: {
        position: 'absolute',
        bottom: wp(20),
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: wp(4),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    }, 
    sendIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderColor: Theme.colors.primary,
        borderRadius: Theme.radius.lg,
        borderCurve: 'continuous',
        height: hp(5.8),
        width: hp(5.8),
    }, 
    textComment: {
        position: 'absolute',
        top: hp(5),
        width: '100%',
        alignItems: 'center'
    }
})