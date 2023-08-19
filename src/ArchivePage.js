import React, { useCallback, useEffect, useState } from "react";
import { Appearance, Dimensions, FlatList, ImageBackground, ScrollView, TouchableOpacity, View } from "react-native";
import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Button, Divider, Menu, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import AnimatedLottieView from "lottie-react-native";
import { useIsFocused } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons'
import { SwipeListView } from "react-native-swipe-list-view";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'

SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")
const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const ArchivePage = (props) => {


    const [data, setData] = useState(null)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [password, setPassword] = useState('')

    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);

    const closeMenu = () => setVisible(false);

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const SelectPassword = () =>{
        db.transaction((tx)=>{
            tx.executeSql("SELECT password from archivepass",[],
            (sql,rs)=>{
                setPassword(rs.rows._array[0].password)
            })
        })
    }

    const GetData = () => {
        db.transaction(tx => {
            tx.executeSql("SELECT * FROM archived", [],
                (sql, rs) => {
                    if (!rs.rows.length == 0) {
                        setData(null)
                        let results = []
                        for (let i = 0; i < rs.rows.length; i++) {
                            let item = rs.rows._array[i]
                            results.push({ id: item.id, title: item.title, note: item.note, date: item.date, time: item.time, pageColor: item.pageColor, fontColor: item.fontColor, fontStyle: item.fontStyle, fontSize: item.fontSize })
                        }
                        setData(results)
                    } else {
                        setData(null)
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }

    const isFocused = useIsFocused()

    useEffect(() => {
        GetData()
        SelectPassword()
    }, [isFocused])


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
        <SafeAreaView style={Styles.container} onLayout={onLayoutRootView}>
            <View style={[Styles.container, { width: screenWidth }]}>
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: screenWidth }}>
                    <TouchableOpacity onPress={() => { props.navigation.navigate("Directory") }} style={{ margin: 20 }}>
                        <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01" />
                    </TouchableOpacity>
                    
                    <Menu
                        visible={visible}
                        onDismiss={closeMenu}
                        anchor={<TouchableOpacity onPress={() => { openMenu()}} style={{ margin: 20 }}>
                            <MaterialCommunityIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                        </TouchableOpacity>}>
                        <Menu.Item onPress={() => { password == ''? 
                        props.navigation.replace('PasswordPage') : props.navigation.replace('PasswordPage', {params:'reset'}) }} title={password == ''? 'Set Password' : 'Reset Password'} leadingIcon="key" theme={{colors:{onSurfaceVariant:'#FFBC01'}}} />
                        {
                            password == ''?
                            null
                            :
                            <Menu.Item leadingIcon="lock-open-variant-outline" theme={{colors:{onSurfaceVariant:'#FFBC01'}}} title="Remove Password"
                                onPress={()=>{props.navigation.replace('PasswordPage', {params:'remove'})}}
                            />
                        }
                    </Menu>

                </View>
                <Text style={{ alignSelf: 'flex-start', marginStart: 25, marginTop: 20, fontSize: 22, fontWeight: 'bold' }}>Archived Notes</Text>
                <View>
                    {data ?
                        <ScrollView style={{ flex: 1 }}
                            showsVerticalScrollIndicator={false}>
                            <FlatList
                                data={data}
                                keyExtractor={item => item.id}
                                style={{ marginTop: 20, marginBottom: 150 }}
                                showsVerticalScrollIndicator={false}
                                scrollEnabled={false}
                                renderItem={item => {
                                    return (
                                        <TouchableOpacity activeOpacity={0.6} style={{ marginTop: 10, marginBottom: 10 }}>
                                            <View style={{
                                                width: screenWidth - 40, height: 60, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10,  flexDirection: 'row',
                                                alignItems: 'center', justifyContent: 'space-between'
                                            }}>
                                                <ImageBackground style={{ width: '100%', height: '100%', borderRadius: 7.3, backgroundColor: item.item.pageColor === "default" ? colorScheme === 'dark' ? '#202020' : 'white' : item.item.pageColor, opacity: 0.6, position: 'absolute' }} />
                                                <View style={{ marginStart: 20 }}>
                                                    <Text style={{
                                                         fontSize: 20,
                                                        fontWeight: 'bold', marginTop:-2 
                                                    }}
                                                        numberOfLines={1}>{item.item.title.slice(0, 15).trim()}</Text>
                                                    <Text style={{  fontSize: 12 }}
                                                        numberOfLines={1}>{item.item.note.slice(0, 25).trim()}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <View style={{ marginEnd: 10 }}>
                                                        <Text style={{ fontFamily: 'mulish', fontSize: 10 }}>{item.item.date.length === 9 ? item.item.date.slice(0, 4) : item.item.date.slice(0, 5)}</Text>
                                                        <Text style={{ fontFamily: 'mulish', fontSize: 10, marginStart: -15 }}>{item.item.time.length === 10 ? item.item.time.slice(0, 4) + item.item.time.slice(7, 10) : item.item.time.slice(0, 5) + item.item.time.slice(8, 11)}</Text>
                                                    </View>
                                                    <Ionicons name="chevron-forward-outline" size={25} color="#FFBC01" style={{ marginEnd: 15 }} />
                                                </View>

                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </ScrollView>
                        :
                        <View style={{ width: screenWidth, flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                            <AnimatedLottieView source={require('../assets/archiveempty.json')}
                                style={{ width: screenWidth, alignSelf: 'center' }} autoPlay loop />
                            <Text style={{ fontSize: 15, fontFamily: 'mulish', marginTop: 50 }}>Looks like your archive is empty.</Text>
                        </View>
                    }
                </View>
            </View>
        </SafeAreaView>
    )
}

export default ArchivePage