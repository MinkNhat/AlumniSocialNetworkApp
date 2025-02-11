import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { sendMessage, listenMessages } from "../configs/ChatService";

const ChatScreen = ({ route }) => {
    const { senderId, receiverId } = route.params;
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {
        const unsubscribe = listenMessages(senderId, receiverId, setMessages);
        return () => unsubscribe();
    }, []);

    const handleSend = () => {
        if (text.trim() === "") return;
        sendMessage(senderId, receiverId, text);
        setText("");
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={[styles.messageBubble, item.sender_id === senderId ? styles.rightBubble : styles.leftBubble]}>
                        <Text>{item.content}</Text>
                    </View>
                )}
            />
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Nhập tin nhắn..." />
                <TouchableOpacity onPress={handleSend}>
                    <Text style={styles.sendButton}>Gửi</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10 },
    messageBubble: { padding: 10, marginVertical: 5, borderRadius: 10 },
    rightBubble: { alignSelf: "flex-end", backgroundColor: "#DCF8C6" },
    leftBubble: { alignSelf: "flex-start", backgroundColor: "#ECECEC" },
    inputContainer: { flexDirection: "row", alignItems: "center", padding: 10 },
    input: { flex: 1, borderWidth: 1, padding: 10, borderRadius: 5 },
    sendButton: { padding: 10, color: "blue" },
});

export default ChatScreen;
