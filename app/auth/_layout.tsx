import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const AuthRoot = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
        <Stack screenOptions={{headerShown: false}}>
            <Stack.Screen name="signIn" />
            <Stack.Screen name="signup" />
        </Stack>
    </SafeAreaView>
  )
}


export default AuthRoot

const styles = StyleSheet.create({})