import React, { useEffect, useRef, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { Appearance, Dimensions, ToastAndroid, TouchableOpacity, View, ViewToken } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Button, Dialog, Menu, Portal, RadioButton, Text, TextInput } from "react-native-paper";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialComIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { FlatList } from "react-native-gesture-handler";
import AnimatedLottieView from "lottie-react-native";
import Ionicons from '@expo/vector-icons/Ionicons'

const db = SQLite.openDatabase('CloudNotes.db')


const screenWidth = Dimensions.get('window').width

const ToDo = (props) => {

    const [data, setData] = useState(null)
    const [task, setTask] = useState('')
    const inputRef = useRef(null)
    const [selected, setSelected] = useState(null)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [dialog, setDialog] = useState(false)
    const [dialogMessage, setDialogMessage] = useState('')
    const [menuVisible, setMenuVisible] = useState(false)

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const CheckFirstTime = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS todosplash (firsttime VARCHAR(20))", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM todosplash", [],
                        (sql, rs) => {
                            if (rs.rows.length == 0) {
                                props.navigation.replace('ToDoSplash')
                            }
                        }, error => {

                        })
                }, error => {
                    console.log("Error");
                })
        })
    }

    const AddData = (task) => {
        if (!task == '') {
            db.transaction((tx) => {
                tx.executeSql("INSERT INTO todo (task,date,time,selected,emoji) values (?,?,?,?,?)", [task, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), 'false', ''],
                    (sql, rs) => {
                        GetData()
                    }, error => {
                        console.log("Error");
                    })
            })
        }
    }

    const GetData = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS todo (id INTEGER PRIMARY KEY AUTOINCREMENT, task VARCHAR(100) NOT NULL, date VARCHAR(20) NOT NULL, time VARCHAR(20) NOT NULL, selected VARCHAR(20) NOT NULL, emoji VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM todo", [],
                        (sql, rs) => {
                            if (rs.rows.length == 0) {
                                setData(null)
                                setSelected(null)
                            } else {
                                let results = []
                                for (let i = 0; i < rs.rows.length; i++) {
                                    let id = rs.rows._array[i].id
                                    let task = rs.rows._array[i].task
                                    let date = rs.rows._array[i].date
                                    let time = rs.rows._array[i].time
                                    let selected = rs.rows._array[i].selected
                                    let emoji = rs.rows._array[i].emoji

                                    results.push({ id: id, task: task, date: date, time: time, selected: selected, emoji: emoji })
                                }
                                setData(results)


                                sql.executeSql("SELECT id FROM todo WHERE selected = 'true'", [],
                                    (sql, rs) => {
                                        if (rs.rows.length === 0) {
                                            setSelected(null)
                                        } else {
                                            let select = []
                                            for (let i = 0; i < rs.rows.length; i++) {
                                                let id = rs.rows._array[i].id
                                                select.push({ id: id })
                                            }

                                            setSelected(select)
                                        }
                                    }, error => {
                                        console.log("Error");
                                    })
                            }
                        }, error => {
                            console.log(error);
                        })
                }, error => {
                    console.log("Error");
                })
        })
    }

    const DeleteItemsVerify = () => {
        setDialog(true)
        setDialogMessage('Are you sure you want to delete all selected tasks?')
    }
    const DeleteAllVerify = () => {
        setDialog(true)
        setDialogMessage('Are you sure you want to delete all tasks?')
    }

    const FinallyDelete = () => {
        if (dialogMessage == 'Are you sure you want to delete all tasks?') {
            setDialog(false)
            db.transaction(tx=>{
                tx.executeSql("DELETE FROM todo",[],
                (sql,rs)=>{
                    GetData()
                    ToastAndroid.show('Deleted', ToastAndroid.SHORT)
                }, error=>{
                    console.log("Error");
                })
            })
        } else {
            setDialog(false)
            setDialogMessage('')
            db.transaction((tx) => {
                for (let i = 0; i < selected.length; i++) {
                    tx.executeSql("DELETE FROM todo WHERE id = (?)", [selected[i].id],
                        (sql, rs) => {
                            GetData()
                        }, error => {
                            console.log("Error");
                        })
                }
                ToastAndroid.show('Deleted', ToastAndroid.SHORT)
            })
        }
    }

    const SelectItem = (id) => {
        db.transaction((tx) => {
            tx.executeSql("SELECT selected FROM todo WHERE id = (?)", [id],
                (sql, rs) => {
                    if (rs.rows._array[0].selected === 'false') {
                        sql.executeSql("UPDATE todo set selected = 'true' WHERE id = (?)", [id],
                            (sql, rs) => {
                                GetData()
                            }, error => {
                                console.log("Error");
                            })
                    } else {
                        sql.executeSql("UPDATE todo set selected = 'false' WHERE id = (?)", [id],
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

    useEffect(() => {
        CheckFirstTime()
        GetData()
    }, [])

    return (
        <SafeAreaView style={[Styles.container, { justifyContent: 'space-around' }]}>
            <View style={{ width: screenWidth, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                <TouchableOpacity style={{ marginTop: 20, marginStart: 25 }}>
                    <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01" />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {selected ?
                        <TouchableOpacity style={{ marginTop: 20, marginEnd: 20 }} onPress={() => {
                            DeleteItemsVerify()
                        }}>
                            <Ionicons name="trash-outline" size={25} color="#FFBC01" />
                        </TouchableOpacity>
                        :
                        null}
                    {data?
                        <Menu visible={menuVisible} onDismiss={() => { setMenuVisible(false) }} anchor={<TouchableOpacity style={{ marginTop: 20, marginEnd: 25 }}
                        onPress={() => { setMenuVisible(true) }}>
                        <MaterialComIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                    </TouchableOpacity>}>
                        <Menu.Item onPress={() => { 
                            setMenuVisible(false)
                            DeleteAllVerify() }} title="Delete All" theme={{ colors: { onSurface: 'red', onSurfaceVariant: 'red' } }} leadingIcon='delete' />
                    </Menu>
                    :
                    null}
                </View>
            </View>
            {data ?
                <View style={{ marginTop: 20, width: screenWidth, flex: 1, alignItems: 'center' }}>
                    <Text style={{
                        alignSelf: 'flex-start', marginTop: 20, marginBottom: 20, marginStart: 25, fontSize: 25,
                        fontWeight: 'bold'
                    }}>ToDo List</Text>
                    <FlatList
                        data={data}
                        style={{ flex: 1, marginBottom: 10 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={item => {
                            return (
                                <View style={{ marginTop: 10 }}>
                                    <View style={{
                                        width: screenWidth - 40, borderRadius: 10, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#404040' : '#dedede', backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', flexDirection: 'row',
                                        alignItems: 'center', justifyContent: 'space-between'
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                                                <MaterialComIcons name="sticker-emoji" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                            </TouchableOpacity>
                                            <Text style={{ marginStart: 20, fontSize: 18, width: 200, paddingVertical: 15, fontWeight: 'bold', textDecorationLine: item.item.selected === 'true' ? 'line-through' : 'none' }}
                                            >{item.item.task.slice(0, 150).trim()}</Text>
                                        </View>
                                        <RadioButton status={item.item.selected == 'true' ? "checked" : 'unchecked'} onPress={() => { SelectItem(item.item.id) }} />
                                    </View>
                                </View>
                            )
                        }}
                        keyExtractor={item => item.id}
                    />
                </View>
                :
                <View style={{ flex: 1, width: screenWidth, alignItems: 'center', justifyContent: 'center' }}>
                    <AnimatedLottieView
                        source={require('../assets/archiveempty.json')} renderMode="HARDWARE"
                        style={{ width: screenWidth, marginTop: -20 }} useNativeLooping loop autoPlay
                    />
                    <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>ToDo List is Empty, Try adding some!</Text>
                </View>}
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-evenly', width: screenWidth, marginBottom: 20 }}>
                <TextInput placeholder="Add new ToDo" style={{ width: screenWidth - 100, paddingStart: 10, paddingTop: 5, paddingBottom: 5, paddingEnd: 10 }}
                    underlineColor="transparent" outlineStyle={{ borderRadius: 20 }} multiline={false} maxLength={150}
                    cursorColor="#FFBC01" selectionColor="#FFBC01" mode="outlined" ref={inputRef}
                    activeUnderlineColor="transparent" value={task} onChangeText={(txt) => { setTask(txt) }}
                />
                <TouchableOpacity style={{
                    width: 55, height: 55, backgroundColor: '#FFBC01', borderRadius: 30, alignItems: 'center',
                    justifyContent: 'center'
                }} onPress={() => {
                    inputRef.current.blur()
                    AddData(task.trim())
                    setTask('')
                }}>
                    <MaterialIcons name="add" size={25} color="white" />
                </TouchableOpacity>
                <Portal>
                    <Dialog visible={dialog} onDismiss={() => { setDialog(false) }}>
                        <Dialog.Content><Text variant="bodyMedium">{dialogMessage}</Text></Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => { setDialog(false) }}>Cancel</Button>
                            <Button onPress={() => { FinallyDelete() }}>Delete</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </SafeAreaView>
    )
}

export default ToDo