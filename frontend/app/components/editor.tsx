import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export function Editor() {
  // dark/light mode support
  const { colors } = useTheme();

  // state for the text and font size
  const [text, setText] = useState(""); // note text
  const [fontSize, setFontSize] = useState(16); // font size

  // font size functions
  const increaseFontSize = () => setFontSize((prev) => prev + 2);
  const decreaseFontSize = () => setFontSize((prev) => Math.max(12, prev - 2));

  return (
    <View style={styles.container}>
      {/* toolbar for the editor */}
      <View style={styles.toolbar}>
        {/* decrease font size button */}
        <TouchableOpacity
          onPress={decreaseFontSize}
          style={styles.toolbarButton}
        >
          <Ionicons name="remove" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* increase font size button */}
        <TouchableOpacity
          onPress={increaseFontSize}
          style={styles.toolbarButton}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* main text editor */}
      <TextInput
        style={[
          styles.editor,
          {
            color: colors.text,
            backgroundColor: colors.card,
            fontSize: fontSize,
          },
        ]}
        multiline // allow multiple lines
        value={text}
        onChangeText={setText}
        placeholder="Start typing your notes..."
        placeholderTextColor={colors.text + "80"}
      />
    </View>
  );
}

// styles for the editor
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  toolbar: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.05)", // background color for the toolbar
    borderRadius: 8,
    marginBottom: 16,
  },
  toolbarButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  editor: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    textAlignVertical: "top", // align text to the top
  },
});
