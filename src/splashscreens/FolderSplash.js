import React from "react";

import * as SQLite from 'expo-sqlite'
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../Styles";
import { Button, Text } from "react-native-paper";
import AnimatedLottieView from "lottie-react-native";
import { Dimensions } from "react-native";


const db = SQLite.openDatabase('CloudNotes.db')

const screenWidth = Dimensions.get('window').width

const FolderSplash = (props) => {

    const WriteToSplash = () => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO foldersplash (firsttime) values (false)", [],
                (sql, rs) => {
                    props.navigation.replace('Folder')
                }, error => {
                    console.log("Error");
                })
        })
    }


    return (
        <SafeAreaView style={[Styles.container, { justifyContent: 'space-around' }]}>
            <AnimatedLottieView
                source={require('../../assets/folderanim.json')}
                autoPlay loop style={{ width: screenWidth, }}
            />
            <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 22, textAlign: 'center' }}>
                Create, Edit, and Manage custom Folders with CloudNotes Folders</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                With CloudNotes Folders, you can create a new folder to store your notes anytime. Create a folder and name it anything. Change name anytime or transfer notes from one folder to another.
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

export default FolderSplash