import React, { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { Button, Text } from "react-native-paper";
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
            tx.executeSql("INSERT INTO splash(firstTime, homepage, archivebtn, deletebtn) values ('true','false','false','false')", [],
                (sql, rs) => {
                        props.navigation.replace("Home")
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
                    Save your notes, reminders, TO-DO's, etc. and access them anytime anywhere as you go, with CloudNotes!
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