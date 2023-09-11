import React, { useEffect, useState } from "react";

import * as SQLite from 'expo-sqlite'

import Voice from '@react-native-voice/voice'
import { Appearance, Dimensions, ScrollView, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { Card, Text } from "react-native-paper";
import { Fader, FaderPosition } from "react-native-ui-lib";

const screenWidth = Dimensions.get('window').width

const VoiceSearch = (props) => {

    const [recording, setRecording] = useState(false)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [result, setResult] = useState('')
    Voice.onSpeechStart = () => setRecording(true)
    Voice.onSpeechEnd = () => setRecording(false)
    Voice.onSpeechError = () => setRecording(false)
    Voice.onSpeechResults = (res) => {
        res.value.map((res, index) => {
            setResult(res)
            if (res.includes('new note') || res.includes('notes') || res.includes('Note') || res.includes('open notes') || res.includes('Notes') || res.includes('note')) {
                props.navigation.navigate('CreateNote')
            }else if(res.includes('exit') || res.includes("Exit") || res.includes('go back') || res.includes('home') || res.includes('homepage')){
                props.navigation.navigate('Home')
            }
        })
    }

    const StartRecording = async () => {
        try {
            await Voice.start('en-US')
        } catch (err) {
            setRecording(false)
        }
    }
    useEffect(() => {
        setRecording(false)
        Voice.stop().then(() => {
            Voice.destroy()
        })
    }, [])

    const StopRecording = async () => {
        try {
            await Voice.stop()
        } catch (err) {
            setRecording(false)
        }
    }

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    return (
        <SafeAreaView style={Styles.container}>
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ margin: 20 }} activeOpacity={0.6}
                    onPress={() => {
                        props.navigation.goBack()
                    }}>
                    <MaterialIcons name="close" size={30} color="#FFBC01" />
                </TouchableOpacity>

                <TouchableOpacity style={{ margin: 20 }} activeOpacity={0.6}
                    onPress={() => {
                    }}>
                    <MaterialCommIcons name="cog-outline" size={27} color="#FFBC01" />
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, width: screenWidth }} contentContainerStyle={{ marginBottom: 100 }}>
                <Text style={{ fontSize: 30, fontWeight: 'bold', alignSelf: 'flex-start', textAlign: 'left', paddingStart: 30, paddingEnd: 20, marginTop: 100, marginBottom:200}}>
                    {result?result.trim() : 'Try saying something...'}
                </Text>
            </ScrollView>
            <Fader position={FaderPosition.BOTTOM} size={600} tintColor={colorScheme === 'dark' ? '#1c1c1c' : '#f4f4f4'} />
            <View style={{ flexDirection: 'row', width: screenWidth, justifyContent: 'space-around', marginVertical: 20 }}>
                <TouchableHighlight style={{ width: 150, height: 150, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 100, alignItems: 'center', justifyContent: 'center', elevation: 5 }}
                    onPress={() => {
                        recording ? StopRecording() : StartRecording()
                    }} underlayColor={colorScheme === 'dark' ? '#303030' : '#dedede'}>

                    {recording ?
                        <Card style={{ width: 150, height: 150, borderRadius: 100, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'red' }} elevation={5}>
                            <MaterialIcons name="keyboard-voice" size={50} color="red" />
                        </Card>
                        :

                        <MaterialIcons name="keyboard-voice" size={50} color="#FFBC01" />
                    }
                </TouchableHighlight>
            </View>
        </SafeAreaView>
    )
}

export default VoiceSearch