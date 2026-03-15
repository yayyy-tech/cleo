import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import '../global.css'
import { supabase } from '../src/lib/supabase'
import { useStore } from '../src/store/useStore'
import { useRouter, useSegments } from 'expo-router'

export default function RootLayout() {
  const { setAuthenticated, isAuthenticated } = useStore()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthenticated(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthenticated(!!session)
        if (!session) {
          router.replace('/(auth)/splash')
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // Auth guard
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/splash')
    }
  }, [isAuthenticated, segments])

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0A0E1A' }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#0A0E1A" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0E1A' } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="settings" />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
