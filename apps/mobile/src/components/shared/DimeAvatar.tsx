import { View, Text } from 'react-native'

interface Props {
  size?: number
}

export function DimeAvatar({ size = 40 }: Props) {
  return (
    <View style={{
      width: size, height: size,
      borderRadius: size / 4,
      backgroundColor: '#7C3AED',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <Text style={{ fontSize: size * 0.5 }}>🪙</Text>
    </View>
  )
}
