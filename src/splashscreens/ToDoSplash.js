import React, { useEffect } from "react";

import * as SQLite from 'expo-sqlite'
import { BackHandler, Dimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../Styles";
import { Button, Text } from "react-native-paper";
import AnimatedLottieView from "lottie-react-native";

const screenWidth = Dimensions.get('window').width

const db = SQLite.openDatabase('CloudNotes.db')

const ToDoSplash = (props) => {

    const WriteToSplash = () => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO todosplash values ('true')", [],
                (sql, rs) => {
                    props.navigation.replace('ToDo')
                }, error => {
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
        <SafeAreaView style={[Styles.container, { justifyContent: 'space-around' }]}>
            <AnimatedLottieView
                source={require('../../assets/todosplashanim.json')}
                autoPlay loop autoSize
                style={{ width: screenWidth }} renderMode="HARDWARE" />
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Efficiently create To-Do Lists!</Text>
            <Text variant="bodyMedium" style={{ textAlign: 'center' }}>With CloudNotes create and maintain To-Do lists efficiently. Create, Read, Update, or Delete your ToDo's anytime as you go!</Text>
            <Button labelStyle={{ width: '80%', padding: 10 }}
                mode="contained"
                style={{ justifyContent: 'center', alignItems: 'center' }}
                onPress={() => { WriteToSplash() }}>
                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, color: 'white' }}>
                    Continue to ToDo
                </Text>
            </Button>
        </SafeAreaView>
    )
}

export default ToDoSplash