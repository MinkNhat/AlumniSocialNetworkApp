import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor'
import { Theme } from '../configs/Theme'

const RichTextEditer = ({
    editorRef,
    onChange,
    body
}) => {
  return (
    <View style={{ flex: 1, minHeight: 285 }}>
      <RichToolbar
        editor={editorRef}
        getEditor={() => editorRef.current}
        actions={[
          actions.setStrikethrough,
          actions.removeFormat,
          actions.setBold,
          actions.setItalic,
          actions.insertOrderedList,
          actions.blockquote,
          actions.code,
          actions.heading3
        ]}
        iconMap={{
          [actions.heading3]: ({ tintColor }) => <Text style={{ color: tintColor }}>H3</Text>
        }}
        style={styles.richBar}
        selectedIconTint={Theme.colors.primary}
        disable={false}
      />
      <RichEditor
        ref={editorRef}
        containerStyle={styles.rich}
        editorStyle={styles.contentStyle}
        placeholder="Hôm nay bạn thế nào?"
        onChange={onChange}
        initialContentHTML={body}
      />
    </View>
  )
}

export default RichTextEditer

const styles = StyleSheet.create({
    richBar: {
        borderTopLeftRadius: Theme.radius.xl,
        borderTopRightRadius: Theme.radius.xl,
        backgroundColor: Theme.colors.gray
    },
    rich: {
        minHeight: 240,
        flex: 1,
        borderWidth: 1.5,
        borderTopWidth: 0,
        borderBottomRightRadius: Theme.radius.xl,
        borderBottomLeftRadius: Theme.radius.xl,
        borderColor: Theme.colors.gray,
        padding: 5,
    },
    contentStyle: {
        color: Theme.colors.text,
        placeholderColor: 'gray'
    }
})