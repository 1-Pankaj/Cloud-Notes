import React, { useCallback, useState } from "react";
import { Appearance, Dimensions, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../Styles";
import { Button, Text } from "react-native-paper";

import * as SplashScreen from 'expo-splash-screen'

import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import AnimatedLottieView from "lottie-react-native";

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get('window').width

const ReminderSplash = (props) =>{

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    const [fontsLoaded] = useFonts({
        'mulish': require("../../assets/fonts/mulish.ttf")
    })

    Appearance.addChangeListener(()=>{
        setColorScheme(Appearance.getColorScheme())
    })

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null
    }

    const WriteToVoiceNotesSplash = () =>{
        db.transaction((tx)=>{
            tx.executeSql("INSERT INTO remindersplash (firsttime) values (false)",[],
            (sql,rs)=>{
                props.navigation.replace('Reminders')
            }, error =>{

            })
        })
    }


    return(
        <SafeAreaView style={[Styles.container,{justifyContent:'space-around'}]} onLayout={onLayoutRootView}>
            <AnimatedLottieView source={require('../../assets/reminderanim.json')} autoPlay loop
                style={{width:screenWidth}}
            />
            <Text style={{fontSize:22, fontWeight:'bold', textAlign:'center'}}>Get Reminded by Custom Notifications!</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                    Get Reminded about anything with your own custom notification message with CloudNotes.{'\n\n'}Reminders are stored Locally on your device storage and are not stored in cloud, so remember to manage them by yourself!
                </Text>
                <Button labelStyle={{ width: '80%', padding: 10 }}
                    mode="contained"
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => { WriteToVoiceNotesSplash() }}>
                    <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, color: 'white' }}>
                        Continue
                    </Text>
                </Button>
        </SafeAreaView>
    )
}

export default ReminderSplash