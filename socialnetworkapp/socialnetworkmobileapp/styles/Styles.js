import { StyleSheet } from "react-native";
import { wp } from "../configs/Common";
import { Theme } from "../configs/Theme";

export default StyleSheet.create({
    container: {
        flex: 1,
        gap: 30,
        paddingHorizontal: wp(5)
    },
    subject: {
        color: "red",
        fontSize: 20,
        fontWeight: "bold" 
    },
    footerText: {
        textAlign: 'center',
        color: Theme.colors.text,
        fontSize: 16
    }, 
    errorMessage: {
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'red',
        borderRadius: Theme.radius.xs,
        backgroundColor: '#ffe6e6',
        color: 'red',
        paddingVertical: 14,
    }
});