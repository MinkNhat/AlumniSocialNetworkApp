import { db, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "./Firebase";

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
