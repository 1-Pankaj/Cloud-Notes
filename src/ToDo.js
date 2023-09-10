import React, { useEffect, useRef, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { Appearance, Dimensions, ToastAndroid, TouchableOpacity, View, TextInput as TextInputBasic, FlatList, ScrollView, BackHandler, Modal as BaseModal, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Button, DataTable, Dialog, Divider, Menu, Modal, Portal, RadioButton, Snackbar, Surface, Text } from "react-native-paper";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialComIcons from '@expo/vector-icons/MaterialCommunityIcons'
import AnimatedLottieView from "lottie-react-native";
import Ionicons from '@expo/vector-icons/Ionicons'
import { useIsFocused } from "@react-navigation/native";
import { Drawer, ProgressBar } from "react-native-ui-lib";

const emojis = require('../emojis.json')

const db = SQLite.openDatabase('CloudNotes.db')


const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height

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
    const [allCount, setAllCount] = useState(0)
    const [doneCount, setDoneCount] = useState(0)
    const [snackbarVisible, setSnackbarVisible] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [recordModal, setRecordModal] = useState(false)
    const [taskData, setTaskData] = useState(null)
    const [page, setPage] = useState(0);
    const [folderCount, setFolderCount] = useState(0)
    const [numberOfItemsPerPageList] = useState([2, 3, 4, 8]);
    const [itemsPerPage, onItemsPerPageChange] = useState(
        numberOfItemsPerPageList[0]
    );
    const [inputFocused, setInputFocused] = useState(false)
    const [emojiRecord, setEmojiRecord] = useState('')
    const [taskRecord, setTaskRecord] = useState('')
    const [progressCount, setProgressCount] = useState(0)
    const [selectedCount, setSelectedCount] = useState(0)

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
                })
        })
    }

    const GetProgress = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM todo WHERE selected = 'true'", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let selectedLength = rs.rows.length
                        sql.executeSql("SELECT * FROM todo", [],
                            (sql, rs) => {
                                let allLength = rs.rows.length
                                if (allLength > 0) {
                                    let progress = selectedLength / allLength * 100
                                    setProgressCount(progress)
                                }
                            }, error => { })
                    } else {
                        setProgressCount(0)
                    }
                }, error => {
                })
        })
    }


    useEffect(() => {
        GetProgress()
    }, [isFocused, data])
    const GetTaskData = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM recordTasks", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let results = []
                        for (let i = 0; i < rs.rows.length; i++) {
                            let id = rs.rows._array[i].id
                            let title = rs.rows._array[i].title
                            let date = rs.rows._array[i].date
                            let time = rs.rows._array[i].time
                            let tasknum = rs.rows._array[i].tasknum
                            let lastindex = tasknum.lastIndexOf('.')
                            tasknum = tasknum.slice(0, lastindex)

                            results.push({ id: id, title: title, date: date, time: time, tasknum: tasknum })
                        }

                        setTaskData(results)


                    } else {
                        setTaskData(null)
                    }
                }, error => {
                })
        })
    }

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, taskData ? taskData.length : 0);

    useEffect(() => {
        setPage(0);
    }, [itemsPerPage])

    const setEmojiInDatabase = () => {
        db.transaction((tx) => {
            if (!emoji == '') {
                tx.executeSql("UPDATE todo SET emoji = (?) where id = (?)", [emoji, idEmoji],
                    (sql, rs) => {
                        GetData()
                        setEmojiModal(false)
                        setEmoji('')
                    }, error => {
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
                    })
            })
        }
    }



    const GetData = () => {
        GetProgress()
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS todo (id INTEGER PRIMARY KEY AUTOINCREMENT, task VARCHAR(100) NOT NULL, date VARCHAR(20) NOT NULL, time VARCHAR(20) NOT NULL, selected VARCHAR(20) NOT NULL, emoji VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM todo", [],
                        (sql, rs) => {
                            if (rs.rows.length == 0) {
                                setData(null)
                                setSelected(null)
                            } else {
                                setAllCount(rs.rows.length)
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
                                        setSelectedCount(rs.rows.length)
                                        if (rs.rows.length === 0) {
                                            setSelected(null)
                                        } else {
                                            let select = []
                                            setDoneCount(rs.rows.length)
                                            for (let i = 0; i < rs.rows.length; i++) {
                                                let id = rs.rows._array[i].id
                                                select.push({ id: id })
                                            }
                                            setSelected(select)
                                            GetProgress()
                                        }
                                    }, error => {
                                    })
                            }
                        }, error => {
                        })
                }, error => {
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
                                GetProgress()
                            }, error => {
                            })
                    } else {
                        sql.executeSql("UPDATE todo set selected = 'false' WHERE id = (?)", [id],
                            (sql, rs) => {
                                GetData()
                                GetProgress()
                            }, error => {
                            })
                    }

                    sql.executeSql("SELECT * FROM todo", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                let fullLength = rs.rows.length
                                sql.executeSql("SELECT * FROM todo WHERE selected = 'true'", [],
                                    (sql, rs) => {
                                        if (rs.rows.length > 0) {
                                            let selected = rs.rows.length
                                            if (selected == fullLength) {
                                                setSnackbarVisible(true)
                                                setSnackbarMessage("You have completed all of your tasks, do you want to record this progress in Directory?")
                                                GetProgress()
                                            }
                                        }
                                    }, error => {
                                    })
                            }
                        }, error => {
                        })
                }, error => {
                })
        })

    }

    const DeleteSingle = (id) => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM todo WHERE id = (?)", [id],
                (sql, rs) => {
                    setData(null)
                    GetData()
                }, error => { })
        })
        GetProgress()
    }

    const RecordTasks = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS recordTasks(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(100) NOT NULL, date VARCHAR(20) NOT NULL, time VARCHAR(20) NOT NULL, tasknum VARCHAR(200) NOT NULL)", [],
                (sql, rs) => {
                    let title = 'Task Record For ' + new Date()
                    sql.executeSql("INSERT INTO recordTasks (title, date, time, tasknum) values (?,?,?,?)", [title, new Date().toLocaleDateString(), new Date().toLocaleTimeString(), allCount],
                        (sql, rs) => {
                            GetTaskData()
                        }, error => {
                        })
                }, error => {
                })
        })
    }

    function handleBackButtonClick() {
        if (recordModal) {
            setRecordModal(false)
            return true
        } else {
            props.navigation.goBack()
            return true
        }
    }

    const ClearTaskRecord = () => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM recordTasks", [],
                (sql, rs) => {
                    GetTaskData()
                    ToastAndroid.show("Task Records cleared", ToastAndroid.SHORT)
                }, error => {
                })
        })
    }

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [recordModal])

    const GetEmojiData = () => {
        let results = []
        for (let i = 0; i < 50; i++) {
            results.push({ emoji: emojis[i].emoji })
        }

        let results1 = []
        for (let i = 50; i < 100; i++) {
            results1.push({ emoji: emojis[i].emoji })
        }
        let results2 = []
        for (let i = 100; i < 150; i++) {
            results2.push({ emoji: emojis[i].emoji })
        }
        let results3 = []
        for (let i = 150; i < 200; i++) {
            results3.push({ emoji: emojis[i].emoji })
        }
        let results4 = []
        for (let i = 200; i < 250; i++) {
            results4.push({ emoji: emojis[i].emoji })
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
    }, [])

    useEffect(() => {
        GetData()
        GetEmojiData()
        GetTaskData()
    }, [isFocused])

    return (
        <SafeAreaView style={[Styles.container, { justifyContent: 'space-around' }]}>
            <View style={{ width: screenWidth, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                <TouchableOpacity style={{ marginTop: 20, marginStart: 10 }} onPress={() => { props.navigation.goBack() }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01" />
                        <Text style={{ fontWeight: 'bold', fontSize: 23, color: '#FFBC01', marginBottom: 2 }}>ToDo's</Text>
                    </View>
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
                    <TouchableOpacity style={{ marginTop: 20, marginEnd: 20 }} onPress={() => {
                        GetTaskData()
                        if (taskData) {
                            setRecordModal(true)
                            inputRef.current.blur()
                        } else {
                            ToastAndroid.show('No records!', ToastAndroid.SHORT)
                        }
                    }}>
                        <MaterialIcons name="history" size={25} color="#FFBC01" />
                    </TouchableOpacity>
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
                    <View style={{ flexDirection: 'row', width: screenWidth, alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{
                            alignSelf: 'flex-start', marginTop: 20, marginBottom: 20, marginStart: 25, fontSize: 25,
                            fontWeight: 'bold'
                        }}>My Progress</Text>
                        <Text style={{ marginTop: 20, marginBottom: 20, marginEnd: 25, color: '#FFBC01' }}>Tasks {selected ? selected.length : 0}/{allCount}</Text>
                    </View>
                    <ProgressBar progress={progressCount} progressColor="#FFBC01" style={{ width: '90%', height: 10 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: screenWidth }}>
                        <Text style={{
                            alignSelf: 'flex-start', marginTop: 20, marginBottom: 20, marginStart: 25, fontSize: 25,
                            fontWeight: 'bold'
                        }}>ToDo List</Text>
                    </View>
                    <FlatList
                        data={data}
                        style={{ flex: 1, marginBottom: 10 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={item => {
                            return (
                                <Drawer style={{ marginTop: 10, borderRadius: 10, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#404040' : '#dedede' }}
                                    leftItem={{ text: "Select", background: '#FFBC01', onPress: () => { SelectItem(item.item.id) } }}
                                    rightItems={[{ text: "Delete", background: 'red', onPress: () => { DeleteSingle(item.item.id) } }]}
                                    fullRightThreshold={0.7} fullSwipeRight onFullSwipeRight={() => { DeleteSingle(item.item.id) }} disableHaptic>
                                    <View style={{
                                        width: screenWidth - 40, borderRadius: 10, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#404040' : '#dedede', backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', flexDirection: 'row',
                                        alignItems: 'center', justifyContent: 'space-between'
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', padding: 10 }}
                                                onPress={() => { OpenEmojiModal(item.item.id) }}>
                                                {item.item.emoji == '' ?
                                                    <MaterialComIcons name="sticker-emoji" size={25} color={colorScheme === 'dark' ? 'white' : 'black'} />
                                                    :
                                                    <Text style={{ fontSize: 20 }}>{item.item.emoji}</Text>}
                                            </TouchableOpacity>
                                            <Text style={{ marginStart: 20, fontSize: 18, width: 200, paddingVertical: 15, fontWeight: 'bold', textDecorationLine: item.item.selected === 'true' ? 'line-through' : 'none' }}
                                            >{item.item.task.slice(0, 150).trim()}</Text>
                                        </View>
                                        <RadioButton status={item.item.selected == 'true' ? "checked" : 'unchecked'} onPress={() => { SelectItem(item.item.id) }} />
                                    </View>
                                </Drawer>
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
                <TouchableOpacity style={{ marginStart: 5 }}>
                    <MaterialIcons name="keyboard-voice" size={25} color="#FFBC01" />
                </TouchableOpacity>
                <View style={{
                    width: screenWidth - 60, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: inputFocused ? '#FFBC01' : colorScheme === 'dark' ? 'gray' : 'lightgray', backgroundColor: colorScheme === 'dark' ? '#303030' : 'white', borderRadius: 50,
                    flexDirection: 'row',
                }}>
                    <TextInputBasic placeholder="Add new ToDo" style={{ width: '75%', marginStart: 20, paddingTop: 13, paddingBottom: 13, color: colorScheme === 'dark' ? 'white' : '#101010' }}
                        underlineColor="transparent" multiline={false} maxLength={150}
                        cursorColor="#FFBC01" selectionColor="#FFBC01" ref={inputRef} onFocus={() => { setInputFocused(true) }}
                        onBlur={() => { setInputFocused(false) }} placeholderTextColor={colorScheme === 'dark' ? '#909090' : 'gray'}
                        activeUnderlineColor="transparent" value={task} onChangeText={(txt) => { setTask(txt) }}
                    />
                    <TouchableOpacity style={{
                        width: 45, height: 45, backgroundColor: '#FFBC01', borderRadius: 30, alignItems: 'center',
                        justifyContent: 'center', marginEnd: 5
                    }} onPress={() => {
                        inputRef.current.blur()
                        AddData(task.trim())
                        setTask('')
                    }}>
                        <MaterialIcons name="add" size={25} color="white" />
                    </TouchableOpacity>
                </View>

                <Portal>
                    <Modal visible={snackbarVisible} dismissable dismissableBackButton onDismiss={() => { setSnackbarVisible(false) }}
                        style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Surface style={{borderRadius:20}} mode="elevated">
                            <View style={{ width: screenWidth - 70, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : 'white', borderRadius: 20, alignItems: 'center', justifyContent: 'space-evenly' }}>
                                <Image source={require('../assets/splashicon.png')} style={{ width: 200, height: 200 }} />
                                <Text style={{
                                    marginStart: 20, marginEnd: 20, marginBottom: 20, textAlign: 'center', fontWeight: 'bold',
                                    fontSize: 23
                                }}>Do you want to record this progress in task records?</Text>
                                <Button labelStyle={{ paddingHorizontal: 80, paddingVertical:10 }} onPress={() => { RecordTasks()
                                setSnackbarVisible(false)
                                ToastAndroid.show("Recorded", ToastAndroid.SHORT) }}>Record</Button>
                                <Divider style={{ width: '90%', height: 1 }} />
                                <Button textColor="gray" labelStyle={{ paddingHorizontal: 80, paddingVertical:10 }} onPress={() => { setSnackbarVisible(false) }}>Cancel</Button>
                            </View>
                        </Surface>
                    </Modal>
                </Portal>
                <Portal>
                    <Dialog visible={dialog} onDismiss={() => {
                        setEmoji('')
                        setDialog(false)
                    }}>
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
                                <Text style={{ alignSelf: 'center', fontSize: 17 }}>{emoji ? emoji : 'Selected Emoji'}</Text>
                            </View>
                            <ScrollView style={{ width: screenWidth, flex: 1 }}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', width: screenWidth, paddingHorizontal: 0 }}>
                                <FlatList
                                    data={emojiData1}
                                    style={{ marginStart: 30 }}
                                    scrollEnabled={false}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.emoji}
                                    renderItem={(item) => {
                                        return (
                                            <TouchableOpacity style={{ marginTop: 5 }} onPress={() => {
                                                setEmoji(item.item.emoji)
                                            }}>
                                                <Text style={{ fontSize: 25 }}>{item.item.emoji}</Text>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                                <FlatList
                                    data={emojiData2}
                                    scrollEnabled={false}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.emoji}
                                    renderItem={(item) => {
                                        return (
                                            <TouchableOpacity style={{ marginTop: 5 }} onPress={() => {
                                                setEmoji(item.item.emoji)
                                            }}>
                                                <Text style={{ fontSize: 25 }}>{item.item.emoji}</Text>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                                <FlatList
                                    data={emojiData3}
                                    scrollEnabled={false}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.emoji}
                                    renderItem={(item) => {
                                        return (
                                            <TouchableOpacity style={{ marginTop: 5 }} onPress={() => {
                                                setEmoji(item.item.emoji)
                                            }}>
                                                <Text style={{ fontSize: 25 }}>{item.item.emoji}</Text>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                                <FlatList
                                    data={emojiData4}
                                    scrollEnabled={false}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.emoji}
                                    renderItem={(item) => {
                                        return (
                                            <TouchableOpacity style={{ marginTop: 5 }} onPress={() => {
                                                setEmoji(item.item.emoji)
                                            }}>
                                                <Text style={{ fontSize: 25 }}>{item.item.emoji}</Text>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                                <FlatList
                                    data={emojiData5}
                                    scrollEnabled={false}
                                    showsHorizontalScrollIndicator={false}
                                    keyExtractor={item => item.emoji}
                                    renderItem={(item) => {
                                        return (
                                            <TouchableOpacity style={{ marginTop: 5 }} onPress={() => {
                                                setEmoji(item.item.emoji)
                                            }}>
                                                <Text style={{ fontSize: 25 }}>{item.item.emoji}</Text>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                            </ScrollView>
                            <TouchableOpacity style={{
                                width: screenWidth, height: 50, backgroundColor: 'white', borderTopColor: 'gray', borderTopWidth: 0.7,
                                alignItems: 'center', justifyContent: 'center'
                            }} activeOpacity={0.6} onPress={() => { setEmojiInDatabase() }}>
                                <Text style={{ fontSize: 17, fontWeight: 'bold', color: '#505050' }}>Select</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                </Portal>
            </View>
            <Modal visible={recordModal} dismissable dismissableBackButton onDismiss={() => { setRecordModal(false) }} style={{ alignItems: 'center', justifyContent: 'flex-end', elevation: 20 }}>
                <View style={{
                    width: screenWidth, paddingVertical: 20, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#f4f4f4',
                    borderTopEndRadius: 20, borderTopStartRadius: 20, alignItems: 'center', justifyContent: 'space-evenly',
                }}>
                    {taskData ?
                        <View style={{ width: screenWidth, alignItems: 'center', alignSelf: 'center', marginTop: 30, marginBottom: 30 }}>
                            <View style={{ alignItems: 'center', width: '90%', flexDirection: 'row', justifyContent: 'space-between', marginStart: 20, marginBottom: 20, marginEnd: 20 }}>
                                <Text style={{ fontSize: 17, fontFamily: 'mulish' }}>Task Records</Text>
                                <TouchableOpacity onPress={() => {
                                    ClearTaskRecord()
                                    setRecordModal(false)
                                }}>
                                    <Text style={{ fontSize: 13, color: '#FFBC01', fontWeight: 'bold' }}>Clear</Text>
                                </TouchableOpacity>
                            </View>
                            <DataTable style={{ width: '90%', backgroundColor: colorScheme === 'dark' ? '#303030' : 'white', borderRadius: 10 }}>
                                <DataTable.Header>
                                    <DataTable.Title>Title</DataTable.Title>
                                    <DataTable.Title numeric>Date</DataTable.Title>
                                    <DataTable.Title numeric>Time</DataTable.Title>
                                    <DataTable.Title numeric>Tasks</DataTable.Title>
                                </DataTable.Header>
                                {taskData.slice(from, to).map((item, index) => {
                                    return (
                                        <DataTable.Row key={item.id} onPress={() => { setTaskRecord(item.title) }}>
                                            <DataTable.Cell>{item.title}</DataTable.Cell>
                                            <DataTable.Cell numeric>{item.date}</DataTable.Cell>
                                            <DataTable.Cell numeric>{item.time.length === 10 ? item.time.slice(0, 4) + item.time.slice(7, 10) : item.time.slice(0, 5) + item.time.slice(8, 11)}</DataTable.Cell>
                                            <DataTable.Cell numeric>{item.tasknum}</DataTable.Cell>
                                        </DataTable.Row>
                                    )
                                })}

                                <DataTable.Pagination
                                    page={page}
                                    numberOfPages={Math.ceil(taskData.length / itemsPerPage)}
                                    onPageChange={(page) => setPage(page)}
                                    label={`${from + 1}-${to} of ${taskData.length}`}
                                    numberOfItemsPerPageList={numberOfItemsPerPageList}
                                    numberOfItemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={onItemsPerPageChange}
                                    showFastPaginationControls
                                    selectPageDropdownLabel={'Rows per page'}
                                />
                            </DataTable>


                            {taskRecord ?
                                <View style={{ marginTop: 10 }}>
                                    <View style={{
                                        width: screenWidth - 40, borderRadius: 10, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#404040' : '#dedede', backgroundColor: colorScheme === 'dark' ? '#202020' : 'white', flexDirection: 'row',
                                        alignItems: 'center', justifyContent: 'space-between'
                                    }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ marginStart: 20, fontSize: 18, width: 200, paddingVertical: 15, fontWeight: 'bold', }}
                                            >{taskRecord.trim()}</Text>
                                        </View>
                                        <TouchableOpacity style={{ alignSelf: 'flex-start', marginEnd: 15, marginTop: 15 }} onPress={() => { setTaskRecord('') }}>
                                            <MaterialIcons name="close" size={15} color={colorScheme === 'dark' ? 'white' : '#101010'} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                :
                                null}


                        </View>
                        :
                        null}
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default ToDo