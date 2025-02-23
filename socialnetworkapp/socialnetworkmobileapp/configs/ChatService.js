import { db, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, limit } from "./Firebase";

export const sendMessage = async (senderId, receiverId, content) => {
    try {
        await addDoc(collection(db, "messages"), {
            sender_id: senderId,
            receiver_id: receiverId,
            content: content,
            timestamp: serverTimestamp()
        });
    } catch (ex) {
        console.error(ex);
    }
};

export const listenMessages = (senderId, receiverId, setMessages) => {
    const q = query(
        collection(db, "messages"),
        where("sender_id", "in", [senderId, receiverId]),
        where("receiver_id", "in", [senderId, receiverId]),
        orderBy("timestamp")
    );

    return onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
};

export const listenForChatUpdates = (userId, setChats) => {
    // Lắng nghe tin nhắn gửi đi
    const q = query(
        collection(db, "messages"),
        where("sender_id", "==", userId), 
        orderBy("timestamp", "desc") 
    );

    // Lắng nghe tin nhắn nhận được
    const q2 = query(
        collection(db, "messages"),
        where("receiver_id", "==", userId),  
        orderBy("timestamp", "desc")
    );

    const unsubscribe1 = onSnapshot(q, (snapshot) => {
        handleChatUpdates(snapshot, userId, setChats);
    });

    const unsubscribe2 = onSnapshot(q2, (snapshot) => {
        handleChatUpdates(snapshot, userId, setChats);
    });

    return () => {
        unsubscribe1();
        unsubscribe2();
    };
};

const handleChatUpdates = (snapshot, userId, setChats) => {
    let chatMap = {};

    snapshot.docs.forEach(doc => {
        let msg = doc.data();
        let chatPartnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;

        let timestamp = msg.timestamp && msg.timestamp.toDate ? msg.timestamp.toDate() : new Date();

        if (!chatMap[chatPartnerId] || timestamp > (chatMap[chatPartnerId].timestamp?.toDate?.() || new Date(0))) {
            chatMap[chatPartnerId] = {
                chat_partner_id: chatPartnerId,
                last_message: msg.content,
                timestamp: msg.timestamp || { toDate: () => new Date() }
            };
        }
    });

    setChats(Object.values(chatMap)); 
};
