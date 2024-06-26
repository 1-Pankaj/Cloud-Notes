import React, { useCallback, useEffect, useRef, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Animated, Appearance, BackHandler, Dimensions, Easing, FlatList, TextInput, ToastAndroid, TouchableHighlight, TouchableOpacity, View } from "react-native";
import { Button, Dialog, Modal, Portal, Surface, Text, TouchableRipple } from "react-native-paper";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen'
import { useIsFocused } from "@react-navigation/native";
import { Drawer, ExpandableSection } from "react-native-ui-lib";
import AnimatedLottieView from "lottie-react-native";

const db = SQLite.openDatabase('CloudNotes.db')

const screenWidth = Dimensions.get('window').width

const Folder = (props) => {

    const [openModal, setOpenModal] = useState(false)
    const [folderName, setFolderName] = useState('')
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [data, setData] = useState(null)
    const [newFoldername, setNewFoldername] = useState('')
    const [folderId, setFolderId] = useState('')
    const [expanded, setExpanded] = useState(false)
    const spinValue = new Animated.Value(0);
    const [visible, setVisible] = React.useState(false);
    const [dialogMessage, setDialogMessage] = useState('')
    const [deleteFolderId, setDeleteFolderId] = useState('')
    const [page, setPage] = useState('')
    const [moveId, setMoveId] = useState('')
    const [moveFolder, setMoveFolder] = useState('')
    const [extraName, setExtraName] = useState('')
    const [allCount, setAllCount] = useState(0)
    const [currentlyMovingFolderId, setCurrentlyMovingFolderId] = useState('')
    const [renameId, setRenameId] = useState('')
    const [renameModal, setRenameModal] = useState(false)
    const [currentExtraName, setCurrentExtraName] = useState('')
    const [currentNoteCount, setCurrentNoteCount] = useState(0)
    const renameRef = useRef(null)

    const showDialog = () => setVisible(true);

    const hideDialog = () => setVisible(false);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg']
    })

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const OpenCreateFolderModal = () => {
        setOpenModal(true)
        setFolderName('')
    }

    const AnimateExpansion = (id) => {

    }

    const CreateTable = () => {
        db.transaction((tx) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS allfolders(id INTEGER PRIMARY KEY AUTOINCREMENT, folderName VARCHAR(20) NOT NULL, date VARCHAR(20) NOT NULL, time VARCHAR(20) NOT NULL, expanded Boolean NOT NULL, extraName VARCHAR(20) NOT NULL)', [],
                (sql, rs) => {
                }, error => {
                })
        })
    }

    const GetData = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM allfolders", [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let results = []
                        for (let i = 0; i < rs.rows.length; i++) {
                            let id = rs.rows._array[i].id
                            let folderName = rs.rows._array[i].folderName
                            let date = rs.rows._array[i].date
                            let time = rs.rows._array[i].time
                            let count = 0
                            let expanded = rs.rows._array[i].expanded
                            let extraName = rs.rows._array[i].extraName

                            sql.executeSql(`SELECT * FROM ${folderName}`, [],
                                (sql, rs) => {
                                    count = rs.rows.length
                                    results.push({ id: id, folderName: folderName, date: date, time: time, count: count, expanded: expanded, extraName: extraName })
                                }, error => {
                                })

                        }

                        setData(results)
                    } else {
                        setData(null)
                    }
                }, error => {
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT id FROM notes", [],
                (sql, rs) => {
                    setAllCount(rs.rows.length)
                }, error => {
                })
        })
    }


    const CreateNewFolder = () => {
        if (folderName.trim() == '' || folderName.includes(' ')) {
            ToastAndroid.show("Read Folder naming conditions!", ToastAndroid.SHORT)
        } else {
            db.transaction((tx) => {
                tx.executeSql("SELECT folderName from allfolders", [],
                    (sql, rs) => {

                        if (rs.rows.length > 0) {
                            for (let i = 0; i < rs.rows.length; i++) {
                                let foldername = rs.rows._array[i].folderName

                                if (folderName == foldername) {
                                    ToastAndroid.show('Folder with this name already exists', ToastAndroid.SHORT)
                                } else {
                                    sql.executeSql("INSERT INTO allfolders(folderName, date, time, expanded, extraName) values (?,?,?,?,?)", [folderName.trim(), new Date().toLocaleDateString(), new Date().toLocaleTimeString(), false, folderName.trim()],
                                        (sql, rs) => {
                                            sql.executeSql(`CREATE TABLE ${folderName}(id INTEGER PRIMARY KEY AUTOINCREMENT,title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)`, [],
                                                (sql, rs) => {
                                                    GetData()
                                                    setFolderName('')
                                                    setOpenModal(false)
                                                }, error => {
                                                })
                                        }, error => {
                                        })
                                }
                            }
                        } else {
                            sql.executeSql("INSERT INTO allfolders(folderName, date, time, expanded, extraName) values (?,?,?,?,?)", [folderName.trim(), new Date().toLocaleDateString(), new Date().toLocaleTimeString(), false, folderName.trim()],
                                (sql, rs) => {
                                    sql.executeSql(`CREATE TABLE ${folderName}(id INTEGER PRIMARY KEY AUTOINCREMENT,title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)`, [],
                                        (sql, rs) => {
                                            GetData()
                                            setFolderName('')
                                            setOpenModal(false)
                                        }, error => {
                                        })
                                }, error => {
                                })
                        }
                    }, error => {
                    })
            })
        }
    }

    const MoveToAllNotes = () => {
        if (page == 'Home') {
            ToastAndroid.show("Note already exists in All Notes", ToastAndroid.SHORT)
        } else {
            db.transaction((tx) => {
                tx.executeSql(`SELECT * FROM ${moveFolder} WHERE id = (?)`, [moveId],
                    (sql, rs) => {
                        if (rs.rows.length > 0) {
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
                                    sql.executeSql(`DELETE FROM ${moveFolder} WHERE id = (?)`, [moveId],
                                        (sql, rs) => {
                                            ToastAndroid.show("Moved", ToastAndroid.SHORT)
                                            props.navigation.navigate('Folder')
                                            setMoveFolder('')
                                            setMoveId('')
                                        }, error => { })
                                }, error => {
                                })
                        }
                    }, error => { })
            })
        }
    }

    const MoveToThisFolder = (id) => {
        if (page == 'Home') {
            db.transaction((tx) => {
                tx.executeSql('SELECT * FROM notes WHERE id = (?)', [moveId],
                    (sql, rs) => {
                        if (rs.rows.length > 0) {
                            let title = rs.rows._array[0].title
                            let note = rs.rows._array[0].note
                            let date = rs.rows._array[0].date
                            let time = rs.rows._array[0].time
                            let pageColor = rs.rows._array[0].pageColor
                            let fontColor = rs.rows._array[0].fontColor
                            let fontStyle = rs.rows._array[0].fontStyle
                            let fontSize = rs.rows._array[0].fontSize
                            sql.executeSql("SELECT * FROM allfolders where id = (?)", [id],
                                (sql, rs) => {
                                    let foldername = rs.rows._array[0].folderName
                                    let extraName = rs.rows._array[0].extraName
                                    sql.executeSql(`INSERT INTO ${foldername}(title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)`, [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                        (sql, rs) => {
                                            sql.executeSql("DELETE FROM notes WHERE id = (?)", [moveId],
                                                (sql, rs) => {
                                                    ToastAndroid.show('Moved', ToastAndroid.SHORT)
                                                    props.navigation.goBack()
                                                }, error => {
                                                })
                                        }, error => {
                                        })
                                }, error => {
                                })
                        }
                    }, error => {
                    })
            })
        } else {
            db.transaction((tx) => {
                tx.executeSql("SELECT * FROM allfolders WHERE id = (?)", [id],
                    (sql, rs) => {
                        if (rs.rows.length > 0) {
                            let foldername = rs.rows._array[0].folderName
                            sql.executeSql(`SELECT * FROM ${foldername}`, [],
                                (sql, rs) => {
                                    if (rs.rows.length > 0) {
                                        sql.executeSql(`SELECT * FROM ${moveFolder} WHERE id = (?)`, [moveId],
                                            (sql, rs) => {
                                                let title = rs.rows._array[0].title
                                                let note = rs.rows._array[0].note
                                                let date = rs.rows._array[0].date
                                                let time = rs.rows._array[0].time
                                                let pageColor = rs.rows._array[0].pageColor
                                                let fontColor = rs.rows._array[0].fontColor
                                                let fontStyle = rs.rows._array[0].fontStyle
                                                let fontSize = rs.rows._array[0].fontSize

                                                sql.executeSql(`SELECT * FROM ${foldername} WHERE title = (?) and note = (?)`, [title, note],
                                                    (sql, rs) => {
                                                        if (rs.rows.length > 0) {
                                                            ToastAndroid.show("Note already exists in selected folder", ToastAndroid.SHORT)
                                                        } else {
                                                            sql.executeSql(`INSERT INTO ${foldername}(title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)`, [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                                                (sql, rs) => {
                                                                    sql.executeSql(`DELETE FROM ${moveFolder} WHERE id = (?)`, [moveId],
                                                                        (sql, rs) => {
                                                                            ToastAndroid.show('Moved', ToastAndroid.SHORT)
                                                                            setMoveFolder('')
                                                                            setMoveId('')
                                                                            GetData()
                                                                        }, error => {
                                                                        })
                                                                }, error => {
                                                                })
                                                        }
                                                    }, error => {
                                                    })
                                            }, error => {
                                            })
                                    } else {
                                        sql.executeSql(`SELECT * FROM ${moveFolder} WHERE id = (?)`, [moveId],
                                            (sql, rs) => {
                                                if (rs.rows.length > 0) {
                                                    let title = rs.rows._array[0].title
                                                    let note = rs.rows._array[0].note
                                                    let date = rs.rows._array[0].date
                                                    let time = rs.rows._array[0].time
                                                    let pageColor = rs.rows._array[0].pageColor
                                                    let fontColor = rs.rows._array[0].fontColor
                                                    let fontStyle = rs.rows._array[0].fontStyle
                                                    let fontSize = rs.rows._array[0].fontSize
                                                    sql.executeSql(`INSERT INTO ${foldername}(title,note,date,time,pageColor,fontColor,fontStyle,fontSize) values (?,?,?,?,?,?,?,?)`, [title, note, date, time, pageColor, fontColor, fontStyle, fontSize],
                                                        (sql, rs) => {
                                                            sql.executeSql(`DELETE FROM ${moveFolder} WHERE id = (?)`, [moveId],
                                                                (sql, rs) => {
                                                                    ToastAndroid.show('Moved', ToastAndroid.SHORT)
                                                                    setMoveFolder('')
                                                                    setMoveId('')
                                                                    GetData()
                                                                }, error => {
                                                                })
                                                        }, error => {
                                                        })

                                                }
                                            }, error => {
                                            })

                                    }
                                }, error => {
                                })
                        }
                    }, error => {
                    })
            })
        }
    }


    const DeleteFolder = (id) => {
        setDeleteFolderId(id)
        showDialog()
        setDialogMessage("Once deleted folder can't be recovered! Are you sure?")
    }

    const GetRenameData = (id) => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM allfolders WHERE id = (?)", [id],
                (sql, rs) => {
                    let extraname = rs.rows._array[0].extraName
                    let foldername = rs.rows._array[0].folderName

                    setRenameId(id)
                    setCurrentExtraName(extraname)
                    sql.executeSql(`select * from ${foldername}`, [],
                        (sql, rs) => {
                            setCurrentNoteCount(rs.rows.length)
                            setRenameModal(true)
                            renameRef.current.focus()
                        }, error => { })
                }, error => { })
        })
    }

    const RenameFolder = () => {
        if (currentExtraName.trim()) {
            db.transaction((tx) => {
                tx.executeSql(`update allfolders set extraName = (?) WHERE id = (?)`, [currentExtraName, renameId],
                    (sql, rs) => {
                        GetData()
                        setRenameModal(false)
                        setRenameId('')
                    }, error => { })
            })
        }
    }

    const FinallyDelete = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM allfolders WHERE id = (?)", [deleteFolderId],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
                        let foldernm = rs.rows._array[0].folderName
                        sql.executeSql(`DROP TABLE ${foldernm}`, [],
                            (sql, rs) => {
                                sql.executeSql("DELETE FROM allfolders WHERE id = (?)", [deleteFolderId],
                                    (sql, rs) => {
                                        hideDialog()
                                        ToastAndroid.show("Deleted folder " + foldernm, ToastAndroid.SHORT)
                                        GetData()
                                        setExpanded(false)
                                    }, error => {
                                    })
                            }, error => {
                            })
                    }
                }, error => {
                })
        })
    }


    function handleBackButtonClick() {
        if (moveFolder) {
            setMoveFolder('')
            setMoveId('')
            return true
        } else {
            props.navigation.goBack()
            return true
        }
    }

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener("hardwareBackPress", handleBackButtonClick);
        };
    }, [])


    const isFocused = useIsFocused()

    useEffect(() => {
        CreateTable()
        GetData()

        if (props.route.params == undefined) {

        } else {
            setMoveFolder(props.route.params.folderName)
            setPage(props.route.params.page)
            setMoveId(props.route.params.id)
            setExtraName(props.route.params.extraName)
        }
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
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginStart: 10 }}
                    onPress={() => {
                        moveFolder ?
                            setMoveFolder('')
                            :
                            props.navigation.goBack()
                    }}>
                    {moveFolder ?
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="close" size={27} color="#FFBC01" />
                            <Text style={{ fontSize: 23, color: '#FFBC01', fontWeight: 'bold', marginStart: 10, marginBottom: 2 }}>Move To</Text>
                        </View>
                        :
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <MaterialIcons name="arrow-back-ios" size={27} color="#FFBC01" />
                            <Text style={{ fontSize: 23, color: '#FFBC01', fontWeight: 'bold' }}>My Folders</Text>
                        </View>}
                </TouchableOpacity>
            </View>
            {moveFolder ?
                <TouchableHighlight style={{ borderRadius: 10, marginTop: 50 }} activeOpacity={0.6} onPress={() => {
                    MoveToAllNotes()
                }} underlayColor={colorScheme === 'dark' ? '#303030' : 'lightgray'}>
                    <View style={{ width: screenWidth - 30, backgroundColor: colorScheme === 'dark' ? '#303030' : 'white', borderRadius: 10, alignItems: 'center' }}>
                        <View style={{ width: '90%', flexDirection: 'row', alignItems: 'center', height: 55, justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialIcons name="folder" size={28} color="#FFBC01" />
                                <Text style={{ color: colorScheme === 'dark' ? 'white' : '#303030', fontSize: 16, marginStart: 20 }}>All Notes</Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ marginEnd: 20, fontSize: 18 }}>{allCount}</Text>
                                <MaterialIcons name="arrow-forward-ios" size={20} color="#FFBC01" />
                            </View>
                        </View>
                    </View>
                </TouchableHighlight>
                :
                null}
            {data ?
                <View style={{ width: screenWidth, alignItems: 'center', flex: 1 }}>
                    <Text style={{ fontFamily: 'mulish', fontSize: 18, alignSelf: 'flex-start', marginTop: 40, marginStart: 25 }}>All Folders</Text>
                    <FlatList
                        data={data}
                        style={{ marginTop: 20 }}
                        key={item => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={(item) => {
                            return (
                                <Drawer disableHaptic
                                    leftItem={{
                                        text: 'Open', background: '#FFBC01', onPress: () => {
                                            props.navigation.navigate('OpenFolder', {
                                                id: item.item.id,
                                                foldername: item.item.folderName,
                                                extraname: item.item.extraName,
                                                index: item.index
                                            })
                                        }
                                    }} fullLeftThreshold={0.7} fullRightThreshold={0.7}
                                    rightItems={[{ text: 'Delete', onPress: () => { DeleteFolder(item.item.id) }, background: 'red' }, {
                                        text: 'Rename', onPress: () => {
                                            GetRenameData(item.item.id)
                                        }
                                    }]} onFullSwipeRight={() => { DeleteFolder(item.item.id) }} fullSwipeLeft fullSwipeRight onFullSwipeLeft={() => {
                                        props.navigation.navigate('OpenFolder', {
                                            id: item.item.id,
                                            foldername: item.item.folderName,
                                            extraname: item.item.extraName,
                                            index: item.index
                                        })
                                    }} style={{ marginTop: 15, borderRadius: 10 }}>
                                    <TouchableHighlight style={{ borderRadius: 10 }} activeOpacity={0.6}
                                        onLongPress={() => {
                                            GetRenameData(item.item.id)
                                        }} onPress={() => {
                                            moveFolder ?
                                                MoveToThisFolder(item.item.id)
                                                :
                                                props.navigation.navigate('OpenFolder', {
                                                    id: item.item.id,
                                                    foldername: item.item.folderName,
                                                    extraname: item.item.extraName,
                                                    index: item.index
                                                })
                                        }} underlayColor={colorScheme === 'dark' ? '#303030' : 'lightgray'}>
                                        <View style={{ width: screenWidth - 30, backgroundColor: colorScheme === 'dark' ? '#303030' : 'white', borderRadius: 10, alignItems: 'center' }}>
                                            <View style={{ width: '90%', flexDirection: 'row', alignItems: 'center', height: 55, justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <MaterialIcons name="folder" size={28} color="#FFBC01" />
                                                    <Text style={{ color: colorScheme === 'dark' ? 'white' : '#303030', fontSize: 16, marginStart: 20, }}>{item.item.extraName}</Text>
                                                </View>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={{ marginEnd: 20, fontSize: 18 }}>{item.item.count}</Text>
                                                    <Animated.View style={{
                                                        transform: [{
                                                            rotate: spin
                                                        }]
                                                    }}>
                                                        <MaterialIcons name="arrow-forward-ios" size={20} color="#FFBC01" />
                                                    </Animated.View>
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
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'space-around' }}>
                    <AnimatedLottieView
                        source={require('../assets/folderanim.json')} autoPlay loop style={{ width: screenWidth }}
                    />
                    <Text style={{ fontSize: 18 }}>No folders found, try creating one!</Text>
                </View>}
            <View style={{ width: screenWidth, marginVertical: 10 }}>
                <Surface style={{ alignSelf: 'flex-end', marginEnd: 20, borderRadius: 50 }}>
                    <TouchableRipple borderless style={{
                        width: 60, height: 60, backgroundColor: '#FFBC01', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 50
                    }}
                        onPress={() => { OpenCreateFolderModal() }} rippleColor='#F0CA5E'>
                        <View style={{
                            width: 60, height: 60, backgroundColor: '#FFBC01', alignItems: 'center', justifyContent: 'center',
                            borderRadius: 50
                        }}>
                            <MaterialIcons name="add" size={35} color="white" />
                        </View>
                    </TouchableRipple>
                </Surface>
            </View>
            <Modal visible={openModal} dismissableBackButton onDismiss={() => {
                setOpenModal(false)
                setFolderName('')
            }} style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
                <View style={{ width: screenWidth, height: 275, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#f4f4f4', borderTopStartRadius: 20, borderTopEndRadius: 20, alignItems: 'center' }}>
                    <View style={{ width: screenWidth - 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15 }}>
                        <TouchableOpacity onPress={() => {
                            setOpenModal(false)
                            setFolderName('')
                        }}>
                            <MaterialIcons name="close" size={25} color='gray' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            CreateNewFolder()
                        }}>
                            <MaterialIcons name="done" size={25} color="#FFBC01" />
                        </TouchableOpacity>
                    </View>

                    <View style={{
                        width: '90%', height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : 'white', borderRadius: 10, marginTop: 50,
                        alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between'
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginStart: 20 }}>
                            <MaterialIcons name="create-new-folder" size={30} color="#FFBC01" />
                            <TextInput placeholder="Folder Name" style={{ marginStart: 20, marginEnd: 20, color: colorScheme === 'dark' ? 'white' : '#101010' }} numberOfLines={1}
                                maxLength={20} value={folderName} onChangeText={(text) => { setFolderName(text) }} cursorColor="#FFBC01" blurOnSubmit
                                placeholderTextColor={colorScheme === 'dark' ? 'gray' : 'gray'}
                                autoFocus />
                        </View>
                        <MaterialIcons name="arrow-forward-ios" size={20} style={{ marginEnd: 20 }} color="#FFBC01" />
                    </View>
                    <Text style={{ marginTop: 30, fontFamily: 'mulish', fontSize: 13, marginHorizontal: 30, textAlign: 'center' }}>
                        Space, emojis, special characters not allowed, only Underscores ( _ ) allowed. Use small case, upper case or camel casing for naming folder. Two folder names can't be same and must be unique.
                    </Text>
                </View>
            </Modal>
            <Portal>
                <Dialog visible={visible} onDismiss={hideDialog}>
                    <Dialog.Title>Read before deleting!</Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">{dialogMessage}</Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => {
                            hideDialog()
                            GetData()
                        }}>Cancel</Button>
                        <Button onPress={FinallyDelete} labelStyle={{ color: 'red' }} mode="text">Delete</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Modal style={{ alignItems: 'center', justifyContent: 'center' }} visible={renameModal} dismissable dismissableBackButton onDismiss={() => { setRenameModal(false) }}>
                <View style={{ padding: 10, width: screenWidth - 35, borderRadius: 20, backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : 'white' }}>

                    <Text style={{ marginStart: 30, marginTop: 20, marginBottom: 10, fontWeight: 'bold', fontSize: 20, color: '#FFBC01' }}>Rename Folder</Text>
                    <TextInput style={{ color: colorScheme === 'dark' ? 'white' : '#303030', fontSize: 16, marginStart: 20, padding: 10, width: '90%' }} placeholder={currentExtraName}
                        placeholderTextColor={colorScheme === 'dark' ? 'gray' : 'lightgray'} cursorColor="#FFBC01" selectTextOnFocus value={currentExtraName}
                        selectionColor="#FFBC01" ref={renameRef} onChangeText={(txt) => { setCurrentExtraName(txt) }} underlineColorAndroid="#FFBC01"
                    />
                    <View style={{ width: '100%', alignItems: 'flex-end', marginTop: 30, marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Button onPress={() => {
                                setRenameModal(false)
                                setRenameId('')
                            }}>Cancel</Button>
                            <Button
                                onPress={() => {
                                    RenameFolder()
                                    GetData()
                                    setRenameModal(false)
                                    setRenameId('')
                                }}>Rename</Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default Folder