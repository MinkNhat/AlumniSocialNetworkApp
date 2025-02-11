import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MyUserContext } from "../configs/MyUserContext";
import { authApis, endpoints } from "../configs/APIs";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import { getToken } from "../configs/Common";

const ChatListScreen = () => {
    const navigation = useNavigation(); 
    const user = useContext(MyUserContext); 
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                let token = await getToken("token"); 
                let res = await authApis(token).get(endpoints['messages_list']);
                
    
                if (!Array.isArray(res.data) || res.data.length === 0) {
                    console.warn("Không có cuộc trò chuyện nào.");
                    return;
                }
    
                const chatMap = {};
                res.data.forEach(msg => {
                    const chatId = [msg.sender_id, msg.receiver_id].sort().join("-");
                    if (!chatMap[chatId] || new Date(msg.timestamp) > new Date(chatMap[chatId].timestamp)) {
                        chatMap[chatId] = msg; // Chỉ lưu tin nhắn mới nhất của mỗi cuộc trò chuyện
                    }
                });
    
                const newChats = Object.values(chatMap);
                setChats(newChats); 
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đoạn chat:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                let token = await getToken("token"); 
                let res = await authApis(token).get(endpoints['messages_list']);
                console.info("Dữ liệu từ API:", res.data);
    
                if (!Array.isArray(res.data) || res.data.length === 0) {
                    console.warn("Không có cuộc trò chuyện nào.");
                    setChats([]);
                    return;
                }
    
                setChats(res.data); 
                console.info("Danh sách chat được cập nhật:", res.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đoạn chat:", error);
            }
        };
        fetchChats();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <ScreenWrapper bg='white'>
            <StatusBar style='dark' />
            <View>
            <FlatList
                data={chats}
                extraData={chats} 
                keyExtractor={(item, index) => `${item.chat_partner_id}-${index}`}
                renderItem={({ item }) => {
                    console.info("Render item:", item); 
                    return (
                        <TouchableOpacity onPress={() => navigation.navigate("chatscreen", { senderId: user.id, receiverId: item.chat_partner_id })}>
                            <Text>Người chat: {item.chat_partner_id}</Text>
                            <Text>Tin nhắn mới nhất: {item.last_message}</Text>
                        </TouchableOpacity>
                    ); 
                }} 
            />

            </View>
        </ScreenWrapper>
    );
};

export default ChatListScreen;
