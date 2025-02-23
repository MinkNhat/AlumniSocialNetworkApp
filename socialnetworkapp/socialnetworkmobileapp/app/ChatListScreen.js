import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../configs/MyUserContext";
import APIs, { authApis, endpoints } from "../configs/APIs";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import { getFullName, getToken, hp } from "../configs/Common";
import { Theme } from "../configs/Theme";
import { listenForChatUpdates } from "../configs/ChatService";
import Avatar from '../components/Avatar'

const ChatListScreen = () => {
    const navigation = useNavigation()
    const user = useContext(MyUserContext) 
    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(true)

    const loadUserInfo = async (userId) => {
        let res = await APIs.get(endpoints['user-info'](userId))
        return res.data
    }

    useEffect(() => {
        setLoading(true)
    
        const unsubscribe = listenForChatUpdates(user.id, async (newChats) => {
    
            for (let chat of newChats) {
                const userInfo = await loadUserInfo(chat.chat_partner_id)
                if (!chat.chat_partner_name) 
                    chat.chat_partner_name = getFullName(userInfo.first_name, userInfo.last_name)
                if(!chat.chat_partner_avatar)
                    chat.chat_partner_avatar = userInfo.avatar
            }
            setChats(newChats)
            setLoading(false)
        })
    
        return () => {
            unsubscribe()
        }
    }, [])

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        )
    }

    return (
        <ScreenWrapper bg='white'>
            <StatusBar style='dark'/>

            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Tin nhắn</Text>
                </View>

                <FlatList
                    data={chats}
                    extraData={chats} 
                    keyExtractor={(item, index) => `${item.chat_partner_id}-${index}`}
                    contentContainerStyle={styles.listContainer}
                    renderItem={({ item }) => 
                        <TouchableOpacity 
                            style={styles.chatItem}
                            onPress={() => navigation.navigate("chatscreen", { senderId: user.id, receiverId: item.chat_partner_id })}
                        >
                            <Avatar
                                size={hp(7.2)}
                                rounded='50%'
                                uri={item.chat_partner_avatar}
                            />
                            <View>
                                <Text style={styles.chatName}>{item.chat_partner_name}</Text>
                                <Text style={styles.chatMessage}>{item.last_message}</Text>
                            </View>
                        </TouchableOpacity>
                    } 
                />
            </View>
        </ScreenWrapper>
    );
};

export default ChatListScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: Theme.colors.text,
    },
    listContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    chatItem: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        backgroundColor: "#f9f9f9",
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    chatName: {
        fontSize: 18,
        fontWeight: Theme.fonts.medium,
        color: Theme.colors.text,
    },
    chatMessage: {
        fontSize: 16,
        color: Theme.colors.text,
        marginTop: 5,
    },
})
