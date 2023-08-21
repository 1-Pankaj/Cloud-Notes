import React, { useEffect, useRef, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { Appearance, Dimensions, ToastAndroid, TouchableOpacity, View, TextInput as TextInputBasic, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Button, Dialog, Menu, Modal, Portal, RadioButton, Text, TextInput } from "react-native-paper";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialComIcons from '@expo/vector-icons/MaterialCommunityIcons'
import AnimatedLottieView from "lottie-react-native";
import Ionicons from '@expo/vector-icons/Ionicons'
import { useIsFocused } from "@react-navigation/native";

const emojis = require('../emojis.json')

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
    const [emojiModal, setEmojiModal] = useState(false)
    const [emoji, setEmoji] = useState('')
    const [idEmoji, setIdEmoji] = useState('')
    const [emojiData1, setEmojiData1] = useState(null)
    const [emojiData2, setEmojiData2] = useState(null)
    const [emojiData3, setEmojiData3] = useState(null)
    const [emojiData4, setEmojiData4] = useState(null)
    const [emojiData5, setEmojiData5] = useState(null)
    const [category, setEmojiCategory] = useState('')

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

    const setEmojiInDatabase = () =>{
        db.transaction((tx)=>{
            if(!emoji == ''){
                tx.executeSql("UPDATE todo SET emoji = (?) where id = (?)", [emoji,idEmoji],
                (sql,rs)=>{
                    GetData()
                    setEmojiModal(false)
                    setEmoji('')
                }, error =>{
                    console.log("Error");
                })
            }
        })
        
    }

    const OpenEmojiModal = (id) => {
        setEmojiModal(true)
        setIdEmoji(id)
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
            db.transaction(tx => {
                tx.executeSql("DELETE FROM todo", [],
                    (sql, rs) => {
                        GetData()
                        ToastAndroid.show('Deleted', ToastAndroid.SHORT)
                    }, error => {
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

    const GetEmojiData = () => {
        let results = []
        for (let i = 0; i<50; i++){
            results.push({emoji:emojis[i].emoji})
        }

        let results1 = []
        for (let i = 50; i<100; i++){
            results1.push({emoji:emojis[i].emoji})
        }
        let results2 = []
        for (let i = 100; i<150; i++){
            results2.push({emoji:emojis[i].emoji})
        }
        let results3 = []
        for (let i = 150; i<200; i++){
            results3.push({emoji:emojis[i].emoji})
        }
        let results4 = []
        for (let i = 200; i<250; i++){
            results4.push({emoji:emojis[i].emoji})
        }
        

        setTimeout(() => {
            setEmojiData1(results)
            setEmojiData2(results1)
            setEmojiData3(results2)
            setEmojiData4(results3)
            setEmojiData5(results4)
        }, 200);
    }



    const isFocused = useIsFocused()

    useEffect(() => {
        CheckFirstTime()
        GetData()
        GetEmojiData()
    }, [isFocused])

    return (
        <SafeAreaView style={[Styles.container, { justifyContent: 'space-around' }]}>
            <View style={{ width: screenWidth, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                <TouchableOpacity style={{ marginTop: 20, marginStart: 25 }} onPress={() => { props.navigation.navigate('Home') }}>
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
                    {data ?
                        <Menu visible={menuVisible} onDismiss={() => { setMenuVisible(false) }} anchor={<TouchableOpacity style={{ marginTop: 20, marginEnd: 25 }}
                            onPress={() => { setMenuVisible(true) }}>
                            <MaterialComIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                        </TouchableOpacity>}>
                            <Menu.Item onPress={() => {
                                setMenuVisible(false)
                                DeleteAllVerify()
                            }} title="Delete All" theme={{ colors: { onSurface: 'red', onSurfaceVariant: 'red' } }} leadingIcon='delete' />
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
                                            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', padding: 10 }}
                                                onPress={() => { OpenEmojiModal(item.item.id) }}>
                                                {item.item.emoji == ''?
                                                <MaterialComIcons name="sticker-emoji" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                                :
                                                <Text style={{fontSize:20}}>{item.item.emoji}</Text>}
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
                        source={require('../assets/todoempty.json')} renderMode="HARDWARE"
                        style={{ width: screenWidth, height: 300, marginTop: -30 }} useNativeLooping loop autoPlay
                    />
                    <Text style={{ fontWeight: 'bold', fontSize: 17, textAlign: 'center', marginVertical: 20 }}>ToDo List is Empty, Try adding some!</Text>
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
                    <Dialog visible={dialog} onDismiss={() => { 
                        setEmoji('')
                        setDialog(false) }}>
                        <Dialog.Content><Text variant="bodyMedium">{dialogMessage}</Text></Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => { setDialog(false) }}>Cancel</Button>
                            <Button onPress={() => { FinallyDelete() }}>Delete</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <Portal>
                    <Modal visible={emojiModal} onDismiss={() => { setEmojiModal(false) }} style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                        <View style={{ width: screenWidth, height: 400, backgroundColor: 'white', borderTopStartRadius: 20, borderTopEndRadius: 20, alignItems: 'center' }}>
                            <View style={{ width: 50, height: 5, borderRadius: 10, backgroundColor: 'lightgray', marginTop: 8 }} />
                            <View style={{
                                alignItems: 'flex-start', justifyContent: 'center', width: screenWidth - 50, height: 35, borderRadius: 20, backgroundColor: '#e3e3e3',
                                alignSelf: 'flex-start', margin: 25
                            }}>
                                <Text style={{alignSelf:'center', fontSize:17}}>{emoji? emoji : 'Selected Emoji'}</Text>
                            </View>
                            <ScrollView style={{width:screenWidth,flex:1}}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{alignItems:'center',flexDirection:'row', justifyContent:'center', width:screenWidth, paddingHorizontal:0}}>
                                <FlatList
                                data={emojiData1}
                                style={{marginStart:30}}
                                scrollEnabled={false}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item=>item.emoji}
                                    renderItem={(item)=>{return(
                                        <TouchableOpacity style={{marginTop:5}} onPress={()=>{
                                            setEmoji(item.item.emoji)
                                        }}>
                                            <Text style={{fontSize:25}}>{item.item.emoji}</Text>
                                        </TouchableOpacity>
                                    )}}
                                />
                                <FlatList
                                data={emojiData2}
                                scrollEnabled={false}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item=>item.emoji}
                                    renderItem={(item)=>{return(
                                        <TouchableOpacity style={{marginTop:5}} onPress={()=>{
                                            setEmoji(item.item.emoji)
                                        }}>
                                            <Text style={{fontSize:25}}>{item.item.emoji}</Text>
                                        </TouchableOpacity>
                                    )}}
                                />
                                <FlatList
                                data={emojiData3}
                                scrollEnabled={false}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item=>item.emoji}
                                    renderItem={(item)=>{return(
                                        <TouchableOpacity style={{marginTop:5}} onPress={()=>{
                                            setEmoji(item.item.emoji)
                                        }}>
                                            <Text style={{fontSize:25}}>{item.item.emoji}</Text>
                                        </TouchableOpacity>
                                    )}}
                                />
                                <FlatList
                                data={emojiData4}
                                scrollEnabled={false}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item=>item.emoji}
                                    renderItem={(item)=>{return(
                                        <TouchableOpacity style={{marginTop:5}} onPress={()=>{
                                            setEmoji(item.item.emoji)
                                        }}>
                                            <Text style={{fontSize:25}}>{item.item.emoji}</Text>
                                        </TouchableOpacity>
                                    )}}
                                />
                                <FlatList
                                data={emojiData5}
                                scrollEnabled={false}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={item=>item.emoji}
                                    renderItem={(item)=>{return(
                                        <TouchableOpacity style={{marginTop:5}} onPress={()=>{
                                            setEmoji(item.item.emoji)
                                        }}>
                                            <Text style={{fontSize:25}}>{item.item.emoji}</Text>
                                        </TouchableOpacity>
                                    )}}
                                />
                            </ScrollView>
                            <TouchableOpacity style={{width:screenWidth, height:50, backgroundColor:'white', borderTopColor:'gray', borderTopWidth:0.7,
                            alignItems:'center', justifyContent:'center'}} activeOpacity={0.6} onPress={()=>{setEmojiInDatabase()}}>
                                <Text style={{fontSize:17, fontWeight:'bold', color:'#505050'}}>Select</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </Portal>
            </View>
        </SafeAreaView>
    )
}

export default ToDo