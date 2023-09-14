import React, { useCallback, useEffect, useState } from "react";
import { Appearance, BackHandler, Dimensions, FlatList, ImageBackground, ToastAndroid, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Button, Dialog, Menu, Portal, Text } from "react-native-paper";

import * as SQLite from 'expo-sqlite'
import { useIsFocused } from "@react-navigation/native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from "expo-font";
import AnimatedLottieView from "lottie-react-native";
import { Drawer } from "react-native-ui-lib";


const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get('window').width

const StarredNotes = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [dialog, setDialog] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')
    const [deletefun, setDeleteFun] = useState(false)
    const [dialog2, setDialog2] = useState(false)
    const [dialogMessage2, setDialogMessage2] = useState('')
    const [deletefun2, setDeleteFun2] = useState(false)
    const [id, setId] = useState('')
    const [menuVisible, setMenuVisible] = useState(false)
    const [notebackgroundEnabled, setNotebackgroundEnabled] = useState(false)

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const GetFeatures = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS features (todo Boolean, reminder Boolean, starred Boolean, moodify Boolean, notebackground Boolean, gridlist Boolean, archive Boolean, readingmode Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM features", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {

                                let notebackground = rs.rows._array[0].notebackground


                                setNotebackgroundEnabled(notebackground)


                            }
                        }, error => {
                        })
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

    const [data, setData] = useState(null)

    const GetData = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS starrednotes(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM starrednotes", [],
                        (sql, rs) => {
                            if (rs.rows.length === 0) {
                                setData(null)
                            }
                            else {
                                let results = []
                                for (let i = 0; i < rs.rows.length; i++) {
                                    let id = rs.rows._array[i].id
                                    let title = rs.rows._array[i].title
                                    let note = rs.rows._array[i].note
                                    let date = rs.rows._array[i].date
                                    let time = rs.rows._array[i].time
                                    let pageColor = rs.rows._array[i].pageColor
                                    let fontColor = rs.rows._array[i].fontColor
                                    let fontStyle = rs.rows._array[i].fontStyle
                                    let fontSize = rs.rows._array[i].fontSize

                                    results.push({ id: id, title: title, note: note, date: date, time: time, pageColor: pageColor, fontColor: fontColor, fontStyle: fontStyle, fontSize: fontSize })
                                }
                                setData(results)
                            }
                        }, error => {
                        })
                },
                error => {
                })
        })
    }

    const isFocused = useIsFocused()

    useEffect(() => {
        GetData()
        GetFeatures()
    }, [isFocused])


    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })

    const UnstarVerify = (id) => {
        setDialog(true)
        setDialogMessage('Are you sure you want to unstar this note? This action is irreversible!')
        setDeleteFun(false)
        setId(id)
        setData(null)
        GetData()
    }

    const DeleteVerify = (id) => {
        setDialog(true)
        setDialogMessage('Are you sure you want to move this note to Trash?\n\nYou can recover Trashed note anytime!')
        setDeleteFun(true)
        setId(id)
        setData(null)
        GetData()
    }

    const UnstarStarredNote = () => {
        setDialog(false)
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM starrednotes WHERE id = (?)", [id],
                (sql, rs) => {
                    GetData()
                    ToastAndroid.show('Note Unstarred!', ToastAndroid.SHORT)
                }, error => {
                })
        })
    }

    const UnstarAll = () => {
        setDialog2(false)
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM starrednotes", [],
                (sql, rs) => {
                    GetData()
                    ToastAndroid.show("All Notes Unstarred", ToastAndroid.SHORT)
                }, error => {
                })
        })
    }

    const UnstarAllVerify = () => {
        setMenuVisible(false)
        setDialog2(true)
        setDialogMessage2('Are you sure you want to unstar all notes? This action is irreversible!')
        setDeleteFun2(false)
    }
    const DeleteAllVerify = () => {
        setMenuVisible(false)
        setDialog2(true)
        setDialogMessage2('Are you sure you want to move all notes to Trash?\n\nYou can recover Trashed notes anytime!')
        setDeleteFun2(true)
    }

    const DeleteAll = () => {
        setDialog2(false)
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS deletednotes (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM starrednotes", [],
                        (sql, rs) => {
                            for (let i = 0; i < rs.rows.length; i++) {
                                let title = rs.rows._array[i].title
                                let note = rs.rows._array[i].note
                                let date = rs.rows._array[i].date
                                let time = rs.rows._array[i].time
                                let pageColor = rs.rows._array[i].pageColor
                                let fontColor = rs.rows._array[i].fontColor
                                let fontStyle = rs.rows._array[i].fontStyle
                                let fontSize = rs.rows._array[i].fontSize

                                sql.executeSql("INSERT INTO deletednotes (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                    (sql, rs) => {
                                        sql.executeSql("DELETE FROM starrednotes", [],
                                            (sql, rs) => {
                                                GetData()
                                                ToastAndroid.show("Moved to Trash", ToastAndroid.SHORT)
                                            }, error => {
                                            })
                                    }, error => {
                                    })
                            }
                        }, error => {
                        })
                }, error => {
                })
        })
    }

    const DeleteStarredNote = () => {
        setDialog(false)
        db.transaction((sql) => {
            sql.executeSql("CREATE TABLE IF NOT EXISTS deletednotes (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM starrednotes where id = (?)", [id],
                        (sql, rs) => {
                            if (rs.rows.length == 0) {

                            } else {
                                let title = rs.rows._array[0].title
                                let note = rs.rows._array[0].note
                                let date = rs.rows._array[0].date
                                let time = rs.rows._array[0].time
                                let pageColor = rs.rows._array[0].pageColor
                                let fontColor = rs.rows._array[0].fontColor
                                let fontStyle = rs.rows._array[0].fontStyle
                                let fontSize = rs.rows._array[0].fontSize

                                sql.executeSql("INSERT INTO deletednotes (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                    (sql, rs) => {
                                        sql.executeSql("DELETE FROM starrednotes WHERE id = (?)", [id],
                                            (sql, rs) => {
                                                GetData()
                                                ToastAndroid.show("Moved to Trash", ToastAndroid.SHORT)
                                            }, error => {
                                            })
                                    }, error => {
                                    })
                            }
                        }, error => {
                        })
                }, error => {
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
        <View style={Styles.container} onLayout={onLayoutRootView}>
            <View style={{ width: screenWidth, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableOpacity style={{ marginTop: 20, marginStart: 15 }} onPress={() => { props.navigation.goBack() }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01" />
                        <Text style={{ fontWeight: 'bold', fontSize: 23, color: '#FFBC01', marginBottom: 2 }}>Starred Notes</Text>
                    </View>
                </TouchableOpacity>
                {data ?
                    <Menu visible={menuVisible}
                        onDismiss={() => { setMenuVisible(false) }}
                        anchor={<TouchableOpacity style={{ marginTop: 22, marginEnd: 20 }} onPress={() => { setMenuVisible(true) }}>
                            <MaterialCommIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                        </TouchableOpacity>}>
                        <Menu.Item onPress={() => { DeleteAllVerify() }} title="Trash All" leadingIcon='delete' theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} />
                        <Menu.Item onPress={() => { UnstarAllVerify() }} leadingIcon='star-off' title="Unstar All" theme={{ colors: { onSurfaceVariant: 'red', onSurface: 'red' } }} />
                    </Menu>
                    :
                    null}
            </View>

            {data ?
                <View style={{ width: screenWidth, alignItems: 'center' }}>
                    <Text style={{ alignSelf: 'flex-start', marginTop: 30, marginStart: 30, fontFamily: 'mulish', fontSize: 17 }}>All Starred Notes</Text>
                    <FlatList data={data}
                        style={{ marginTop: 20 }}
                        keyExtractor={item => item.id}
                        renderItem={data => {
                            return (
                                <Drawer leftItem={{text:"Trash", background:'#FFBC01', onPress:()=>{DeleteVerify(data.item.id)}}}
                                rightItems={[{text:'Unstar', background:'red', onPress:()=>{UnstarVerify(data.item.id)}}]} fullLeftThreshold={0.7} fullRightThreshold={0.7}
                                fullSwipeLeft fullSwipeRight onFullSwipeRight={()=>{
                                    UnstarVerify(data.item.id)
                                }} onFullSwipeLeft={()=>{DeleteVerify(data.item.id)}} disableHaptic
                                style={{marginTop:10, borderRadius:10, height:59}}>
                                    <TouchableHighlight style={{ width: screenWidth - 25, height: 60,  borderRadius: 10 }}
                                        underlayColor={colorScheme === 'dark' ? '#303030' : 'lightgray'}
                                        onPress={() => {
                                            props.navigation.navigate("CreateNote", {
                                                id: data.item.id,
                                                page: 'Starred'
                                            })
                                        }} activeOpacity={0.6}>
                                        <View style={{ width: '100%', height: 60, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
                                            {notebackgroundEnabled ?
                                                <View style={{ backgroundColor: data.item.pageColor == "default" ? colorScheme === "dark" ? "#202020" : "#fff" : data.item.pageColor, width: '100%', height: '100%', borderRadius: 8, opacity: 0.6, position: 'absolute' }} />
                                                :
                                                null}
                                            <View style={{ width: '100%', height: '100%', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, justifyContent: 'space-between' }}>
                                                <View>
                                                    <Text style={{
                                                        fontFamily: 'mulish', fontSize: 18,
                                                        fontWeight: 'bold', color: colorScheme === 'dark' ? 'white' : '#202020'
                                                    }}
                                                        numberOfLines={1}>
                                                        {data.item.title.slice(0, 20).trim()}
                                                    </Text>
                                                    <Text style={{
                                                        fontFamily: 'mulish', fontSize: 12
                                                        , color: colorScheme === 'dark' ? 'white' : '#202020'
                                                    }}
                                                        numberOfLines={1}>
                                                        {data.item.note.slice(0, 30).trim()}
                                                    </Text>
                                                </View>
                                                <View style={{ alignItems: 'center', flexDirection: 'row', }}>
                                                    <View style={{ alignItems: 'center', marginEnd: 20 }}>
                                                        <Text style={{ fontFamily: 'mulish', fontSize: 10 }}>{data.item.date.length === 9 ? data.item.date.slice(0, 4) : data.item.date.slice(0, 5)}</Text>
                                                        <Text style={{ fontFamily: 'mulish', fontSize: 10 }}>{data.item.time.length === 10 ? data.item.time.slice(0, 4) + data.item.time.slice(7, 10) : data.item.time.slice(0, 5) + data.item.time.slice(8, 11)}</Text>
                                                    </View>
                                                    <TouchableOpacity hitSlop={5} style={{ marginEnd: 15 }} onPress={() => { DeleteVerify(data.item.id) }}>
                                                        <MaterialCommIcons name="delete-alert" size={20} color={notebackgroundEnabled ? data.item.pageColor === 'default' ? '#FFBC01' : 'white' : '#FFBC01'} />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity hitSlop={5} style={{ marginEnd: 5 }} onPress={() => { UnstarVerify(data.item.id) }}>
                                                        <MaterialCommIcons name="star-off" size={20} color='red' />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                        </View>
                                    </TouchableHighlight>
                                </Drawer>
                            )
                        }}
                    />
                </View>
                :
                <View style={{ width: screenWidth, alignItems: 'center', flex: 1 }}>
                    <AnimatedLottieView source={require('../assets/starrednotesplash.json')} autoPlay
                        loop style={{ width: screenWidth }}
                    />
                    <Text style={{ fontFamily: 'mulish', fontSize: 18, textAlign: 'center', marginTop: 20 }}>No Starred note found,{'\n'}Try adding some!</Text>
                </View>
            }
            <Portal>
                <Dialog visible={dialog} onDismiss={() => { setDialog(false) }}>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{dialogMessage}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => { setDialog(false) }}>Cancel</Button>
                        {deletefun ?
                            <Button onPress={() => { DeleteStarredNote() }}>Delete</Button>
                            :
                            <Button onPress={() => { UnstarStarredNote() }}>Unstar</Button>}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Portal>
                <Dialog visible={dialog2} onDismiss={() => { setDialog2(false) }}>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{dialogMessage2}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => { setDialog2(false) }}>Cancel</Button>
                        {deletefun2 ?
                            <Button onPress={() => { DeleteAll() }}>Delete</Button>
                            :
                            <Button onPress={() => { UnstarAll() }}>Unstar</Button>}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
}

export default StarredNotes