import { View } from "react-native";
import { RecordedFiles } from "@/app/components/recordedFiles";

export default function FilesScreen() {
  return (
    <View style={{ flex: 1 }}>
      <RecordedFiles />
    </View>
  );
}
