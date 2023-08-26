import React, { useCallback, useState } from "react";
import { Appearance, Dimensions, Image, ToastAndroid, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Button, Text } from "react-native-paper";

import * as SplashScreen from 'expo-splash-screen'
import storage from '@react-native-firebase/storage'

import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Audio } from "expo-av";

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get('window').width
const VoiceNotes = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [recording, setRecording] = useState()
    const [recordings, setRecordings] = useState([])
    const [message, setMessage] = useState('')

    async function StartRecording(){
        try{
            const permission = await Audio.requestPermissionsAsync();

            if(permission.status === 'granted'){
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS:true,
                    playThroughEarpieceAndroid:true,
                    playsInSilentModeIOS:true
                })

                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                )
                setRecording(recording)
            }else{
                ToastAndroid.show('Permission to record Audio note granted!', ToastAndroid.SHORT)
            }
        }catch(error){
            console.log(error);
        }
    }

    async function StopRecording(){
        setRecording(undefined)
        await recording.stopAndUnloadAsync()

        let updatedRecordings = [...recordings]
        const {sound , status} = await recording.createNewLoadedSoundAsync();
        updatedRecordings.push({
            sound:sound,
            duration: getDurationFormatted(status.durationMillis),
            file : recording.getURI()
        })

        setRecordings(updatedRecordings)
        // const refrence = storage().ref('voice-notes')
        // refrence.putFile(recording.getURI()).then((snapshot)=>{
        //     console.log(snapshot.ref.getDownloadURL());
        // })
    }

    const getDurationFormatted = (millis) => {
        const minutes = millis / 1000 / 60
        const minutesDisplay = Math.floor(minutes)
        const seconds = Math.round((minutes - minutesDisplay) * 60)
        const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds
        return `${minutesDisplay}:${secondsDisplay}`
    }

    function getRecordingLines(){
        
        return recordings.map((recordingLines, index)=>{
            return(
                <View key={index}>
                    <Text>Recording {index + 1} - {recordingLines.duration}</Text>
                    <Button onPress={()=>{console.log(recordingLines.file)}}>Play</Button>
                </View>
            )
        })
    }

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })

    Appearance.addChangeListener(() => {
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

    return (
        <SafeAreaView style={Styles.container}>
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ margin: 20 }} onPress={() => { props.navigation.navigate('Home') }}>
                    <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01" />
                </TouchableOpacity>
                
                <TouchableOpacity style={{ margin: 20 }} onPress={() => { }}>
                    <MaterialCommIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                </TouchableOpacity>
            </View>
            <Button onPress={()=>{recording? 
            StopRecording()
            :
            StartRecording()}}>
                {recording? 'Stop Recording' : 'Start Recording'}
            </Button>
            {getRecordingLines()}

        </SafeAreaView>
    )
}

export default VoiceNotes