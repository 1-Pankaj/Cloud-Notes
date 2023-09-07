import React, { useEffect, useRef, useState } from "react";
import { Animated, Appearance, BackHandler, Dimensions, Easing, FlatList, TextInput, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import { ProgressBar, Text } from "react-native-paper";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import * as SQLite from 'expo-sqlite'
import { useIsFocused } from "@react-navigation/native";
import { ExpandableSection } from "react-native-ui-lib";

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

const db = SQLite.openDatabase("CloudNotes.db")

const Browser = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [url, setUrl] = useState("")
    const [uriWeb, setUriWeb] = useState("")
    const [titleText, setTitleText] = useState("")
    const [canGoBack, setCanGoBack] = useState(false)
    const [canGoForward, setCanGoForward] = useState(false)
    const [loading, setLoading] = useState(false)
    const webviewRef = useRef(null)
    const [progress, setProgress] = useState(0)
    const [history, setHistory] = useState([])
    const [bottom, setBottom] = useState(true)

    const [open, setOpen] = useState(false)
    const [bookmarked, setBookmarked] = useState(false)
    const animatedTranslate = new Animated.Value(0)
    const animatedHeight = new Animated.Value(600)
    const [lastValue, setLastValue] = useState(null)

    const HandleScroll = (y) => {
        if (y > 5) {
            Animated.timing(animatedHeight, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false
            }).start(() => {
                Animated.timing(animatedTranslate, {
                    toValue: bottom ? 350 : -350,
                    duration: 250,
                    useNativeDriver: false
                }).start()
            })

        }
        if (y < -5) {
            Animated.timing(animatedHeight, {
                toValue: 600,
                duration: 200,
                useNativeDriver: false
            }).start(() => {
                Animated.timing(animatedTranslate, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: false
                }).start()
            })
        }


    }

    const GetUrlFromDatabase = () => {
        db.transaction((tx) => {
            tx.executeSql("SELECT title from bookmark where title = (?)", [uriWeb],
                (sql, rs) => {
                    if (rs.rows.length == 0) {

                    }
                    else if (rs.rows._array[0].title == uriWeb) {
                        setBookmarked(true)
                    }
                }, error => {
                })
        })
        db.transaction((tx) => {
            tx.executeSql("SELECT * FROM history ORDER BY id DESC", [],
                (sql, rs) => {
                    if (rs.rows._array) {
                        setHistory(null)
                        let results = []
                        for (let i = 0; i < rs.rows.length; i++) {
                            let item = rs.rows.item(i)
                            results.push({ id: item.id, url: item.url })
                        }
                        setHistory(results)
                        results = []
                    }
                },
                error => {
                })
        })
    }

    const CreateTable = () => {
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS bookmark(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL)", [],
                (sql, rs) => {
                }, error => {
                })
        })
        db.transaction((tx) => {
            tx.executeSql("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, url VARCHAR(500) NOT NULL)", [],
                (sql, rs) => {
                },
                error => {
                })
        })
    }

    const AddUrlToDatabase = (url) => {
        db.transaction((tx) => {
            tx.executeSql("INSERT INTO history (url) VALUES (?)", [url],
                (sql, rs) => {
                    GetUrlFromDatabase()
                },
                error => {
                })
        })
    }
    const DropTable = () => {
        db.transaction(tx => {
            tx.executeSql("DROP TABLE history", [],
                (sql, rs) => {
                    CreateTable()
                    GetUrlFromDatabase()
                },
                error => {
                })
        })
    }

    const BrowserFun = (prop) => {
        setTitleText(prop.title)
        setUriWeb(prop.url)
        setUrl(prop.url)

        setCanGoBack(prop.canGoBack)
        setCanGoForward(prop.canGoForward)

    }

    const RemoveUrl = (id) => {
        db.transaction((tx) => {
            tx.executeSql("DELETE FROM history WHERE ID = (?)", [id],
                (sql, rs) => {
                    GetUrlFromDatabase()
                },
                error => {
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
    Appearance.addChangeListener(() => {
        setColorScheme(Appearance.getColorScheme())
    })


    useEffect(() => {
        if (props.route.params === undefined) {

        } else {
            if (props.route.params.page == 'Bookmark') {
                setTimeout(() => {
                    setUriWeb(props.route.params.url.trim())
                }, 1500);
            }
            else if (props.route.params.page == 'History') {
                setTimeout(() => {
                    setUriWeb(props.route.params.url.trim())
                }, 1500);
            }
            else if (props.route.params.page == 'GlobalSearch') {
                setTimeout(() => {
                    if (props.route.params.url.trim().includes('http' || 'https')) {
                        setUriWeb(props.route.params.url.trim())
                    } else {
                        setUriWeb("https://www.google.com/search?q=" + props.route.params.url.trim())
                    }
                }, 1500);
            }
        }
    }, [])

    

    const isFocused = useIsFocused()
    useEffect(() => {
        CreateTable()
        GetUrlFromDatabase()
    }, [isFocused])


    const SetBookmark = () => {
        db.transaction((tx) => {
            tx.executeSql(`INSERT INTO bookmark (title) values(?)`, [uriWeb],
                (sql, rs) => {
                    setBookmarked(true)
                }, error => {
                })
        })
    }

    const RemoveBookmark = () => {
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM bookmark where title = (?)', [uriWeb],
                (sql, rs) => {
                    setBookmarked(false)
                }, error => {
                })
        })
    }



    return (
        <SafeAreaView style={Styles.container}>
            <View style={Styles.container}>
                {bottom ?
                    null
                    :
                    <Animated.View style={{
                        maxHeight: animatedHeight, transform: [{
                            translateY: animatedTranslate
                        }]
                    }}>
                        <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => {
                                    canGoBack ? webviewRef.current.goBack() : null
                                }} style={{ marginStart: 20, marginBottom: 15 }}>
                                    <MaterialIcons name="arrow-back-ios" size={25} color={canGoBack ? "#FFBC01" : "gray"} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    canGoForward ? webviewRef.current.goForward() : null
                                }} style={{ marginStart: 10, marginBottom: 15 }}>
                                    <MaterialIcons name="arrow-forward-ios" size={25} color={canGoForward ? "#FFBC01" : "gray"} />
                                </TouchableOpacity>
                            </View>
                            <Text style={{
                                alignSelf: 'center', marginEnd: 10, marginStart: 10, marginBottom: 15, fontFamily: 'mulish',
                                fontSize: 15
                            }}>
                                {titleText.slice(0, 22)}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginEnd: 20 }}>
                                <TouchableOpacity onPress={() => { setOpen(!open) }} style={{ marginBottom: 15, }}>
                                    <MaterialCommIcons name={open ? "close" : "history"} size={27} color="#FFBC01" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    loading ? webviewRef.current.stopLoading() : webviewRef.current.reload()
                                }} style={{ marginStart: 15, marginBottom: 15 }}>
                                    <MaterialCommIcons name={loading ? "close" : "reload"} size={27} color="#FFBC01" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <ExpandableSection
                            expanded={open}>
                            <View style={{ height: 400 }}>

                                <View style={{ alignItems: 'center', width: screenWidth, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
                                    <Text style={{
                                        marginStart: 15, fontFamily: 'mulish', fontWeight: 'bold', fontSize: 25,
                                    }}>
                                        History
                                    </Text>
                                    <TouchableOpacity style={{ marginEnd: 15 }} onPress={() => { DropTable() }}>
                                        <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 14, color: "#FFBC01" }}>
                                            Clear all
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={history}
                                    keyExtractor={item => item.id}
                                    renderItem={item => (
                                        <TouchableOpacity onPress={() => {
                                            setUriWeb(item.item.url)
                                            setOpen(!open)
                                        }}>
                                            <View style={{
                                                width: screenWidth - 20, height: 30, backgroundColor: colorScheme === "dark" ? "#202020" : "#fff", borderRadius: 10,
                                                alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexDirection: 'row'
                                            }}>
                                                <Text style={{ paddingHorizontal: 10, fontFamily: 'mulish', color: 'gray', fontSize: 13, marginEnd: 20 }} numberOfLines={1}>{item.item.url}</Text>
                                                <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => { RemoveUrl(item.item.id) }}>
                                                    <Ionicons name="close" size={20} color={colorScheme === "dark" ? "lightgray" : "#202020"} />
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />

                            </View>
                        </ExpandableSection>
                        <Animated.View style={{ width: screenWidth, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around', }}>
                            <TouchableOpacity style={{ alignSelf: 'center', marginBottom: 10 }} onPress={() => { setBottom(true) }}>
                                <MaterialIcons name="arrow-drop-down" size={20} color="#FFBC01" />
                            </TouchableOpacity>
                            <TextInput placeholder="https://example.com/" placeholderTextColor={colorScheme === "dark" ? "white" : "black"}
                                style={{
                                    width: '75%', height: 38, backgroundColor: colorScheme === "dark" ? "#303030" : "lightgray", borderRadius: 10,
                                    opacity: 0.7, paddingHorizontal: 10, color: colorScheme === "dark" ? "white" : "black", alignSelf: 'center', fontSize: 13,
                                    fontFamily: 'mulish', marginBottom: 10,
                                }}
                                selectTextOnFocus
                                cursorColor="#FFBC01"
                                multiline={false}
                                onChangeText={setUrl}
                                value={url} onBlur={() => {
                                    if (url.includes('http' || 'https')) {
                                        setUriWeb(url)
                                        AddUrlToDatabase(url)
                                    } else {
                                        setUriWeb("https://www.google.com/search?q=" + url)
                                        AddUrlToDatabase("https://www.google.com/search?q=" + url)
                                    }
                                }}
                            />
                            <TouchableOpacity onPress={() => {
                                bookmarked ?
                                    RemoveBookmark()
                                    :
                                    SetBookmark()
                            }} style={{ marginBottom: 10, }}>
                                <MaterialIcons name={bookmarked ? "bookmark" : "bookmark-outline"} size={30} color={bookmarked ? '#FFBC01' : "gray"} />
                            </TouchableOpacity>
                        </Animated.View>
                        <ProgressBar progress={progress} style={{ width: screenWidth, height: 2 }} />
                    </Animated.View>}

                <WebView
                    style={{ flex: 1, width: screenWidth, alignItems: 'center', justifyContent: 'center' }}
                    source={{ uri: uriWeb }}
                    javaScriptEnabled
                    pullToRefreshEnabled
                    showsVerticalScrollIndicator={false}
                    ref={webviewRef}
                    forceDarkOn={colorScheme === 'dark' ? true : false}
                    allowFileAccess
                    onScroll={(e) => {
                        HandleScroll(e.nativeEvent.velocity.y.toFixed())
                    }}
                    sharedCookiesEnabled
                    thirdPartyCookiesEnabled
                    onLoadStart={() => { setLoading(true) }}
                    onLoadEnd={() => {
                        setLoading(false)
                        setProgress(0)
                    }}
                    allowsBackForwardNavigationGestures
                    allowsLinkPreview
                    scrollEnabled
                    onLoadProgress={(tx) => { setProgress(tx.nativeEvent.progress) }}
                    onNavigationStateChange={(tx) => { BrowserFun(tx) }}
                    onLoad={(tx) => { }}
                    setSupportMultipleWindows={false}

                />
                {bottom ?
                    <Animated.View style={{
                        width: screenWidth, alignItems: 'center', maxHeight: animatedHeight, transform: [{
                            translateY: animatedTranslate
                        }]
                    }}>
                        <ProgressBar progress={progress} style={{ width: screenWidth, height: 2 }} />
                        <View style={{
                            width: screenWidth - 35, height: 45, flexDirection: 'row', backgroundColor: colorScheme === "dark" ? "#303030" : "#e3e3e3", borderRadius: 10,
                            alignItems: 'center', alignSelf: 'center', marginVertical: 10, justifyContent: 'space-between'
                        }}>
                            <TouchableOpacity style={{ marginStart: 15 }} onPress={() => { setBottom(false) }}>
                                <MaterialIcons name="arrow-drop-up" size={25} color='#FFBC01' />
                            </TouchableOpacity>
                            <TextInput placeholder="https://example.com/" placeholderTextColor={colorScheme === "dark" ? "white" : "black"}
                                style={{
                                    borderRadius: 10, flex: 1, paddingHorizontal: 20,
                                    opacity: 0.7, color: colorScheme === "dark" ? "white" : "black", fontSize: 13,
                                    fontFamily: 'mulish',
                                }}
                                selectTextOnFocus
                                cursorColor="#FFBC01"
                                multiline={false}
                                onChangeText={setUrl}
                                value={url} onBlur={() => {
                                    if (url.includes('http' || 'https')) {
                                        setUriWeb(url)
                                        AddUrlToDatabase(url)
                                    } else {
                                        setUriWeb("https://www.google.com/search?q=" + url)
                                        AddUrlToDatabase("https://www.google.com/search?q=" + url)
                                    }
                                }}
                            />

                            <TouchableOpacity onPress={() => {
                                loading ? webviewRef.current.stopLoading() : webviewRef.current.reload()
                            }} style={{ marginEnd: 15 }}>
                                <MaterialCommIcons name={loading ? "close" : "reload"} size={25} color="#FFBC01" />
                            </TouchableOpacity>
                        </View>
                        <ExpandableSection top
                            expanded={open}>
                            <View style={{ height: 400 }}>

                                <View style={{ alignItems: 'center', width: screenWidth, flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 10 }}>
                                    <Text style={{
                                        marginStart: 15, fontFamily: 'mulish', fontWeight: 'bold', fontSize: 25,
                                    }}>
                                        History
                                    </Text>
                                    <TouchableOpacity style={{ marginEnd: 15 }} onPress={() => { DropTable() }}>
                                        <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 14, color: "#FFBC01" }}>
                                            Clear all
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <FlatList
                                    data={history}
                                    keyExtractor={item => item.id}
                                    renderItem={item => (
                                        <TouchableOpacity onPress={() => {
                                            setUriWeb(item.item.url)
                                            setOpen(!open)
                                        }}>
                                            <View style={{
                                                width: screenWidth - 20, height: 30, backgroundColor: colorScheme === "dark" ? "#202020" : "#fff", borderRadius: 10,
                                                alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexDirection: 'row'
                                            }}>
                                                <Text style={{ paddingHorizontal: 10, fontFamily: 'mulish', color: 'gray', fontSize: 13, marginEnd: 20 }} numberOfLines={1}>{item.item.url}</Text>
                                                <TouchableOpacity style={{ marginEnd: 20 }} onPress={() => { RemoveUrl(item.item.id) }}>
                                                    <Ionicons name="close" size={20} color={colorScheme === "dark" ? "lightgray" : "#202020"} />
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                />

                            </View>
                        </ExpandableSection>
                        <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', marginTop: 5, justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => {
                                    canGoBack ? webviewRef.current.goBack() : null
                                }} style={{ marginStart: 20 }}>
                                    <MaterialIcons name="arrow-back-ios" size={25} color={canGoBack ? "#FFBC01" : "gray"} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    canGoForward ? webviewRef.current.goForward() : null
                                }} style={{ marginStart: 10 }}>
                                    <MaterialIcons name="arrow-forward-ios" size={25} color={canGoForward ? "#FFBC01" : "gray"} />
                                </TouchableOpacity>
                            </View>
                            <Text style={{
                                alignSelf: 'center', marginEnd: 10, marginStart: 10, fontFamily: 'mulish',
                                fontSize: 15
                            }}>
                                {titleText.slice(0, 22)}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginEnd: 20 }}>
                                <TouchableOpacity onPress={() => { setOpen(!open) }} style={{}}>
                                    <MaterialCommIcons name={open ? "close" : "history"} size={27} color="#FFBC01" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {
                                    bookmarked ?
                                        RemoveBookmark()
                                        :
                                        SetBookmark()
                                }} style={{ marginStart: 15 }}>
                                    <MaterialIcons name={bookmarked ? "bookmark" : "bookmark-outline"} size={27} color={bookmarked ? '#FFBC01' : "gray"} />
                                </TouchableOpacity>
                            </View>
                        </View>


                    </Animated.View>
                    :
                    null}
            </View>
        </SafeAreaView>
    )

}

export default Browser