import React, { useCallback, useEffect, useState } from "react";
import { Appearance, Dimensions, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import { Card, Divider, Text } from "react-native-paper";

import Ionicons from '@expo/vector-icons/Ionicons'

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from 'expo-splash-screen'
import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import { useIsFocused } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height


const Directory = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [allNotesCount, setAllNotesCount] = useState(0)
    const [archivedNoteCount, setArchivedNoteCount] = useState(0)


    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })

    const isFocused = useIsFocused()
    const GetCount = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT id from notes", [],
                (sql, rs) => {
                    setAllNotesCount(rs.rows.length)
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT id from archived", [],
                (sql, rs) => {
                    setArchivedNoteCount(rs.rows.length)
                }, error => {
                    console.log("Error");
                })
        })
    }

    useEffect(() => {
        GetCount()
    }, [isFocused])


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
            <View style={[Styles.container, { padding: 8 }]}>
                <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ margin: 20, fontWeight: 'bold', fontSize: 27, color: '#FFBC01' }}>Directory</Text>
                </View>
                <View style={{ alignSelf: 'flex-start', marginStart: 20, marginTop: 30 }}>
                    <Text style={{ fontSize: 18, fontFamily: 'mulish' }}>Offline Drive</Text>
                </View>
                <TouchableOpacity style={{ borderTopStartRadius:10, borderTopEndRadius:10, marginTop: 20 }} activeOpacity={0.6} onPress={()=>{props.navigation.navigate('Home')}}>
                    <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderTopStartRadius:10, borderTopEndRadius:10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="folder-open-outline" size={26} style={{ alignSelf: 'center', marginStart: 20 }} color="#FFBC01" />
                            <Text style={{ fontSize: 17, marginStart: 15 }}>Notes</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{allNotesCount}</Text>
                            <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                        </View>
                    </View>
                </TouchableOpacity>
                <Divider style={{width:screenWidth - 40}}/>
                <TouchableOpacity style={{ borderBottomStartRadius:10, borderBottomEndRadius:10 }} activeOpacity={0.6} onPress={()=>{}}>
                    <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderBottomStartRadius:10, borderBottomEndRadius:10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="archive-outline" size={26} style={{ alignSelf: 'center', marginStart: 20 }} color="#FFBC01" />
                            <Text style={{ fontSize: 16.2, marginStart: 15 }}>Archives</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{archivedNoteCount}</Text>
                            <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Directory