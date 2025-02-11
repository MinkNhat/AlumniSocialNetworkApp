import { Alert, Dimensions, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { Theme } from '../configs/Theme';
import { MyUserContext } from '../configs/MyUserContext';
import Avatar from '../components/Avatar';
import { getFullName, getToken, hp, wp } from '../configs/Common';
import Input from '../components/Input';
import RichTextEditer from '../components/RichTextEditer';
import Icon from '../assets/icons';

import * as ImagePicker from 'expo-image-picker';
import Carousel from 'react-native-reanimated-carousel';
import AnimatedPaginationDot from 'react-native-animated-pagination-dot';
import Button from '../components/Button';
import Loading from '../components/Loading';
import { Video } from 'expo-av';
import { authApis, endpoints } from '../configs/APIs';
import { useNavigation, useRoute } from '@react-navigation/native';

import * as ImageManipulator from 'expo-image-manipulator';

const CreateNewPost = () => {
    const user = useContext(MyUserContext)
    const editorRef = useRef(null)
    const [body, setBody] = useState("")
    const [loading, setLoading] = useState(false)
    const [files, setFiles] = useState([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const nav = useNavigation()
    const route = useRoute()

    const { 
        isUpdate = false,
        title = "Đăng bài viết mới", 
        buttonText = "Đăng bài",
        post = {},
        media = []
    } = route?.params || {}

    useEffect(() => {
        if (post?.caption) {
            setBody(post.caption);
        }

        if(media.length > 0) {
            setFiles(media)
            console.info(files)
        }
    }, [post.caption]);

    const onPick = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Permission denied!') 
            return;
        } else {
            let mediaConfig = {
                allowsMultipleSelection: true,
                mediaTypes: ['images', 'videos'],
                allowEditting: true,
                aspest: [4, 3],
                quanlity: 1,
            }

            const result = await ImagePicker.launchImageLibraryAsync(mediaConfig)

            if (!result.canceled) {
                setFiles(result.assets)
            }
        }   
    }

    const renderItem = ({ item }) => {
        let type = isUpdate ? item.media_type : item.type       
        let src = isUpdate ? item.file : item.uri
     
        if (type.startsWith('image')) {
            return (
                <Image
                    source={{ uri: src }}
                    style={styles.carouselMedia}
                    resizeMode="cover"
                />
            );
        } else if (type.startsWith('video')) {
            return (
                <Video
                    source={{ uri: src }}
                    style={styles.carouselMedia} 
                    resizeMode="contain"
                    useNativeControls 
                />
            );
        }
        return null;
    }

    const processFile = async (file) => {
        if (file.type.startsWith('image')) {
            try {
                const manipResult = await ImageManipulator.manipulateAsync(
                    file.uri,
                    [{ resize: { width: 800 } }], // Resize ảnh về chiều rộng 800px
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                return manipResult.uri;
            } catch (err) {
                console.error(err);
                return file.uri;
            }
        } 
        return file.uri;
    };

    const onSubmit = async () => {
        // console.info(files)
        if(!body && files.length<=0) {
            Alert.alert('Có lỗi xảy ra!', 'Vui lòng viết nội dung hoặc chọn hình ảnh')
            return
        }

        setLoading(true)
        try {
            const token = await getToken('token')
            if(!isUpdate) {
                let res = await authApis(token).post(endpoints['posts'], {
                    'caption': body
                })
        
                let processedFiles = await Promise.all(files.map(f => processFile(f)));

                // Upload tất cả file đồng thời
                await Promise.all(processedFiles.map(async (uri, index) => {
                    let form = new FormData();
                    form.append('file', {
                        uri: uri,
                        name: files[index].fileName,
                        type: files[index].type
                    });

                    try {
                        await authApis(token).post(endpoints['media'](res.data.id), form, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        });
                    } catch (ex) {
                        console.error("Lỗi khi upload:", ex);
                    }
                }));
            } else {
                await authApis(token).patch(endpoints['post-details'](post.id), {
                    'caption': body
                })
            }


            nav.navigate('home')

            
        } catch(ex) {
            console.error(ex)
        } finally {
            setLoading(false)
        }
    }
   
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        
      <View style={{height: '100%'}}>
        <BackButton title={title} style={{color: Theme.colors.text}}/>
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Avatar  
                    uri={user.avatar}
                    size={hp(7)}
                    rounded={Theme.radius.sm}
                />
                <View>
                    <Text style={styles.username}>    
                        {getFullName(user.first_name, user.last_name)}
                    </Text>
                    <Text style={styles.accessModifier}>public</Text>
                </View>
            </View>

            <View style={styles.textEditor}>
                <RichTextEditer 
                    editorRef={editorRef}
                    // onChange={body => bodyRef.current = body}
                    onChange={setBody} 
                    body={body}
                /> 
            </View>

            {files.length > 0 && (
                <View style={styles.carouselContainer}>
                    <Carousel
                        data={files}
                        renderItem={renderItem}
                        width={wp(100)} 
                        height={hp(30)}
                        // autoPlay={true}
                        loop={false}
                        mode="parallax"
                        onSnapToItem={(index) => setCurrentIndex(index)}
                        modeConfig={{
                            parallaxScrollingScale: 0.9,
                            parallaxScrollingOffset: 80, 
                            // parallaxAdjacentItemScale: 0.9
                        }}
                    />

                    {files.length > 1 && (
                        <View style={styles.paginationContainer}>
                            <AnimatedPaginationDot
                                activeDotColor={Theme.colors.primary} 
                                curPage={currentIndex}
                                maxPage={files.length} 
                                containerStyle={styles.paginationDots}
                                animatedDuration={100} 
                            />
                        </View>)
                    }

                    {!isUpdate && (
                        <TouchableOpacity style={styles.closeIcons} onPress={() => setFiles([
                            ...files.slice(0, currentIndex),
                            ...files.slice(currentIndex + 1)
                        ])}>
                            <Icon name={'delete'} size={22} color={'white'}/>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {isUpdate === false ? (
                <View style={styles.media}>
                    <Text>Thêm hình ảnh vào bài viết</Text>
                    <View style={styles.mediaIcons}>
                        <TouchableOpacity onPress={() => onPick()}>
                            <Icon name={'image'} size={30} color={Theme.colors.dark}/>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : <View style={{marginTop: hp(2)}}></View>}

            <Button
                buttonStyle={styles.buttonSubmit}
                title={buttonText}
                loading={loading}
                hasShadow={false}
                onPress={onSubmit}
            />
        </ScrollView>
      </View>

      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

export default CreateNewPost

const styles = StyleSheet.create({
    container: {
        marginTop: hp(4),
        paddingHorizontal: wp(4),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    }, 
    username: {
        fontWeight: Theme.fonts.semiBold,
        fontSize: 24,
        color: Theme.colors.text,
        marginBottom: 4
    },
    accessModifier: {
        fontWeight: Theme.fonts.extraLight,
        fontSize: 18,
        color: Theme.colors.text,
    }, 
    textEditor: {
        marginTop: hp(3),
    }, 
    media: {
        marginTop: hp(2),
        marginBottom: hp(6),
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
    mediaIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    file: {
        height: hp(30),
        width: '100%',
        overflow: 'hidden',
        borderRadius: Theme.radius.xl,
        borderCurve: 'continuous'
    },
    carouselContainer: {
        marginTop: hp(3),
        marginBottom: hp(1)
    },
    carouselMedia: {
        flex: 1,
        alignItems: 'center',
        width: wp(92),
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
    closeIcons: {
        position: 'absolute',
        padding: 7,
        top: 24,
        right: 30,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 0, 0, 0.6)'
    }, 
    buttonSubmit: {
        height: hp(6),
        marginHorizontal: wp(4),
        marginBottom: hp(2)
    }
})