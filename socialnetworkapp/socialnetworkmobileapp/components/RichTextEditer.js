import { StyleSheet, TextInput, View } from 'react-native';
import React from 'react';
import { Theme } from '../configs/Theme';

const RichTextEditer = ({ editorRef, onChange, body }) => {
    return (
        <View style={styles.container}>
            <TextInput
                ref={editorRef}
                style={styles.input}
                multiline
                placeholder="Hôm nay bạn thế nào?"
                value={body}
                onChangeText={onChange}
            />
        </View>
    );
};

export default RichTextEditer;

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: Theme.colors.gray,
        borderRadius: Theme.radius.xl,
        padding: 10,
        margin: 10,
        minHeight: 150,
    },
    input: {
        fontSize: 16,
        textAlignVertical: 'top', // Để văn bản bắt đầu từ trên cùng
        color: Theme.colors.text,
    },
});
