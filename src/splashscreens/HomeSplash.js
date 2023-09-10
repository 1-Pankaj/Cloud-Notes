import React, { useCallback, useEffect } from "react";
import { BackHandler, Dimensions, Image, View } from "react-native";
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

const HomeSplash = (props) => {


    const [fontsLoaded] = useFonts({
        'mulish': require("../../assets/fonts/mulish.ttf")
    })

    const WriteToSplash = () => {
        db.transaction((tx) => {
            tx.executeSql("UPDATE splash set homepage = 'true' where firstTime = true", [],
                (sql, rs) => {
                    props.navigation.navigate("Home")
                },
                error => {
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
                <Image source={require('../../assets/splashicon.png')}
                    style={{width:screenWidth, height:300}}
                />
                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 22, textAlign: 'center' }}>
                    Looks like it's your first time in CloudNotes!</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                    Start by creating a note or reminder or TO-DO list, or you can choose what you want to do. There's a lot to come with time, enjoy your time being in CloudNotes!
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

export default HomeSplash