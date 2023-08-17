import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import Styles from "./Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedLottieView from "lottie-react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from 'expo-sqlite'

SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")

const SplashScreenPage = (props) => {

    const WriteToSplash = () => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO splash(firstTime) values ('true')", [],
                (sql, rs) => {
                    console.log("Success");
                    props.navigation.replace("Home")
                },
                error => {
                    console.log("Error");
                })
        })
    }

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })



    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null
    }



    return (
        <SafeAreaView style={Styles.container} onLayout={onLayoutRootView}>
            <View style={[Styles.container, { justifyContent: 'space-around' }]}>
                <AnimatedLottieView
                    autoPlay hardwareAccelerationAndroid
                    renderMode="HARDWARE"
                    style={{ width: '100%', }}
                    source={require("../assets/animation.json")} />
                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 25 }}>
                    Let's continue to CloudNotes!
                </Text>
                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                    Browser internet while saving your precious notes and read your notes as you go, anywhere with CloudNotes!
                </Text>
                <Button labelStyle={{ width: '80%', padding: 10 }}
                    mode="contained"
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => { WriteToSplash() }}>
                    <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, color: 'white' }}>
                        Continue
                    </Text>
                </Button>
                <TouchableOpacity>
                    <Text style={{ fontFamily: 'mulish', fontWeight: 'normal', fontSize: 12 }}>
                        Terms & Privacy Policy
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default SplashScreenPage