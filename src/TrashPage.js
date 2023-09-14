import React, { useCallback, useEffect, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { Appearance, BackHandler, Dimensions, FlatList, ImageBackground, TouchableOpacity, View } from "react-native";
import { Button, Dialog, Menu, Portal, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import AnimatedLottieView from "lottie-react-native";
import { useIsFocused } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen'
import { Drawer } from "react-native-ui-lib";

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

const db = SQLite.openDatabase('CloudNotes.db')

const TrashPage = (props) => {

    const [menuOpen, setMenuOpen] = useState(false)
    const [data, setData] = useState(null)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [dialog, setDialog] = useState(false)
    const [deleteFun, setDeleteFun] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')
    const [deleteNoteId, setDeleteNoteId] = useState('')
    const [deleteId, setDeleteId] = useState('')
    const [notebackgroundEnabled, setNotebackgroundEnabled] = useState(false)
    const [selectionMode, setSelectionMode] = useState(false)
    const [selectionData, setSelectionData] = useState(null)
    const [selectAll, setSelectAll] = useState(false)

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

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const FetchTrashedNotes = () => {
        db.transaction((tx) => {
            tx.executeSql('SELECT * FROM deletednotes', [],
                (sql, rs) => {
                    setData(null)
                    if (rs.rows.length == 0) {
                        setData(null)
                    } else {

                        let results = []
                        for (let i = 0; i < rs.rows.length; i++) {
                            let id = rs.rows._array[i].id
                            let title = rs.rows._array[i].title
                            let note = rs.rows._array[i].note
                            let date = rs.rows._array[i].date
                            let time = rs.rows._array[i].time
                            let pageColor = rs.rows._array[i].pageColor
                            results.push({ id: id, title: title, note: note, date: date, time: time, pageColor: pageColor })
                        }
                        setData(results)

                    }
                }, error => {
                })
        })
    }

    const RestoreNote = (id) => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM deletednotes where id = (?)", [id],
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

                        sql.executeSql("INSERT INTO notes (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                            (sql, rs) => {
                                sql.executeSql("DELETE FROM deletednotes WHERE id = (?)", [id],
                                    (sql, rs) => {
                                        FetchTrashedNotes()
                                        setDeleteFun(false)
                                        setDialogMessage('Trashed note recovered successfully!')
                                        setDialog(true)
                                    }, error => {

                                    })
                            }, error => {
                            })
                    }
                }, error => {
                })
        })
    }

    const DeleteTrashedNote = (id) => {
        setDeleteNoteId(id)
        setDeleteId(id)
        setDeleteFun(true)
        setDialogMessage('Are you sure you want to delete this note?')
        setDialog(true)
    }
    const DeleteAll = () => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM deletednotes", [],
                (sql, rs) => {
                    FetchTrashedNotes()
                    setDeleteFun(false)
                    setDialogMessage('All notes deleted successfully!')
                    setDialog(true)
                }, error => {
                })
        })
    }

    const RecoverAll = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM deletednotes", [],
                (sql, rs) => {
                    if (rs.rows.length == 0) {

                    } else {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let title = rs.rows._array[i].title
                            let note = rs.rows._array[i].note
                            let date = rs.rows._array[i].date
                            let time = rs.rows._array[i].time
                            let pageColor = rs.rows._array[i].pageColor
                            let fontColor = rs.rows._array[i].fontColor
                            let fontStyle = rs.rows._array[i].fontStyle
                            let fontSize = rs.rows._array[i].fontSize
                            sql.executeSql("INSERT INTO notes (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)", [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                (sql, rs) => {
                                    sql.executeSql("DELETE FROM deletednotes", [],
                                        (sql, rs) => {
                                            FetchTrashedNotes()
                                            setDeleteFun(false)
                                            setDialogMessage('All notes recovered successfully!')
                                            setDialog(true)
                                        }, error => {
                                        })
                                }, error => {
                                })
                        }
                    }
                }, error => {
                })
        })
    }

    const FinallyDelete = () => {
        if (deleteNoteId == 'All') {
            DeleteAll()
        }
        else if (deleteNoteId == 'recover') {
            RecoverAll()
        }
        else{
            db.transaction((tx) => {
                tx.executeSql("DELETE FROM deletednotes WHERE id = (?)", [deleteId],
                    (sql, rs) => {
                        FetchTrashedNotes()
                        setDeleteFun(false)
                        setDialogMessage('Trashed note deleted successfully!')
                        setDialog(true)
                    },
                    error => {

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

    const RecoverAllPermission = () => {
        setDeleteNoteId('recover')
        setDeleteFun(true)
        setDialogMessage('Are you sure you want to recover All notes?')
        setDialog(true)
    }

    const DeleteAllPermission = () => {
        setDeleteNoteId('All')
        setDeleteFun(true)
        setDialogMessage('Are you sure you want to delete All notes?')
        setDialog(true)
    }

    const isFocused = useIsFocused()
    useEffect(() => {
        FetchTrashedNotes()
        GetFeatures()
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
        <View style={Styles.container} onLayout={onLayoutRootView}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: screenWidth }}>
                <TouchableOpacity style={{ alignSelf: 'flex-start', marginTop: 20, marginStart: 25 }} onPress={() => { props.navigation.goBack() }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01" />
                        <Text style={{ fontWeight: 'bold', fontSize: 23, color: '#FFBC01', marginBottom: 2 }}>Trash</Text>
                    </View>
                </TouchableOpacity>
                <Menu
                    onDismiss={() => { setMenuOpen(false) }}
                    visible={menuOpen}
                    anchor={<TouchableOpacity style={{ marginEnd: 25, marginTop: 20 }}
                        onPress={() => { setMenuOpen(true) }}>
                        <MaterialCommIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                    </TouchableOpacity>} >
                    <Menu.Item title="Recover all notes" leadingIcon='delete-restore'
                        theme={{ colors: { onSurfaceVariant: "#FFBC01" } }}
                        onPress={() => {
                            setMenuOpen(false)
                            RecoverAllPermission()
                        }} />
                    <Menu.Item title="Delete Forever" leadingIcon='delete-forever'
                        theme={{ colors: { onSurfaceVariant: "red" } }} titleStyle={{ color: 'red' }}
                        onPress={() => {
                            setMenuOpen(false)
                            DeleteAllPermission()
                        }} />
                </Menu>
            </View>
            <Text style={{ alignSelf: 'flex-start', marginStart: 20, marginTop: 50, fontSize: 17, fontFamily: 'mulish' }}>Trashed Notes</Text>
            {data ?
                <FlatList data={data}
                    keyExtractor={item => item.id}
                    showsVerticalScrollIndicator={false}
                    style={{ marginTop: 20, marginBottom: 50 }}
                    renderItem={(item) => {
                        return (
                            <Drawer leftItem={{text:"Recover", background:'#FFBC01', onPress:()=>{RestoreNote(item.item.id)}}} 
                            rightItems={[{text:"Delete", background:'red', onPress:()=>{DeleteTrashedNote(item.item.id)}}]}
                            onFullSwipeLeft={()=>{RestoreNote(item.item.id)}} disableHaptic
                            onFullSwipeRight={()=>{DeleteTrashedNote(item.item.id)}} fullSwipeLeft fullSwipeRight fullLeftThreshold={0.7} fullRightThreshold={0.7}
                            style={{height:65, marginTop: 10, marginBottom: 10, borderRadius:10 }}>
                                
                                    <View style={{
                                        width: screenWidth - 40, height: 65, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10, flexDirection: 'row',
                                        alignItems: 'center', justifyContent: 'space-between'
                                    }}>

                                        {notebackgroundEnabled ?
                                            <View style={{ width: '100%', height: '100%', borderRadius: 7.3, backgroundColor: item.item.pageColor === "default" ? colorScheme === 'dark' ? '#202020' : 'white' : item.item.pageColor, opacity: 0.7, position: 'absolute' }} />
                                            :
                                            null}
                                        <View style={{ marginStart: 20 }}>
                                            <Text style={{
                                                fontSize: 20,
                                                fontWeight: 'bold', marginTop: -2
                                            }}
                                                numberOfLines={1}>{item.item.title.slice(0, 15).trim()}</Text>
                                            <Text style={{ fontSize: 12 }}
                                                numberOfLines={1}>{item.item.note.slice(0, 25).trim()}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ marginEnd: 10 }}>
                                                <Text style={{ fontFamily: 'mulish', fontSize: 10 }}>{item.item.date.length === 9 ? item.item.date.slice(0, 4) : item.item.date.slice(0, 5)}</Text>
                                                <Text style={{ fontFamily: 'mulish', fontSize: 10, marginStart: -15 }}>{item.item.time.length === 10 ? item.item.time.slice(0, 4) + item.item.time.slice(7, 10) : item.item.time.slice(0, 5) + item.item.time.slice(8, 11)}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => { RestoreNote(item.item.id) }}>
                                                <MaterialIcons name="restore-from-trash" size={25} color={notebackgroundEnabled ? item.item.pageColor === 'default' ? '#FFBC01' : 'white' : "#FFBC01"} style={{ marginEnd: 20 }} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => {
                                                DeleteTrashedNote(item.item.id)
                                            }}>
                                                <MaterialIcons name="delete-forever" size={25} color="red" style={{ marginEnd: 20 }} />
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                            </Drawer>
                        )
                    }}
                />
                :
                <>
                    <AnimatedLottieView
                        style={{ width: screenWidth, marginTop: 50 }}
                        resizeMode="cover"
                        autoPlay autoSize loop
                        source={require('../assets/emptytrash.json')} />
                    <Text style={{ marginTop: 100, fontWeight: 'bold', fontSize: 20 }}>
                        Your trash is empty!
                    </Text>
                </>
            }

            <Portal>
                <Dialog visible={dialog} onDismiss={() => { setDialog(false) }}>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{dialogMessage}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        {deleteFun ?
                            <>
                                <Button onPress={() => { setDialog(false) }}>Cancel</Button>
                                <Button onPress={() => { FinallyDelete() }}>{deleteNoteId === 'All' ? 'Delete' : deleteNoteId == 'recover'? 'Recover' : 'Delete'}</Button>
                            </>
                            :
                            <Button onPress={() => { setDialog(false) }}>Done</Button>}
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    )
}

export default TrashPage;