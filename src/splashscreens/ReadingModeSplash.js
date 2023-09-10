import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import * as SQLite from 'expo-sqlite'
import Styles from "../Styles";
import AnimatedLottieView from "lottie-react-native";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen'

const db = SQLite.openDatabase('CloudNotes.db')
const ReadingModeSplash = (props) => {


    const [noteid,setNoteId] = useState('')

    const [fontsLoaded] = useFonts({
        'mulish': require("../../assets/fonts/mulish.ttf")
    })
    function handleBackButtonClick() {
        props.navigation.goBack()
        return true
    }

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [])

    useEffect(()=>{
        if (props.route.params === undefined) {

        } else {
            setNoteId(props.route.params.noteid)
        }
    }, [])

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null
    }

    const WriteToSplash = () =>{
        db.transaction((tx)=>{
            tx.executeSql("INSERT INTO readingsplash (firsttime) values (false)",[],
            (sql,rs)=>{
                props.navigation.replace('ReadingMode', {
                    noteid: noteid
                })
            }, error =>{
            })
        })
    }

    
    return (
        <SafeAreaView style={[Styles.container, { justifyContent: 'space-around' }]} onLayout={onLayoutRootView}>
            <AnimatedLottieView
                source={require('../../assets/readingsplash.json')}
                style={{ width: '80%' }} autoPlay loop />
                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 22, textAlign: 'center', marginHorizontal:10 }}>
                    Read your long notes in CloudNotes Reading Mode!</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                    Reduce strain and read long notes in Reading Mode of CloudNotes. Customize how you want to read, change font size or style anytime for better reading experience!
                </Text>
                <Button labelStyle={{ width: '80%', padding: 10 }}
                    mode="contained"
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => { WriteToSplash() }}>
                    <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, color: 'white' }}>
                        Continue
                    </Text>
                </Button>
        </SafeAreaView>
    )
}

export default ReadingModeSplash