import React, { useContext, useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView } from "react-native";
import CheckBox from 'react-native-check-box';
import axios from "axios";
import APIs, { endpoints } from "../configs/APIs";
import Avatar from "./Avatar";
import { getFullName, hp } from "../configs/Common";
import { Theme } from "../configs/Theme";
import { MyUserContext } from "../configs/MyUserContext";

const UserSelection = ({ selectedUsers, setSelectedUsers }) => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const user = useContext(MyUserContext)


    const loadUsers = async () => {
        try {
            let res = await APIs.get(endpoints['users'])
            setUsers(res.data)
            setLoading(false)
        } catch(ex) {
            console.error(ex)
        } finally {
            setLoading(false)
        }
        
        
    }

    useEffect(() => {
        loadUsers()

        if (user && !selectedUsers.includes(user.id)) {
            setSelectedUsers((prevSelected) => [...prevSelected, user.id]);
        }
    }, [])

    const toggleUserSelection = (userId) => {
        setSelectedUsers(prevSelected =>
            prevSelected.includes(userId)
                ? prevSelected.filter(id => id !== userId) 
                : [...prevSelected, userId] 
        );
    };

    return (
        <View style={styles.container}>        
            {loading ? <ActivityIndicator size="large" color="#0000ff" /> : (
                
                    <ScrollView style={styles.listContainer}>
                        {users.map((item) => (
                            <TouchableOpacity 
                                key={item.id}
                                style={styles.userItem}
                                onPress={() => toggleUserSelection(item.id)}
                                disabled={item.id === user.id}
                            >
                                <Avatar
                                    style={{marginLeft: 20}}
                                    uri={item.avatar}
                                    size={hp(4)}
                                    rounded={Theme.radius.sm}
                                />
                                <Text style={styles.userText}>{getFullName(item.first_name, item.last_name)}</Text>
                                <CheckBox 
                                    style={{marginRight: 40}}
                                    disabled={item.id === user.id}
                                    isChecked={selectedUsers.includes(item.id)}
                                    onClick={() => toggleUserSelection(item.id)}
                                    checkBoxColor="#000"
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    listContainer: {
        maxHeight: 200, 
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
    },
    userItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    userText: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
});

export default UserSelection;
