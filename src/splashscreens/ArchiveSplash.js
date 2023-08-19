import React, { useCallback } from "react";
import { Dimensions, View } from "react-native";
import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../Styles";
import AnimatedLottieView from "lottie-react-native";


SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")
const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const ArchiveSplash = (props) => {


    const [fontsLoaded] = useFonts({
        'mulish': require("../../assets/fonts/mulish.ttf")
    })

    const WriteToSplash = () => {
        db.transaction((tx) => {
            tx.executeSql("UPDATE splash set archivebtn = 'true' where firstTime = true", [],
                (sql, rs) => {
                    props.navigation.navigate("Home")
                },
                error => {
                    console.log("Error");
                })
        })
    }

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
                    source={require('../../assets/archivesplash.json')}
                    loop autoPlay
                    style={{ width: screenWidth, height: 300 }}/>
                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 22, textAlign: 'center' }}>
                    Your Archived messages are safe in Directory!</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                    Notes you archive are stored safely in your Directory of CloudNotes, simply Press top left back button on home page to open your Directory.{'\n\n'}
                    Protect your Notes with password on your archive directory for better protection!
                </Text>
                <Button labelStyle={{ width: '80%', padding: 10 }}
                    mode="contained"
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => { WriteToSplash() }}>
                    <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, color: 'white' }}>
                        Continue
                    </Text>
                </Button>
                
            </View>
        </SafeAreaView>
    )
}

export default ArchiveSplash