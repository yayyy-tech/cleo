import { View, Text } from "react-native";

export default function AccountSettings() {
  // TODO: Manage connected bank accounts
  return (
    <View style={{ flex: 1, backgroundColor: "#0A0E27", justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FFFFFF" }}>Connected Accounts</Text>
    </View>
  );
}
