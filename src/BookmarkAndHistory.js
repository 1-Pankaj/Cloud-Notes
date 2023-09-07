import React, { useCallback, useEffect, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { View, TouchableOpacity, Appearance, Dimensions, Text, FlatList, BackHandler } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { useIsFocused } from "@react-navigation/native";

import MaterialIcon from '@expo/vector-icons/MaterialIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen'


const screenWidth = Dimensions.get('window').width

const db = SQLite.openDatabase('CloudNotes.db')

const BookmarkAndHistory = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [pageType, setPageType] = useState("")

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })

    const [data, setData] = useState(null)

    const GetData = () => {
        if (pageType == "Bookmark") {
            db.transaction((tx) => {
                tx.executeSql("SELECT * FROM bookmark", [],
                    (sql, rs) => {
                        if (rs.rows.length == 0) {
                            setData(null)
                        } else {
                            let results = []
                            for (let i = 0; i < rs.rows.length; i++) {
                                let id = rs.rows._array[i].id
                                let title = rs.rows._array[i].title

                                results.push({ id: id, title: title })

                            }
                            setData(results)
                        }
                    })
            })
        }
        else if (pageType === "History") {
            db.transaction((tx) => {
                tx.executeSql("SELECT * FROM history", [],
                    (sql, rs) => {
                        if (rs.rows.length == 0) {
                            setData(null)
                        } else {
                            let results = []
                            for (let i = 0; i < rs.rows.length; i++) {
                                let id = rs.rows._array[i].id
                                let title = rs.rows._array[i].url

                                results.push({ id: id, title: title })
                            }
                            setData(results)
                        }
                    })
            })
        }
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
    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const isFocused = useIsFocused()

    useEffect(() => {
        if (props.route.params === undefined) {
            props.navigation.replace('Directory')
        } else {
            if (props.route.params.page == 'Bookmark') {
                setPageType("Bookmark")
            } else if (props.route.params.page == 'History') {
                setPageType("History")
            }
        }
        setTimeout(() => {
            GetData()
        }, 100);
    }, [pageType])



    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null
    }

    const RemoveBookmark = (id) => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM bookmark WHERE id = (?)", [id],
                (sql, rs) => {
                    GetData()
                }, error => {
                })
        })
    }
    const RemoveHistory = (id) => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM history WHERE id = (?)", [id],
                (sql, rs) => {
                    GetData()
                }, error => {
                })
        })
    }

    return (
        <SafeAreaView style={Styles.container} onLayout={onLayoutRootView}>
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', padding: 8, justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ marginStart: 10, marginTop: 20, marginBottom: 20 }} onPress={() => { props.navigation.goBack() }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcon name="arrow-back-ios" size={25} style={{ marginTop: 2 }} color="#FFBC01" />
                        <Text style={{ fontSize: 23, color: '#FFBC01', fontWeight: 'bold' }}>{pageType}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            {data ?
                <View style={{ width: screenWidth, padding: 8 }}>
                    <Text style={{
                        fontSize: 17, alignSelf: 'flex-start', marginStart: 25, marginTop: 10, color: colorScheme === 'dark' ? 'white' : '#101010',
                        fontFamily: 'mulish'
                    }}>All {pageType === 'Bookmark' ? 'Bookmarks' : 'History'}</Text>
                    <FlatList
                        data={data}
                        style={{ marginTop: 20 }}
                        keyExtractor={item => item.id}
                        renderItem={(item) => {
                            return (
                                <TouchableOpacity style={{
                                    width: screenWidth - 50, height: 30, backgroundColor: colorScheme === "dark" ? "#202020" : "#fff", borderRadius: 10,
                                    alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexDirection: 'row', alignSelf: 'center'
                                }} activeOpacity={0.7} onPress={() => {
                                    pageType === 'Bookmark' ?
                                    props.navigation.navigate('Browser', {
                                        page: 'Bookmark',
                                        url: item.item.title
                                    })
                                    :
                                    props.navigation.navigate('Browser', {
                                        page: 'History',
                                        url: item.item.title
                                    })
                                }}>
                                    <Text style={{ paddingHorizontal: 10, fontFamily: 'mulish', color: 'gray', fontSize: 13, marginEnd: 20, width: '85%' }} numberOfLines={1}>{item.item.title}</Text>
                                    <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => {
                                        pageType === 'Bookmark' ?
                                            RemoveBookmark(item.item.id)
                                            :
                                            RemoveHistory(item.item.id)
                                    }}>
                                        <Ionicons name="close" size={20} color={colorScheme === "dark" ? "lightgray" : "#202020"} />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            )
                        }}
                    />
                </View>
                :
                <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
                        <Text style={{color:colorScheme === 'dark'? 'white' : '#101010'}}>No data found!</Text>
                </View>}
        </SafeAreaView>
    )
}

export default BookmarkAndHistory