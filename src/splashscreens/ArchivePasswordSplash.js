import React, { useCallback, useState } from "react";
import { Appearance, Dimensions, View } from "react-native";
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

const ArchivePasswordSplash = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    Appearance.addChangeListener(()=>{
        setColorScheme(Appearance.getColorScheme())
    })
    const [fontsLoaded] = useFonts({
        'mulish': require("../../assets/fonts/mulish.ttf")
    })

    const Archivepass = () => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO archivepass (firsttime, password) values ('false', '')", [],
                (sql, rs) => {
                    props.navigation.replace("PasswordPage")
                },
                error => {
                })
        })
    }

    const SkipArchivePass = () => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO archivepass (firsttime, password) values ('false', '')", [],
                (sql, rs) => {
                    props.navigation.replace("ArchivePage")
                },
                error => {
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
                    source={require('../../assets/archivepassword.json')}
                    loop autoPlay
                    style={{ width: screenWidth, height: 200 }} />
                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 22, textAlign: 'center' }}>
                    Safeguard you Archived Notes with password!</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                    Secure your notes with 4 digit numerical password for better protection of your notes!{'\n\n'}
                    Remember you can change your archive password anytime from archives page, but incase you forget your current password you need to sign in with your CloudNotes
                    account for your archive password recovery.
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width:screenWidth }}>
                    <Button labelStyle={{ width:120,padding: 10 }}
                        mode="contained"
                        style={{ justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => {Archivepass() }}>
                        <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 14, color: 'white' }}>
                            Set Password
                        </Text>
                    </Button>
                    <Button labelStyle={{ width:120,padding: 10 }}
                        mode="outlined"
                        style={{ justifyContent: 'center', alignItems: 'center' }}
                        onPress={() => { SkipArchivePass()}}>
                        <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 14, color: colorScheme === 'dark'? 'white' :'black' }}>
                            Skip
                        </Text>
                    </Button>
                </View>


            </View>
        </SafeAreaView>
    )
}

export default ArchivePasswordSplash