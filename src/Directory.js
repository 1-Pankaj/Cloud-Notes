import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Appearance, Dimensions, FlatList, ImageBackground, ScrollView, TextInput, TouchableOpacity, View, Image, ToastAndroid } from "react-native";
import Styles from "./Styles";
import { Button, Card, DataTable, Divider, Text } from "react-native-paper";

import Ionicons from '@expo/vector-icons/Ionicons'

import { SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from 'expo-splash-screen'
import * as SQLite from 'expo-sqlite'
import { useFonts } from "expo-font";
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { useIsFocused } from "@react-navigation/native";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';


SplashScreen.preventAutoHideAsync();

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height


const Directory = (props) => {

    GoogleSignin.configure({
        webClientId: '29670230722-7i4utp5aqudiuklhp7rfgri5530sq02h.apps.googleusercontent.com',
    });


    const SignInWithGoogle = async () => {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
        const { idToken } = await GoogleSignin.signIn()
        const googleCredential = auth.GoogleAuthProvider.credential(idToken)

        const userSignIn = auth().signInWithCredential(googleCredential)
        userSignIn.then((user) => {
            ToastAndroid.show('Signed in ' + user.user.displayName, ToastAndroid.SHORT)
            setUser(user)
        }).catch((error) => {
            console.log(error);
        })
    }

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [allNotesCount, setAllNotesCount] = useState(0)
    const [archivedNoteCount, setArchivedNoteCount] = useState(0)
    const [deletedNotesCount, setDeletedNotesCount] = useState(0)
    const [bookmarkCount, setBookmarkCount] = useState(0)
    const [historyCount, setHistoryCount] = useState(0)
    const [starredNotesCount, setStarredNotesCount] = useState(0)
    const [searchText, setSearchText] = useState('')
    const [dataNotes, setDataNotes] = useState(null)
    const [dataStar, setDataStar] = useState(null)
    const [dataTrash, setDataTrash] = useState(null)
    const [dataArchive, setDataArchive] = useState(null)
    const [passwordProtected, setPasswordProtected] = useState(false)
    const [user, setUser] = useState()
    const [initializing, setInitializing] = useState(true);
    const [archiveEnabled, setArchiveEnabled] = useState(false)
    const [starredEnabled, setStarredEnabled] = useState(false)
    const [todoEnabled, setTodoEnabled] = useState(false)
    const [taskData, setTaskData] = useState(null)
    const [page, setPage] = useState(0);
    const [numberOfItemsPerPageList] = useState([2, 3, 4, 8, 12, 20]);
    const [itemsPerPage, onItemsPerPageChange] = useState(
        numberOfItemsPerPageList[0]
    );

    const animatedSearchWidth = useRef(new Animated.Value(0)).current

    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })

    const [fontsLoaded] = useFonts({
        'mulish': require("../assets/fonts/mulish.ttf")
    })

    const isFocused = useIsFocused()

    const GetCount = () => {



        db.transaction((tx) => {
            tx.executeSql("SELECT id from notes", [],
                (sql, rs) => {
                    setAllNotesCount(rs.rows.length)
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT id from archived", [],
                (sql, rs) => {
                    setArchivedNoteCount(rs.rows.length)
                }, error => {
                    console.log("error");
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS bookmark(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL)", [],
                (sql, rs) => {
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, url VARCHAR(500) NOT NULL)", [],
                (sql, rs) => {
                },
                error => {
                    console.log("Error");
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS deletednotes (id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT title FROM deletednotes", [],
                (sql, rs) => {
                    setDeletedNotesCount(rs.rows.length)
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT * from bookmark", [],
                (sql, rs) => {
                    setBookmarkCount(rs.rows.length)
                }, error => {
                    console.log("Error")
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT url FROM history", [],
                (sql, rs) => {
                    setHistoryCount(rs.rows.length)
                }, error => {
                    console.log("Error");
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS starrednotes(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL, note VARCHAR(4000) NOT NULL, date VARCHAR(15) NOT NULL,time VARCHAR(15) NOT NULL , pageColor VARCHAR(20) NOT NULL, fontColor VARCHAR(20) NOT NULL, fontStyle VARCHAR(20) NOT NULL, fontSize VARCHAR(20) NOT NULL)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT id FROM starrednotes", [],
                        (sql, rs) => {
                            if (rs.rows.length === 0) {

                            } else {
                                setStarredNotesCount(rs.rows.length)
                            }
                        }, error => {

                        })
                }, error => {
                    console.log("Error");
                })
        })
    }

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
                    console.log("Error");
                })
        })
    }

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, taskData ? taskData.length : 0);

    useEffect(() => {
        setPage(0);
    }, [itemsPerPage])

    const StarredNotesCheck = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT firsttime from starredsplash", [],
                (sql, rs) => {
                    if (rs.rows.length == 0) {
                        props.navigation.navigate('StarredNotesSplash')
                    } else {
                        props.navigation.navigate('StarredNotes')
                    }
                }, error => {
                    console.log("error");
                })
        })
    }

    const ArchivePasswordCheck = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS archivepass(firsttime VARCHAR(20),password VARCHAR(20))", [],
                (sql, rs) => {

                }, error => {
                    console.log("Error");
                })

            tx.executeSql("SELECT * FROM archivepass", [],
                (sql, rs) => {
                    if (rs.rows.length == 0) {
                        props.navigation.navigate('ArchivePasswordSplash')
                    } else {
                        if (rs.rows._array[0].password == '') {
                            props.navigation.navigate('ArchivePage')
                        } else {
                            props.navigation.navigate('PasswordPage')
                        }
                    }
                }, error => {
                    console.log("Error");
                })
        })
    }


    const GetFeatures = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS features (todo Boolean, reminder Boolean, starred Boolean, moodify Boolean, notebackground Boolean, gridlist Boolean, archive Boolean, readingmode Boolean)", [],
                (sql, rs) => {
                    sql.executeSql("SELECT * FROM features", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                let results = []
                                let archive = rs.rows._array[0].archive
                                let gridlist = rs.rows._array[0].gridlist
                                let moodify = rs.rows._array[0].moodify
                                let notebackground = rs.rows._array[0].notebackground
                                let readingmode = rs.rows._array[0].readingmode
                                let reminder = rs.rows._array[0].reminder
                                let starred = rs.rows._array[0].starred
                                let todo = rs.rows._array[0].todo

                                setArchiveEnabled(archive)
                                setStarredEnabled(starred)
                                setTodoEnabled(todo)


                            }
                        }, error => {
                            console.log("Error");
                        })
                }, error => {
                    console.log("Error");
                })
        })
    }

    const FolderFirstTimeCheck = () => {
        db.transaction((tx)=>{
            tx.executeSql("CREATE TABLE IF NOT EXISTS foldersplash(firsttime Boolean)",[],
            (sql,rs)=>{
                sql.executeSql("SELECT firsttime FROM foldersplash",[],
                (sql,rs)=>{
                    if(rs.rows.length > 0){
                        props.navigation.navigate('Folder')
                    }else{
                        props.navigation.navigate('FolderSplash')
                    }
                }, error =>{
                    console.log("Error");
                })
            }, error =>{
                console.log("Error");
            })
        })
    }

    useEffect(() => {
        GetFeatures()
        GetCount()
        GetTaskData()
    }, [isFocused])

    useEffect(() => {
        setTimeout(() => {
            Animated.timing(animatedSearchWidth, {
                toValue: screenWidth - 40,
                duration: 2500,
                useNativeDriver: false
            }).start()
        }, 150);
    }, [animatedSearchWidth])

    function onAuthStateChanged(user) {
        setUser(user);
        if (initializing) setInitializing(false);
    }

    const ClearTaskRecord = () => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM recordTasks", [],
                (sql, rs) => {
                    GetTaskData()
                    ToastAndroid.show("Task Records cleared", ToastAndroid.SHORT)
                }, error => {
                    console.log("Error");
                })
        })
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber;
    }, [])

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null
    }

    const SearchTextInDatabase = (text) => {
        setSearchText(text)
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM notes WHERE title like '%${text}%' or note like  '%${text}%'`, [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
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
                        setDataNotes(results)
                    } else {
                        setDataNotes(null)
                    }
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM starrednotes WHERE title like '%${text}%' or note like  '%${text}%'`, [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
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
                        setDataStar(results)
                    } else {
                        setDataStar(null)
                    }
                }, error => {
                    console.log("Error");
                })
        })
        db.transaction((tx) => {
            tx.executeSql(`SELECT * FROM deletednotes WHERE title like '%${text}%' or note like  '%${text}%'`, [],
                (sql, rs) => {
                    if (rs.rows.length > 0) {
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
                        setDataTrash(results)
                    } else {
                        setDataTrash(null)
                    }
                }, error => {
                    console.log("Error");
                })
        })

        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS archivepass(firsttime VARCHAR(20),password VARCHAR(20))", [],
                (sql, rs) => {
                    sql.executeSql("SELECT password FROM archivepass", [],
                        (sql, rs) => {
                            if (rs.rows.length > 0) {
                                if (rs.rows._array[0].password == '') {
                                    sql.executeSql(`SELECT * FROM archived WHERE title like '%${text}%' or note like  '%${text}%'`, [],
                                        (sql, rs) => {
                                            if (rs.rows.length > 0) {
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
                                                setDataArchive(results)
                                            } else {
                                                setDataArchive(null)
                                            }
                                        }, error => {
                                            console.log("Error");
                                        })
                                } else {
                                    setPasswordProtected(true)
                                }
                            }
                        }, error => {
                            console.log("Error");
                        })
                }, error => {
                    console.log("Error");
                })
        })

    }


    return (
        <SafeAreaView style={Styles.container} onLayout={onLayoutRootView}>
            <ScrollView style={[{ padding: 8, width: screenWidth, flex: 1 }]} contentContainerStyle={{ alignItems: 'center', flex: 1, }} showsVerticalScrollIndicator={false}>
                <View style={{ width: screenWidth - 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginVertical: 20 }} onPress={() => { props.navigation.navigate('Home') }}>
                        <Ionicons name="chevron-back-outline" color='#FFBC01' size={32} style={{ marginStart: 1, marginTop: 2 }} />
                        <Text style={{ fontWeight: 'bold', fontSize: 25, color: '#FFBC01', alignSelf: 'center' }}>Directory</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {user ?
                            <Button mode="elevated" style={{ marginTop: 5, marginEnd: 20 }} icon='sync' onPress={() => {
                            }}>
                                Sync
                            </Button>
                            :
                            null}
                        <TouchableOpacity style={{ marginEnd: 25, marginTop: 5 }} onPress={() => {
                            user ?
                                null
                                :
                                SignInWithGoogle()
                        }}>
                            {user ?
                                <Card mode="elevated" style={{ borderRadius: 30 }}>
                                    <Image source={{ uri: auth().currentUser.photoURL }} style={{ width: 35, height: 35, borderRadius: 30 }} />
                                </Card>
                                :

                                <Card mode="elevated" style={{ borderRadius: 30 }}>
                                    <MaterialCommIcons name="account-circle" size={35} color="#FFBC01" />
                                </Card>}
                        </TouchableOpacity>
                    </View>
                </View>
                <Animated.View style={{ backgroundColor: colorScheme === 'dark' ? '#303030' : '#e3e3e3', width: animatedSearchWidth, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', marginTop: 10 }}>
                    <TextInput placeholder="Global Search" style={{ marginStart: 20, width: '85%', color: colorScheme === 'dark' ? 'white' : '#101010' }} placeholderTextColor={colorScheme === 'dark' ? '#909090' : '#404040'}
                        cursorColor="#FFBC01" selectionColor="#FFBC01" maxLength={25} numberOfLines={1}
                        multiline={false} value={searchText} onChangeText={(text) => { SearchTextInDatabase(text) }} />
                    {searchText ?
                        <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => {
                            props.navigation.navigate('Browser', {
                                page: 'GlobalSearch',
                                url: searchText
                            })
                        }}>
                            <Ionicons name="globe-outline" size={26} color='#FFBC01' />
                        </TouchableOpacity>
                        :
                        null}
                </Animated.View>
                {!searchText == '' ?
                    <ScrollView style={{ width: screenWidth - 40, }} contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
                        <Text style={{ alignSelf: 'flex-start', margin: 20, fontWeight: 'bold', fontSize: 22 }}>In All Notes</Text>
                        {dataNotes ?
                            <FlatList data={dataNotes}
                                keyExtractor={item => item.id}
                                scrollEnabled={false}
                                showsVerticalScrollIndicator={false}
                                renderItem={data => {
                                    return (
                                        <TouchableOpacity style={{ width: screenWidth, marginTop: 10 }} onPress={() => {
                                            props.navigation.navigate("CreateNote", {
                                                id: data.item.id,
                                                page: 'Home'
                                            })
                                        }} activeOpacity={0.6}>
                                            <View style={{ width: '90%', height: 60, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
                                                <View style={{ backgroundColor: data.item.pageColor == "default" ? colorScheme === "dark" ? "#202020" : "#fff" : data.item.pageColor, width: '100%', height: '100%', borderRadius: 8, opacity: 0.6, position: 'absolute' }} />
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
                                                        <MaterialIcons name="arrow-forward-ios" size={22} color='#FFBC01' />
                                                    </View>
                                                </View>

                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                            :
                            <Text>No data in All Notes</Text>}
                        {starredEnabled ?
                            <Text style={{ alignSelf: 'flex-start', margin: 20, fontWeight: 'bold', fontSize: 22 }}>In Starred Notes</Text>
                            :
                            null}
                        {starredEnabled ?
                            dataStar ?
                                <FlatList
                                    scrollEnabled={false}
                                    data={dataStar}
                                    showsVerticalScrollIndicator={false}
                                    keyExtractor={item => item.id}
                                    renderItem={data => {
                                        return (
                                            <TouchableOpacity style={{ width: screenWidth, marginTop: 10 }} activeOpacity={0.6}
                                                onPress={() => {
                                                    props.navigation.navigate("CreateNote", {
                                                        id: data.item.id,
                                                        page: 'Starred'
                                                    })
                                                }}>
                                                <View style={{ width: '90%', height: 60, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
                                                    <View style={{ backgroundColor: data.item.pageColor == "default" ? colorScheme === "dark" ? "#202020" : "#fff" : data.item.pageColor, width: '100%', height: '100%', borderRadius: 8, opacity: 0.6, position: 'absolute' }} />
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
                                                            <MaterialIcons name="arrow-forward-ios" size={22} color='#FFBC01' />
                                                        </View>
                                                    </View>

                                                </View>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                                :
                                <Text>No data in Starred Notes</Text>
                            :
                            null}
                        <Text style={{ alignSelf: 'flex-start', margin: 20, fontWeight: 'bold', fontSize: 22 }}>In Trashed Notes</Text>
                        {dataTrash ?
                            <FlatList
                                scrollEnabled={false}
                                data={dataTrash}
                                keyExtractor={item => item.id}
                                showsVerticalScrollIndicator={false}
                                renderItem={data => {
                                    return (
                                        <TouchableOpacity style={{ width: screenWidth, marginTop: 10 }} onPress={() => {
                                            props.navigation.navigate('TrashPage')
                                        }} activeOpacity={0.6}>
                                            <View style={{ width: '90%', height: 60, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
                                                <View style={{ backgroundColor: data.item.pageColor == "default" ? colorScheme === "dark" ? "#202020" : "#fff" : data.item.pageColor, width: '100%', height: '100%', borderRadius: 8, opacity: 0.6, position: 'absolute' }} />
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
                                                        <MaterialIcons name="arrow-forward-ios" size={22} color='#FFBC01' />
                                                    </View>
                                                </View>

                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                            :
                            <Text>No data in Trashed Notes</Text>}
                        {archiveEnabled ?
                            <Text style={{ alignSelf: 'flex-start', margin: 20, fontWeight: 'bold', fontSize: 22 }}>In Archived Notes</Text>
                            :
                            null}
                        {archiveEnabled ?
                            !passwordProtected ?
                                dataArchive ?
                                    <FlatList
                                        scrollEnabled={false}
                                        data={dataArchive}
                                        keyExtractor={item => item.id}
                                        showsVerticalScrollIndicator={false}
                                        renderItem={data => {
                                            return (
                                                <TouchableOpacity style={{ width: screenWidth, marginTop: 10 }} onPress={() => {
                                                    props.navigation.navigate('CreateNote', {
                                                        id: data.item.id,
                                                        page: 'Archive'
                                                    })
                                                }} activeOpacity={0.6}>
                                                    <View style={{ width: '90%', height: 60, borderRadius: 10, backgroundColor: colorScheme === 'dark' ? "#202020" : "white" }}>
                                                        <View style={{ backgroundColor: data.item.pageColor == "default" ? colorScheme === "dark" ? "#202020" : "#fff" : data.item.pageColor, width: '100%', height: '100%', borderRadius: 8, opacity: 0.6, position: 'absolute' }} />
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
                                                                <MaterialIcons name="arrow-forward-ios" size={22} color='#FFBC01' />
                                                            </View>
                                                        </View>

                                                    </View>
                                                </TouchableOpacity>
                                            )
                                        }}
                                    />
                                    :
                                    <Text>No data in Archived Notes</Text>
                                :
                                <View>
                                    <Text>Your archive is password protected</Text>
                                </View>
                            :
                            null}
                    </ScrollView>
                    :
                    <ScrollView style={{ width: screenWidth }} contentContainerStyle={{ alignItems: 'center' }} showsVerticalScrollIndicator={false}>
                        <View style={{ alignSelf: 'flex-start', marginStart: 20, marginTop: 30 }}>
                            <Text style={{ fontSize: 18, fontFamily: 'mulish' }}>Offline Drive</Text>
                        </View>
                        <TouchableOpacity style={{ borderTopStartRadius: 10, borderTopEndRadius: 10, marginTop: 20, borderBottomStartRadius: archiveEnabled || starredEnabled ? 0 : 10, borderBottomEndRadius: archiveEnabled || starredEnabled ? 0 : 10 }} activeOpacity={0.6} onPress={() => { props.navigation.navigate('Home') }}>
                            <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderTopStartRadius: 10, borderTopEndRadius: 10, borderBottomStartRadius: archiveEnabled || starredEnabled ? 0 : 10, borderBottomEndRadius: archiveEnabled || starredEnabled ? 0 : 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="folder-open-outline" size={26} style={{ alignSelf: 'center', marginStart: 20 }} color="#FFBC01" />
                                    <Text style={{ fontSize: 17, marginStart: 15 }}>Notes</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{allNotesCount}</Text>
                                    <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                                </View>
                            </View>
                        </TouchableOpacity>
                        {archiveEnabled ?
                            <View>
                                <Divider style={{ width: screenWidth - 40 }} />
                                <TouchableOpacity style={{ borderBottomStartRadius: starredEnabled ? 0 : 10, borderBottomEndRadius: starredEnabled ? 0 : 10 }} activeOpacity={0.6} onPress={() => { ArchivePasswordCheck() }}>
                                    <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomStartRadius: starredEnabled ? 0 : 10, borderBottomEndRadius: starredEnabled ? 0 : 10 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="archive-outline" size={26} style={{ alignSelf: 'center', marginStart: 20 }} color="#FFBC01" />
                                            <Text style={{ fontSize: 16.2, marginStart: 15 }}>Archives</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{archivedNoteCount}</Text>
                                            <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            :
                            null}
                        {starredEnabled ?
                            <View>
                                <Divider style={{ width: screenWidth - 40 }} />
                                <TouchableOpacity style={{ borderBottomStartRadius: 10, borderBottomEndRadius: 10 }} activeOpacity={0.6} onPress={() => { StarredNotesCheck() }}>
                                    <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderBottomStartRadius: 10, borderBottomEndRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="star-outline" size={26} style={{ alignSelf: 'center', marginStart: 20 }} color="#FFBC01" />
                                            <Text style={{ fontSize: 16.2, marginStart: 15 }}>Starred Notes</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{starredNotesCount}</Text>
                                            <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            :
                            null}
                        <TouchableOpacity style={{ borderRadius: 10, marginTop: 20 }} activeOpacity={0.6} onPress={() => { props.navigation.navigate('TrashPage') }}>
                            <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="trash-outline" size={26} style={{ alignSelf: 'center', marginStart: 22 }} color="#FFBC01" />
                                    <Text style={{ fontSize: 16.2, marginStart: 15 }}>Trash</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{deletedNotesCount}</Text>
                                    <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                                </View>
                            </View>
                        </TouchableOpacity>


                        <TouchableOpacity style={{ borderRadius: 10, marginTop: 20 }} activeOpacity={0.6} onPress={() => { FolderFirstTimeCheck() }}>
                            <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommIcons name="folder-account-outline" size={28} style={{ alignSelf: 'center', marginStart: 22 }} color="#FFBC01" />
                                    <Text style={{ fontSize: 16.2, marginStart: 15 }}>My Folders</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{deletedNotesCount}</Text>
                                    <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                                </View>
                            </View>
                        </TouchableOpacity>


                        <View style={{ alignSelf: 'flex-start', marginStart: 20, marginTop: 30 }}>
                            <Text style={{ fontSize: 17, fontFamily: 'mulish' }}>Browser Storage</Text>
                        </View>
                        <TouchableOpacity style={{ borderTopStartRadius: 10, borderTopEndRadius: 10, marginTop: 20 }} activeOpacity={0.6} onPress={() => {
                            props.navigation.navigate('BookmarkAndHistory', {
                                page: 'Bookmark'
                            })
                        }}>
                            <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderTopStartRadius: 10, borderTopEndRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="bookmarks-outline" size={23} style={{ alignSelf: 'center', marginStart: 22 }} color="#FFBC01" />
                                    <Text style={{ fontSize: 17, marginStart: 15 }}>Bookmarks</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{bookmarkCount}</Text>
                                    <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <Divider style={{ width: screenWidth - 40 }} />
                        <TouchableOpacity style={{ borderBottomStartRadius: 10, borderBottomEndRadius: 10 }} activeOpacity={0.6} onPress={() => {
                            props.navigation.navigate('BookmarkAndHistory', {
                                page: 'History'
                            })
                        }}>
                            <View style={{ width: screenWidth - 40, height: 45, backgroundColor: colorScheme === 'dark' ? '#303030' : '#fff', borderBottomStartRadius: 10, borderBottomEndRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommIcons name="history" size={26} style={{ alignSelf: 'center', marginStart: 20 }} color="#FFBC01" />
                                    <Text style={{ fontSize: 16.2, marginStart: 15 }}>History</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 17, marginEnd: 10, fontFamily: 'mulish', marginBottom: 1.2 }}>{historyCount}</Text>
                                    <Ionicons name="chevron-forward-outline" size={22} color="#FFBC01" style={{ marginEnd: 15 }} />
                                </View>
                            </View>
                        </TouchableOpacity>

                        {taskData && todoEnabled ?
                            <View style={{ width: screenWidth, alignItems: 'center', alignSelf: 'center', marginTop: 30, marginBottom: 30 }}>
                                <View style={{ alignItems: 'center', width: '90%', flexDirection: 'row', justifyContent: 'space-between', marginStart: 20, marginBottom: 20, marginEnd: 20 }}>
                                    <Text style={{ fontSize: 17, fontFamily: 'mulish' }}>Task Records</Text>
                                    <TouchableOpacity onPress={() => { ClearTaskRecord() }}>
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
                                            <DataTable.Row key={item.id}>
                                                <DataTable.Cell>{item.title + " " + index}</DataTable.Cell>
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
                            </View>
                            :
                            null}
                    </ScrollView>}
            </ScrollView>
        </SafeAreaView>
    )
}

export default Directory