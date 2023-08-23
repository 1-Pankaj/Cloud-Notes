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

const StarredNotesSplash = (props) =>{

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
            tx.executeSql("INSERT INTO starredsplash (firsttime) values (false)",[],
            (sql,rs)=>{
                props.navigation.replace('StarredNotes')
            }, error =>{

            })
        })
    }


    return(
        <SafeAreaView style={[Styles.container,{justifyContent:'space-around'}]} onLayout={onLayoutRootView}>
            <AnimatedLottieView source={require('../../assets/starrednotesplash.json')} autoPlay loop
                style={{width:screenWidth,height:250}}
            />
            <Text style={{fontSize:22, fontWeight:'bold', textAlign:'center'}}>Your favourite notes, in one place!</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                    Star the notes you like and find them in Starred Notes section of CloudNotes later on.{'\n\n'}You can find starred notes in Directory section of Cloud Notes too. Starred notes are also synced with your Cloud Storage if you are logged in!
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

export default StarredNotesSplash