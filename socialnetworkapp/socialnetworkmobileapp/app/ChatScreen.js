import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { sendMessage, listenMessages } from "../configs/ChatService";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from '../components/BackButton';
import { Theme } from "../configs/Theme";
import Icon from "../assets/icons";
import { hp, wp } from "../configs/Common";
import Input from "../components/Input";

const ChatScreen = ({ route }) => {
    const { senderId, receiverId } = route.params;
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {
        const unsubscribe = listenMessages(senderId, receiverId, setMessages);
        return () => unsubscribe();
    }, [])

    const handleSend = () => {
        if (text.trim() === "") return;
        sendMessage(senderId, receiverId, text);
        setText("");
    }

    return (
        <ScreenWrapper bg='white'>
            <StatusBar style='dark'/>
            <BackButton style={{color: Theme.colors.text}} title='Đoạn chat'/>

            <View style={styles.container}>
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <View style={[styles.messageBubble, item.sender_id === senderId ? styles.rightBubble : styles.leftBubble]}>
                            <Text>{item.content}</Text>
                        </View>
                    )}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"} 
                    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
                    style={[styles.inputWrapper]}
                >
                    <View style={styles.inputContainer}>
                        <Input
                            value={text}
                            onChangeText={setText}
                            placeholder='Nhập tin nhắn...'
                            containerStyles={{
                                flex: 1,
                                height: hp(6.2),
                                borderRadius: Theme.radius.xl,
                            }}
                        />

                        <TouchableOpacity style={styles.sendIcon} onPress={handleSend}>
                            <Icon name='send' color={Theme.colors.primaryDark}/>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        // padding: 10, 
        paddingHorizontal: 10,
        paddingBottom: wp(15),
    },
    messageBubble: { 
        padding: 10, 
        marginVertical: 5, 
        borderRadius: 10 
    },
    rightBubble: { 
        alignSelf: "flex-end", 
        backgroundColor: "#DCF8C6"
    },
    leftBubble: { 
        alignSelf: "flex-start", 
        backgroundColor: "#ECECEC" 
    },
    sendIcon: {
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.8,
        borderColor: Theme.colors.primary,
        borderRadius: Theme.radius.lg,
        borderCurve: 'continuous',
        height: hp(5.8),
        width: hp(5.8),
    }, 
    inputWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        paddingHorizontal: wp(4),
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    }, 
})

export default ChatScreen;
