import React, { useCallback, useState } from "react";
import { Appearance, Dimensions, Image, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../Styles";
import { Button, Text } from "react-native-paper";

import * as SplashScreen from 'expo-splash-screen'

import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get('window').width

const VoiceNotesSplash = (props) =>{

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
            tx.executeSql("INSERT INTO voicenotesplash (firsttime) values (false)",[],
            (sql,rs)=>{
                props.navigation.replace('VoiceNotes')
            }, error =>{

            })
        })
    }


    return(
        <SafeAreaView style={[Styles.container,{justifyContent:'space-around'}]} onLayout={onLayoutRootView}>
            <Image source={require('../../assets/recording.png')} style={{width:200, height:200, marginTop:20}}/>
            <Text style={{fontSize:22, fontWeight:'bold', textAlign:'center'}}>Store your voice notes with ease!</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                    Effeciently record, store and manage your voice notes with CloudNotes. Voice notes you store in CloudNotes are stored locally and does not sync with your Cloud Storage.{'\n\n'}
                    Protect your Voice Notes with password using fingerprint or device lock for better privacy protection!
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

export default VoiceNotesSplash