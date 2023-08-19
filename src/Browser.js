import React, { useEffect, useRef, useState } from "react";
import { Animated, Appearance, Dimensions, FlatList, TextInput, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import { ProgressBar, Text } from "react-native-paper";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import * as SQLite from 'expo-sqlite'
import { useIsFocused } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

const db = SQLite.openDatabase("CloudNotes.db")

const Browser = (props) => {

    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())
    const [url, setUrl] = useState("https://google.com")
    const [uriWeb, setUriWeb] = useState("https://google.com")
    const [titleText, setTitleText] = useState("")
    const [canGoBack, setCanGoBack] = useState(false)
    const [canGoForward, setCanGoForward] = useState(false)
    const [loading, setLoading] = useState(false)
    const webviewRef = useRef(null)
    const [progress, setProgress] = useState(0)
    const [history, setHistory] = useState([])

    const animatedViewHeight = new Animated.Value(0)
    const [open, setOpen] = useState(false)
    const [bookmarked, setBookmarked] = useState(false)

    const GetUrlFromDatabase = () =>{
        db.transaction((tx)=>{
            tx.executeSql("SELECT title from bookmark where title = (?)",[uriWeb],
            (sql,rs)=>{
                if(rs.rows.length == 0){

                }
                else if(rs.rows._array[0].title == uriWeb){
                    setBookmarked(true)
                }
            },error=>{
                console.log("Error");
            })
        })
        db.transaction((tx)=>{
            tx.executeSql("SELECT * FROM history ORDER BY id DESC",[],
            (sql, rs)=>{
                if(rs.rows._array){
                    setHistory(null)
                    let results = []
                    for(let i = 0; i<rs.rows.length; i++){
                        let item = rs.rows.item(i)
                        results.push({id:item.id, url:item.url})
                    }
                    setHistory(results)
                    results = []
                }
            },
            error=>{
                console.log("Error");
            })
        })
    }

    const CreateTable = () =>{
        db.transaction((tx)=>{
            tx.executeSql("CREATE TABLE IF NOT EXISTS bookmark(id INTEGER PRIMARY KEY AUTOINCREMENT, title VARCHAR(500) NOT NULL)", [],
            (sql,rs)=>{
            },error=>{
                console.log("Error");
            })
        })
        db.transaction((tx)=>{
            tx.executeSql("CREATE TABLE IF NOT EXISTS history (id INTEGER PRIMARY KEY AUTOINCREMENT, url VARCHAR(500) NOT NULL)", [],
            (sql, rs)=>{
            },
            error=>{
                console.log("Error");
            })
        })
    }

    const AddUrlToDatabase = (url) =>{
        db.transaction((tx)=>{
            tx.executeSql("INSERT INTO history (url) VALUES (?)",[url],
            (sql, rs)=>{
                GetUrlFromDatabase()
            },
            error=>{
                console.log("Error");
            })
        })   
    }
    const DropTable = () =>{
        db.transaction(tx=>{
            tx.executeSql("DROP TABLE history",[],
            (sql,rs)=>{
                CreateTable()
                GetUrlFromDatabase()
            },
            error=>{
                console.log("Error");
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

    const RemoveUrl = (id) =>{
        db.transaction((tx)=>{
            tx.executeSql("DELETE FROM history WHERE ID = (?)",[id],
            (sql,rs)=>{
                GetUrlFromDatabase()
            },
            error=>{
                console.log("Error");
            })
        })
    }

    Appearance.addChangeListener(()=>{
        setColorScheme(Appearance.getColorScheme())
    })

   
    const isFocused = useIsFocused()
    useEffect(()=>{
        CreateTable()
        GetUrlFromDatabase()
    },[isFocused, uriWeb])

    const showHiddenView = () => {

        {
            open ?
                Animated.timing(animatedViewHeight, {
                    toValue: 0,
                    useNativeDriver: false,
                }).start(() => {
                    setOpen(false)
                })
                :
                Animated.spring(animatedViewHeight, {
                    toValue: 400,
                    speed:100,
                    useNativeDriver: false
                }).start(() => { setOpen(true) })

        }


    }

    const SetBookmark = () =>{
        

        db.transaction((tx)=>{
            tx.executeSql(`INSERT INTO bookmark (title) values(?)`, [uriWeb],
            (sql,rs)=>{
                setBookmarked(true)
            },error=>{
                console.log(error);
            })
        })
    }

    const RemoveBookmark = () =>{
        db.transaction((tx)=>{
            tx.executeSql('DELETE FROM bookmark where title = (?)', [uriWeb],
            (sql,rs)=>{
                console.log("done");
                setBookmarked(false)
            },error=>{
                console.log("Error");
            })
        })
    }

    

    return (
        <SafeAreaView style={Styles.container}>
            <View style={Styles.container}>
                <View style={{ width: screenWidth, flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'space-between' }}>
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
                        fontSize: 18
                    }}>
                        {titleText.slice(0, 22)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginEnd: 20 }}>
                        <TouchableOpacity onPress={() => { showHiddenView() }} style={{ marginBottom: 15, }}>
                            <MaterialCommIcons name={open ? "close" : "history"} size={27} color="#FFBC01" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            loading ? webviewRef.current.stopLoading() : webviewRef.current.reload()
                        }} style={{ marginStart: 15, marginBottom: 15 }}>
                            <MaterialCommIcons name={loading ? "close" : "reload"} size={27} color="#FFBC01" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Animated.View style={{
                    width: screenWidth, height: animatedViewHeight, flexDirection: 'column', alignItems: 'center',
                }}>
                    <View style={{ alignItems: 'center', width: screenWidth, flexDirection: 'row', justifyContent: 'space-between', marginTop:10, marginBottom:10 }}>
                    <Text style={{
                        marginStart:15,fontFamily: 'mulish', fontWeight: 'bold', fontSize: 25,
                    }}>
                        History
                    </Text>
                    <TouchableOpacity style={{ marginEnd:15 }} onPress={()=>{DropTable()}}>
                    <Text style={{fontFamily: 'mulish', fontWeight: 'bold', fontSize: 14, color:"#FFBC01" }}>
                        Clear all
                    </Text>
                    </TouchableOpacity>
                    </View>
                    <FlatList 
                        data={history}
                        keyExtractor={item=>item.id}
                        renderItem={item=>(
                            <TouchableOpacity onPress={()=>{setUriWeb(item.item.url)
                            showHiddenView()}}>
                                <View style={{width:screenWidth-20, height:30,backgroundColor: colorScheme === "dark" ? "#202020" : "#fff", borderRadius:10, 
                                alignItems:'center', justifyContent:'space-between',marginTop:10, flexDirection:'row'}}>
                                    <Text style={{paddingHorizontal:10, fontFamily:'mulish', color:'gray', fontSize:13, marginEnd:20}} numberOfLines={1}>{item.item.url}</Text>
                                    <TouchableOpacity style={{marginEnd:20}} onPress={()=>{RemoveUrl(item.item.id)}}>
                                    <Ionicons name="close" size={20} color={colorScheme === "dark"? "lightgray" : "#202020"}/>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </Animated.View>
                <View style={{ width: screenWidth, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-around' }}>

                    <TextInput placeholder="https://example.com/" placeholderTextColor={colorScheme === "dark" ? "white" : "black"}
                        style={{
                            width: '85%', height: 38, backgroundColor: colorScheme === "dark" ? "#303030" : "lightgray", borderRadius: 10,
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
                        bookmarked?
                        RemoveBookmark()
                        :
                        SetBookmark()
                     }} style={{ marginBottom: 10, }}>
                        <MaterialIcons name={bookmarked? "bookmark" : "bookmark-outline"} size={30} color={bookmarked? '#FFBC01' : "gray"} />
                    </TouchableOpacity>
                </View>
                <ProgressBar progress={progress} style={{ width: screenWidth, height: 2 }} />

                <WebView
                    style={{ flex: 1, width: screenWidth,alignItems:'center', justifyContent:'center' }}
                    source={{ uri: uriWeb }}
                    javaScriptEnabled
                    useWebView2
                    pullToRefreshEnabled
                    ref={webviewRef}
                    forceDarkOn={colorScheme === 'dark' ? true : false}
                    allowFileAccess
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
            </View>
        </SafeAreaView>
    )

}

export default Browser