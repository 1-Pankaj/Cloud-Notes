import AnimatedLottieView from "lottie-react-native";
import React, { useCallback, useEffect } from "react";
import { View } from "react-native";
import Styles from "./Styles";
import { ActivityIndicator, Card, Text } from "react-native-paper";
import { useFonts } from "expo-font";
import * as SQLite from 'expo-sqlite'
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")

const Loading = (prop) => {


    const CheckIfFirstTime = () => {
        db.transaction(tx => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS splash(firstTime Boolean NOT NULL, homepage VARCHAR(10) NOT NULL, archivebtn VARCHAR(10) NOT NULL, deletebtn VARCHAR(10) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT firstTime from splash", [],
                        (sql, rs) => {
                            if (rs.rows.length == 0) {
                                setTimeout(() => {
                                    prop.navigation.replace("SplashScreen")
                                }, 1500)
                            } else {
                                setTimeout(() => {
                                    prop.navigation.replace("Home")
                                }, 1500)
                            }
                        },
                        error => {
                        })
                },
                error => {
                })
        })
    }

    useEffect(() => {
        CheckIfFirstTime()
    }, [])



    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
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
        <SafeAreaView onLayout={onLayoutRootView} style={Styles.container}>
            <View style={[Styles.container, { justifyContent:'space-around' }]} >
                <AnimatedLottieView
                    source={require("../assets/plane.json")}
                    autoPlay hardwareAccelerationAndroid
                    renderMode="HARDWARE"
                    style={{ width: '100%', height: '75%',alignItems:'center' }} />
                <Text style={{ margin: 20, fontSize: 25, fontFamily: 'mulish', fontWeight: '700' }}>
                    CloudNotes
                </Text>
                <Card style={{
                    width: 100, height: 100, borderRadius: 50, alignItems: 'center',
                    justifyContent: 'center', margin: 40
                }}>
                    <ActivityIndicator size={30} />
                </Card>
            </View>
        </SafeAreaView>
    )
}

export default Loading