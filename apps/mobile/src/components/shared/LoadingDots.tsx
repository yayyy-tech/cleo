import { View } from 'react-native'
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withDelay
} from 'react-native-reanimated'
import { useEffect } from 'react'

function Dot({ delay }: { delay: number }) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 500 }), -1, true)
    )
  }, [])

  const style = useAnimatedStyle(() => ({
    opacity: 0.3 + progress.value * 0.7,
    transform: [{ translateY: -progress.value * 4 }]
  }))

  return (
    <Animated.View style={[{
      width: 8, height: 8,
      borderRadius: 4,
      backgroundColor: '#A78BFA'
    }, style]} />
  )
}

export function LoadingDots() {
  return (
    <View style={{ flexDirection: 'row', gap: 4, padding: 8 }}>
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  )
}
