import React, { useCallback, useEffect, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Animated, Appearance, Dimensions, Easing, FlatList, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { Button, Dialog, Modal, Portal, Surface, Text, TouchableRipple } from "react-native-paper";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useFonts } from "expo-font";
import * as SplashScreen from 'expo-splash-screen'
import { useIsFocused } from "@react-navigation/native";
import { ExpandableSection } from "react-native-ui-lib";
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

    const AnimateExpansion = () => {
        if (expanded) {
            Animated.timing(spinValue,
                {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false
                }
            ).start(() => {
                setExpanded(false)
            })
        } else {
            Animated.timing(spinValue,
                {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: false
                }
            ).start(() => {
                setExpanded(true)
            })
        }
    }

    const CreateTable = () => {
        db.transaction((tx) => {
            tx.executeSql('CREATE TABLE IF NOT EXISTS allfolders(id INTEGER PRIMARY KEY AUTOINCREMENT, folderName VARCHAR(20) NOT NULL, date VARCHAR(20) NOT NULL, time VARCHAR(20) NOT NULL, expanded Boolean NOT NULL, extraName VARCHAR(20) NOT NULL)', [],
                (sql, rs) => {
                }, error => {
                    console.log("Eeeerror");
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
                                    console.log("ErrorFolderName");
                                })

                        }

                        setData(results)
                    } else {
                        setData(null)
                    }
                }, error => {
                    console.log("Eerror");
                })
        })
    }

    const RenameFolder = (id) => {
        if (newFoldername.trim()) {
            db.transaction((tx) => {
                tx.executeSql(`UPDATE allfolders SET extraName = (?) where id = (?)`, [newFoldername.trim(), id],
                    (sql, rs) => {
                        GetData()
                    }, error => {
                        console.log("Error");
                    })
            })
        } else {
            GetData()
        }
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
                                                    console.log("error");
                                                })
                                        }, error => {
                                            console.log("E11rror");
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
                                            console.log("error");
                                        })
                                }, error => {
                                    console.log("E11rror");
                                })
                        }
                    }, error => {
                        console.log("error");
                    })
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
                                                    props.navigation.replace('OpenFolder', {
                                                        foldername: foldername,
                                                        extraname: extraName
                                                    })
                                                }, error => {
                                                    console.log("Error");
                                                })
                                        }, error => {
                                            console.log("Error");
                                        })
                                }, error => {
                                    console.log("Error");
                                })
                        }
                    }, error => {
                        console.log("Error");
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
                                                                            props.navigation.replace('OpenFolder', {
                                                                                foldername: moveFolder,
                                                                                extraname: extraName
                                                                            })
                                                                        }, error => {
                                                                            console.log("error");
                                                                        })
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
                                                                    props.navigation.replace('OpenFolder', {
                                                                        foldername: moveFolder,
                                                                        extraname: extraName
                                                                    })
                                                                }, error => {
                                                                    console.log("error");
                                                                })
                                                        }, error => {
                                                            console.log("Error");
                                                        })

                                                }
                                            }, error => {
                                                console.log("error");
                                            })

                                    }
                                }, error => {
                                    console.log("Error");
                                })
                        }
                    }, error => {
                        console.log("Error");
                    })
            })
        }
    }


    const DeleteFolder = (id) => {
        setDeleteFolderId(id)
        showDialog()
        setDialogMessage("Once deleted folder can't be recovered! Are you sure?")
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
                                        console.log("Error");
                                    })
                            }, error => {
                                console.log("Error");
                            })
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }

    const DeleteData = () => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM allfolders", [],
                (sql, rs) => {
                    GetData()
                }, error => {
                    console.log("error");
                })
        })
    }

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
        // DeleteData()
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
            <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginStart: 10 }}
                    onPress={() => {
                        moveFolder ?
                            props.navigation.replace('OpenFolder', {
                                foldername: moveFolder,
                                extraname: extraName
                            })
                            :
                            props.navigation.navigate('Directory')
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
                                <TouchableOpacity style={{ marginTop: 15 }} activeOpacity={0.6} onPress={() => {
                                    moveFolder ?
                                        MoveToThisFolder(item.item.id)
                                        :
                                        AnimateExpansion()
                                }}>
                                    <View style={{ width: screenWidth - 30, backgroundColor: colorScheme === 'dark' ? '#303030' : 'white', borderRadius: 10, alignItems: 'center' }}>
                                        <View style={{ width: '90%', flexDirection: 'row', alignItems: 'center', height: 45, justifyContent: 'space-between' }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <MaterialIcons name={expanded ? 'folder-open' : "folder"} size={28} color="#FFBC01" />
                                                <TouchableOpacity>
                                                    <TextInput placeholder={item.item.extraName} numberOfLines={1} autoFocus={false} maxLength={20} blurOnSubmit onChangeText={(text) => {
                                                        setNewFoldername(text)
                                                    }} editable={moveFolder ? false : true}
                                                        placeholderTextColor={colorScheme === 'dark' ? 'white' : '#303030'}
                                                        cursorColor="#FFBC01" style={{ color: colorScheme === 'dark' ? 'white' : '#303030', fontSize: 16, marginStart: 20, width: '100%' }} selectTextOnFocus
                                                        selectionColor="#FFBC01" onFocus={() => { }} onBlur={() => { RenameFolder(item.item.id) }} />
                                                </TouchableOpacity>
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
                                        <ExpandableSection expanded={expanded}>
                                            <View style={{ width: screenWidth - 30, marginTop: 20 }}>
                                                <Text style={{ alignSelf: 'flex-start', marginStart: 20 }}>Created on:           {item.item.date}</Text>
                                                <Text style={{ alignSelf: 'flex-start', marginStart: 20 }}>Creation time:      {item.item.time}</Text>
                                                <Text style={{ alignSelf: 'flex-start', marginStart: 20 }}>Folder number:     {item.index + 1}</Text>
                                                <Text style={{ alignSelf: 'flex-start', marginStart: 20 }}>Notes in folder:     {item.item.count}</Text>
                                                <View style={{ width: '100%', marginTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <TouchableOpacity style={{ backgroundColor: 'red', width: '50%', alignItems: 'center', padding: 10, justifyContent: 'center', borderBottomStartRadius: 11 }}
                                                        onPress={() => { DeleteFolder(item.item.id) }}>
                                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Delete Folder</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={{ backgroundColor: '#FFBC01', width: '50%', alignItems: 'center', padding: 10, justifyContent: 'center', borderBottomEndRadius: 11 }}
                                                        onPress={() => {
                                                            props.navigation.navigate('OpenFolder', {
                                                                id: item.item.id,
                                                                foldername: item.item.folderName,
                                                                extraname: item.item.extraName
                                                            })
                                                            AnimateExpansion()
                                                        }}>
                                                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Open Folder</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </ExpandableSection>
                                    </View>
                                </TouchableOpacity>
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
            {moveFolder ?
                null
                :
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
                </View>}
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
                        <Button onPress={hideDialog}>Cancel</Button>
                        <Button onPress={FinallyDelete} labelStyle={{ color: 'red' }} mode="text">Delete</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </SafeAreaView>
    )
}

export default Folder