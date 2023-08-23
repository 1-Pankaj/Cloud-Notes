import React, { useCallback, useEffect, useState } from "react";
import { Appearance, Dimensions, ScrollView, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import { Divider, Text } from "react-native-paper";

import Ionicons from '@expo/vector-icons/Ionicons'

import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from 'expo-splash-screen'
import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { useIsFocused } from "@react-navigation/native";

SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height


const Directory = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [allNotesCount, setAllNotesCount] = useState(0)
    const [archivedNoteCount, setArchivedNoteCount] = useState(0)
    const [deletedNotesCount, setDeletedNotesCount] = useState(0)
    const [bookmarkCount, setBookmarkCount] = useState(0)
    const [historyCount, setHistoryCount] = useState(0)
    const [password, setPassword] = useState('')

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

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS bookmark(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL)", [],
                (sql, rs) => {
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, url VARCHAR(500) NOT NULL)", [],
                (sql, rs) => {
                },
                error => {
                    console.log("Error");
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS deletednotes (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT title FROM deletednotes", [],
                (sql, rs) => {
                    setDeletedNotesCount(rs.rows.length)
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT * from bookmark", [],
                (sql, rs) => {
                    setBookmarkCount(rs.rows.length)
                }, error => {
                    console.log("Error")
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT url FROM history", [],
                (sql, rs) => {
                    setHistoryCount(rs.rows.length)
                }, error => {
                    console.log("Error");
                })
        })
    }

    const ArchivePasswordCheck = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS archivepass(firsttime VARCHAR(20),password VARCHAR(20))", [],
                (sql, rs) => {

                }, error => {
                    console.log("Error");
                })

            tx.executeSql("SELECT * FROM archivepass", [],
                (sql, rs) => {
                    if (rs.rows.length == 0) {
                        props.navigation.navigate('ArchivePasswordSplash')
                    } else {
                        if (rs.rows._array[0].password == '') {
                            props.navigation.navigate('ArchivePage')
                        } else {
                            props.navigation.navigate('PasswordPage')
                        }
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }

    const DropTableDeleted = () => {
        db.transaction((tx) => {
            tx.executeSql("DROP TABLE deletednotes", [],
                (sql, rs) => { console.log('done'); })
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
            <ScrollView style={[{ padding: 8, width: screenWidth, flex: 1 }]} contentContainerStyle={{ alignItems: 'center', flex: 1, }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginVertical: 20 }} onPress={() => { props.navigation.navigate('Home') }}>
                    <Ionicons name="chevron-back-outline" color='#FFBC01' size={35} style={{ marginStart: 1, marginTop: 2 }} />
                    <Text style={{ fontWeight: 'bold', fontSize: 27, color: '#FFBC01', alignSelf: 'center' }}>Directory</Text>
                </TouchableOpacity>
                <View style={{ alignSelf: 'flex-start', marginStart: 20, marginTop: 30 }}>
                    <Text style={{ fontSize: 18, fontFamily: 'mulish' }}>Offline Drive</Text>
                </View>
                <TouchableOpacity style={{ borderTopStartRadius: 10, borderTopEndRadius: 10, marginTop: 20 }} activeOpacity={0.6} onPress={() => { props.navigation.navigate('Home') }}>
                    <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderTopStartRadius: 10, borderTopEndRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <Divider style={{ width: screenWidth - 40 }} />
                <TouchableOpacity style={{ borderBottomStartRadius: 10, borderBottomEndRadius: 10 }} activeOpacity={0.6} onPress={() => { ArchivePasswordCheck() }}>
                    <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderBottomStartRadius: 10, borderBottomEndRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <TouchableOpacity style={{ borderRadius: 10, marginTop: 30 }} activeOpacity={0.6} onPress={() => { props.navigation.navigate('TrashPage') }}>
                    <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="trash-outline" size={26} style={{ alignSelf: 'center', marginStart: 22 }} color="#FFBC01" />
                            <Text style={{ fontSize: 16.2, marginStart: 15 }}>Trash</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{deletedNotesCount}</Text>
                            <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={{ alignSelf: 'flex-start', marginStart: 20, marginTop: 30 }}>
                    <Text style={{ fontSize: 18, fontFamily: 'mulish' }}>Browser Storage</Text>
                </View>
                <TouchableOpacity style={{ borderTopStartRadius: 10, borderTopEndRadius: 10, marginTop: 20 }} activeOpacity={0.6} onPress={() => {
                    props.navigation.navigate('BookmarkAndHistory', {
                        page: 'Bookmark'
                    })
                }}>
                    <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderTopStartRadius: 10, borderTopEndRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="bookmarks-outline" size={23} style={{ alignSelf: 'center', marginStart: 22 }} color="#FFBC01" />
                            <Text style={{ fontSize: 17, marginStart: 15 }}>Bookmarks</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{bookmarkCount}</Text>
                            <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                        </View>
                    </View>
                </TouchableOpacity>
                <Divider style={{ width: screenWidth - 40 }} />
                <TouchableOpacity style={{ borderBottomStartRadius: 10, borderBottomEndRadius: 10 }} activeOpacity={0.6} onPress={() => {
                    props.navigation.navigate('BookmarkAndHistory', {
                        page: 'History'
                    })
                }}>
                    <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderBottomStartRadius: 10, borderBottomEndRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialCommIcons name="history" size={26} style={{ alignSelf: 'center', marginStart: 20 }} color="#FFBC01" />
                            <Text style={{ fontSize: 16.2, marginStart: 15 }}>History</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{historyCount}</Text>
                            <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                        </View>
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Directory