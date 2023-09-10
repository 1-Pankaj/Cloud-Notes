import React, { useEffect } from "react";

import * as SQLite from 'expo-sqlite'
import { SafeAreaView } from "react-native-safe-area-context";
import { BackHandler, Dimensions, Image, View } from "react-native";
import Styles from "../Styles";
import { Button, Text } from "react-native-paper";

const db = SQLite.openDatabase('CloudNotes.db')

const screenWidth = Dimensions.get('window').width

const MoodifySplash = (props) => {

    const WriteToSplash = () =>{
        db.transaction((tx)=>{
            tx.executeSql("INSERT INTO moodifysplash (firsttime) values (false)",[],
            (sql,rs)=>{
                props.navigation.replace('Moodify')
            }, error =>{
            })
        })
    }

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
    return (
        <SafeAreaView style={Styles.container}>
            <View style={[Styles.container, { justifyContent: 'space-around' }]}>
                <Image source={require('../../assets/moodifysplash.png')} style={{ width: screenWidth - 100, height: 250 }} />
                <Text style={{ fontWeight: 'bold', fontSize: 22, textAlign: 'center' }}>
                    Enhance your CloudNotes experience with customized mood based filters!</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                    Get Personalized experience according to your mood data provided by you. Manage, Alter, Track your mood data anytime.{'\n\n'}Create new mood filters, change accordingly or make a time limited theme for CloudNotes with Moodify.
                </Text>
                <Button labelStyle={{ width: '80%', padding: 10 }}
                    mode="contained"
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => { WriteToSplash() }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 17, color: 'white' }}>
                        Continue
                    </Text>
                </Button>

            </View>
        </SafeAreaView>
    )
}

export default MoodifySplash