import React, { useCallback, useEffect, useState } from "react";
import { Appearance, BackHandler, Dimensions, FlatList, ImageBackground, ScrollView, TouchableHighlight, TouchableOpacity, View } from "react-native";
import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen';
import { Button, Checkbox, Dialog, Divider, Menu, Portal, Text } from "react-native-paper";
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
    const [dialog, setDialog] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')
    const [notebackgroundEnabled, setNotebackgroundEnabled] = useState(false)
    const [selectionMode, setSelectionMode] = useState(false)
    const [selectionData, setSelectionData] = useState(null)
    const [selectAll, setSelectAll] = useState(false)

    const [visible, setVisible] = useState(false);

    const openMenu = () => setVisible(true);

    const closeMenu = () => setVisible(false);

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const SelectPassword = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT password from archivepass", [],
                (sql, rs) => {
                    setPassword(rs.rows._array[0].password)
                })
        })
    }

    const CheckUncheck = (id) => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM selectedNotesArchived WHERE noteid = (?)", [id],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let checked = rs.rows._array[0].checked
                        if (checked == true) {
                            sql.executeSql("UPDATE selectedNotesArchived SET checked = false WHERE noteid = (?)", [id],
                                (sql, rs) => {
                                    GetData()
                                }, error => {
                                    console.log("Error");
                                })
                        } else {
                            sql.executeSql("UPDATE selectedNotesArchived SET checked = true WHERE noteid = (?)", [id],
                                (sql, rs) => {
                                    GetData()
                                }, error => {
                                    console.log("Error");
                                })
                        }
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }

    const UnarchiveSelected = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT noteid FROM selectedNotesArchived WHERE checked = true", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let noteid = rs.rows._array[i].noteid
                            UnarchiveSingle(noteid)
                            setSelectionMode(false)
                            GetData()
                        }
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }

    const SelectAllNotes = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT checked FROM selectedNotesArchived", [],
                (sql, rs) => {
                    if (rs.rows._array[0].checked == true) {
                        sql.executeSql("UPDATE selectedNotesArchived set checked = false", [],
                            (sql, rs) => {
                                GetData()
                            }, error => {
                                console.log("Error");
                            })
                    } else {
                        sql.executeSql("UPDATE selectedNotesArchived set checked = true", [],
                            (sql, rs) => {
                                GetData()
                            }, error => {
                                console.log("Error");
                            })
                    }
                }, error => {
                    console.log("Error");
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

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS selectedNotesArchived(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(5000) NOT NULL, noteid VARCHAR(20) NOT NULL, date VARCHAR(20) NOT NULL, time VARCHAR(20) NOT NULL, checked Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM selectedNotesArchived", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                let selection = []
                                let rowLength = rs.rows.length
                                for (let i = 0; i < rs.rows.length; i++) {
                                    let id = rs.rows._array[i].id
                                    let title = rs.rows._array[i].title
                                    let note = rs.rows._array[i].note
                                    let date = rs.rows._array[i].date
                                    let time = rs.rows._array[i].time
                                    let noteid = rs.rows._array[i].noteid
                                    let checked = rs.rows._array[i].checked

                                    selection.push({ id: id, title: title, note: note, date: date, time: time, noteid: noteid, checked: checked })
                                }

                                setSelectionData(selection)
                                sql.executeSql("SELECT * FROM selectedNotesArchived WHERE checked = true", [],
                                    (sql, rs) => {
                                        if (rs.rows.length == rowLength) {
                                            setSelectAll(true)
                                        } else {
                                            setSelectAll(false)
                                        }
                                    }, error => {
                                        console.log("Error");
                                    })
                            }
                        }, error => {
                            console.log("Error");
                        })
                }, error => {
                    console.log("Error");
                })
        })
    }

    const isFocused = useIsFocused()

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
                            console.log("Error");
                        })
                }, error => {
                    console.log("Error");
                })
        })
    }
    useEffect(() => {
        GetData()
        GetFeatures()
        SelectPassword()
    }, [isFocused])

    const SelectedNotesDatabase = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM archived ORDER BY id DESC", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        for (let i = 0; i < rs.rows.length; i++) {
                            let id = rs.rows._array[i].id
                            let title = rs.rows._array[i].title
                            let note = rs.rows._array[i].note
                            let date = rs.rows._array[i].date
                            let time = rs.rows._array[i].time

                            sql.executeSql("DELETE FROM selectedNotesArchived", [],
                                (sql, rs) => {
                                    sql.executeSql("INSERT INTO selectedNotesArchived(title,note,noteid,date,time,checked) values (?,?,?,?,?,?)", [title, note, id, date, time, false],
                                        (sql, rs) => {
                                            GetData()
                                        }, error => {
                                            console.log("Error");
                                        })
                                }, error => {
                                    console.log("Error");
                                })
                        }
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }

    function handleBackButtonClick() {
        if (selectionMode == true) {
            setSelectionData(null)
            setSelectionMode(false)
            return true;
        } else {
            props.navigation.navigate('Directory')
        }
    }

    useEffect(() => {
        SelectedNotesDatabase()
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [selectionMode])

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

    const UnarchiveSingle = (id) => {
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM archived WHERE id =${id}`, [],
                (sql, rs) => {
                    let title = rs.rows._array[0].title
                    let note = rs.rows._array[0].note
                    let date = rs.rows._array[0].date
                    let time = rs.rows._array[0].time
                    let pageColor = rs.rows._array[0].pageColor
                    let fontColor = rs.rows._array[0].fontColor
                    let fontStyle = rs.rows._array[0].fontStyle
                    let fontSize = rs.rows._array[0].fontSize

                    sql.executeSql('INSERT INTO notes (title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)', [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                        (sql, rs) => {
                            sql.executeSql('DELETE FROM archived WHERE id = (?)', [id],
                                (sql, rs) => {
                                    setDialog(true)
                                    setDialogMessage('Note unarchived!')
                                    GetData()
                                }, error => {
                                    console.log("Error");
                                })
                        })
                })
        })
    }



    const UnarchiveAll = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM archived", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
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
                                    sql.executeSql("DELETE FROM archived", [],
                                        (sql, rs) => {
                                            GetData()
                                            setDialog(true)
                                            setDialogMessage("All notes unarchived!")
                                        }, error => {
                                            console.log("Error");
                                        })
                                }, error => {
                                    console.log("Error");
                                })
                        }
                    }
                })
        })
    }



    return (
        <SafeAreaView style={Styles.container} onLayout={onLayoutRootView}>
            <View style={[Styles.container, { width: screenWidth }]}>
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', width: screenWidth }}>
                    <TouchableOpacity onPress={() => {
                        selectionMode ?
                            setSelectionMode(false)
                            :
                            props.navigation.navigate("Directory")
                    }} style={{ margin: 20 }}>
                        {selectionMode ?
                            <MaterialIcons name="close" size={30} color="#FFBC01" />
                            :
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01" />
                                <Text style={{ fontWeight: 'bold', fontSize: 23, color: '#FFBC01', marginBottom: 2 }}>Archived Notes</Text>
                            </View>}
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {selectionMode ?
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => {
                                UnarchiveSelected()
                            }}>
                                <Text style={{ marginEnd: 10, color: '#FFBC01' }}>Unarchive</Text>
                                <MaterialIcons name="unarchive" size={25} color="#FFBC01" />
                            </TouchableOpacity>
                            :
                            null}
                        <Menu
                            visible={visible}
                            onDismiss={closeMenu}
                            anchor={<TouchableOpacity onPress={() => { openMenu() }} style={{ margin: 20 }}>
                                <MaterialCommunityIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                            </TouchableOpacity>}>
                            <Menu.Item onPress={() => {
                                password == '' ?
                                    props.navigation.replace('PasswordPage') : props.navigation.replace('PasswordPage', { params: 'reset' })
                            }} title={password == '' ? 'Set Password' : 'Reset Password'} leadingIcon="key" theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} />
                            {
                                password == '' ?
                                    null
                                    :
                                    <Menu.Item leadingIcon="lock-open-variant-outline" theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} title="Remove Password"
                                        onPress={() => { props.navigation.replace('PasswordPage', { params: 'remove' }) }}
                                    />
                            }
                            {
                                data ?
                                    <Menu.Item leadingIcon='archive' theme={{ colors: { onSurfaceVariant: '#FFBC01' } }} title="Unarchive All"
                                        onPress={() => {
                                            setVisible(false)
                                            UnarchiveAll()
                                        }}
                                    />
                                    :
                                    null
                            }
                            {
                                data ?
                                    <Menu.Item leadingIcon="format-list-checks" title={selectionMode ? 'Disable Selection' : 'Selection Mode'} theme={{ colors: { onSurfaceVariant: '#FFBC01' } }}
                                        onPress={() => {
                                            setSelectionData(null)
                                            GetData()
                                            setSelectionMode(!selectionMode)
                                            closeMenu()
                                        }}
                                    />
                                    :
                                    null
                            }
                        </Menu>
                    </View>

                </View>
                {data ?
                    <View style={{ flexDirection: 'row', width: screenWidth, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ alignSelf: 'flex-start', marginStart: 25, marginTop: 20, fontSize: 23, fontFamily: 'mulish', fontWeight: 'bold' }}>{selectionMode ? 'Selection Mode' : 'All Archived Notes'}</Text>
                        {selectionMode ?
                            <TouchableOpacity style={{ marginEnd: 15, flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => {
                                    SelectAllNotes()
                                }}>
                                <Text style={{ color: '#FFBC01', fontSize: 12 }}>Select all</Text>
                                <Checkbox status={selectAll ? 'checked' : 'unchecked'} color="#FFBC01" uncheckedColor="#FFBC01" />
                            </TouchableOpacity>
                            :
                            null}
                    </View>
                    :
                    null}
                <View>
                    {data && !selectionMode ?
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
                                        <TouchableOpacity activeOpacity={0.6} style={{ marginTop: 10, marginBottom: 10 }} onPress={() => {
                                            props.navigation.navigate('CreateNote', {
                                                id: item.item.id,
                                                page: 'Archive'
                                            })
                                        }}>
                                            <View style={{
                                                width: screenWidth - 20, height: 60, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10, flexDirection: 'row',
                                                alignItems: 'center', justifyContent: 'space-between'
                                            }}>
                                                {notebackgroundEnabled ?
                                                    <View style={{ width: '100%', height: '100%', borderRadius: 7.3, backgroundColor: item.item.pageColor === "default" ? colorScheme === 'dark' ? '#202020' : 'white' : item.item.pageColor, opacity: 0.6, position: 'absolute' }} />
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
                                                    <Ionicons name="chevron-forward-outline" size={25} color={notebackgroundEnabled ? item.item.pageColor === 'default' ? "#FFBC01" : 'white' : '#FFBC01'} />
                                                    <TouchableOpacity onPress={() => { UnarchiveSingle(item.item.id) }}
                                                        activeOpacity={0.6}
                                                        style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 30 }}>
                                                        <MaterialIcons name="unarchive" size={22} color={notebackgroundEnabled ? item.item.pageColor === 'default' ? "#FFBC01" : 'white' : '#FFBC01'} />
                                                    </TouchableOpacity>

                                                </View>

                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        </ScrollView>
                        :
                        selectionMode ?
                            <FlatList
                                data={selectionData}
                                key={item => item.id}
                                contentContainerStyle={{ marginBottom: 100 }}
                                scrollEnabled={true}
                                renderItem={(item) => {
                                    return (
                                        <View style={{ width: '95%', flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, alignItems: 'center', alignSelf: 'center', marginTop: 20 }}>
                                            <Checkbox status={item.item.checked ? 'checked' : 'unchecked'} color="#FFBC01" uncheckedColor="#FFBC01" onPress={() => {
                                                CheckUncheck(item.item.noteid)
                                            }} />
                                            <TouchableOpacity style={{ width: '80%', height: 75, backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', borderRadius: 10, alignItems: 'center', paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' }}
                                                activeOpacity={0.6} onPress={() => {
                                                    CheckUncheck(item.item.noteid)
                                                }}>
                                                <View>
                                                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{item.item.title.trim().slice(0, 16)}</Text>
                                                    <Text numberOfLines={2} style={{ fontSize: 11 }}>{item.item.note.trim().slice(0, 25)}</Text>
                                                </View>
                                                <View style={{}}>
                                                    <Text style={{ fontFamily: 'mulish', fontSize: 10, alignSelf: 'flex-end' }}>{item.item.date.length === 9 ? item.item.date.slice(0, 4) : item.item.date.slice(0, 5)}</Text>
                                                    <Text style={{ fontFamily: 'mulish', fontSize: 10, marginStart: -15 }}>{item.item.time.length === 10 ? item.item.time.slice(0, 4) + item.item.time.slice(7, 10) : item.item.time.slice(0, 5) + item.item.time.slice(8, 11)}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                }}
                            />
                            :
                            <View style={{ width: screenWidth, flexDirection: 'column', flex: 1, alignItems: 'center' }}>
                                <AnimatedLottieView source={require('../assets/archiveempty.json')}
                                    style={{ width: screenWidth, alignSelf: 'center' }} autoPlay loop />
                                <Text style={{ fontSize: 15, fontFamily: 'mulish', marginTop: 50 }}>Looks like your archive is empty.</Text>
                            </View>
                    }
                </View>
                <Portal>
                    <Dialog visible={dialog} onDismiss={() => { setDialog(false) }}>
                        <Dialog.Content>
                            <Text variant="bodyMedium">{dialogMessage}</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => { setDialog(false) }}>Done</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </SafeAreaView>
    )
}

export default ArchivePage