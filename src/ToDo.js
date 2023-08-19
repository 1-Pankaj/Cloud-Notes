import React, { useEffect, useRef, useState } from "react";

import * as SQLite from 'expo-sqlite'
import { Appearance, Dimensions, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Button, RadioButton, Text, TextInput } from "react-native-paper";
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialComIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { FlatList } from "react-native-gesture-handler";
import AnimatedLottieView from "lottie-react-native";

const db = SQLite.openDatabase('CloudNotes.db')


const screenWidth = Dimensions.get('window').width

const ToDo = (props) => {

    const [data, setData] = useState(null)
    const [task, setTask] = useState('')
    const inputRef = useRef(null)
    const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme())

    Appearance.addChangeListener(()=>{
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
                            } else {
                                setData(null)
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
                            }
                        }, error => {
                            console.log(error);
                        })
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
                <TouchableOpacity style={{ marginTop: 20, marginEnd: 25 }}>
                    <MaterialComIcons name="dots-horizontal-circle-outline" size={25} color="#FFBC01" />
                </TouchableOpacity>
            </View>
            {data ?
                <View style={{marginTop:20, width:screenWidth, flex: 1 , alignItems:'center'}}>
                <Text style={{alignSelf:'flex-start', marginTop:20, marginBottom:20, marginStart:25, fontSize:25,
                fontWeight:'bold'}}>ToDo List</Text>
                <FlatList
                    data={data}
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={item=>{
                        return(
                            <TouchableOpacity style={{marginTop:10}}>
                                <View style={{width:screenWidth - 40, height:60, borderRadius:10, backgroundColor:colorScheme === 'dark'? '#202020' : 'white', flexDirection:'row',
                                alignItems:'center', justifyContent:'space-between'}}>
                                <View style={{flexDirection:'row', alignItems:'center'}}>
                                    <TouchableOpacity style={{alignItems:'center', justifyContent:'center', padding:10}}>
                                        <MaterialComIcons name="sticker-emoji" size={25}/>
                                    </TouchableOpacity>
                                    <Text style={{marginStart:20, fontSize:18, fontWeight:'bold', textDecorationLine:item.item.selected === 'true'? 'line-through' :'none'}}>{item.item.task.slice(0,20).trim()}</Text>
                                </View>
                                <RadioButton status={item.item.selected == 'true'? "checked" : 'unchecked'} onPress={()=>{}}/>
                                </View>
                            </TouchableOpacity>
                        )
                    }}
                    keyExtractor={item=>item.id}
                />
                </View>
                :
                <View style={{ flex: 1, width: screenWidth, alignItems: 'center', justifyContent: 'center' }}>
                    <AnimatedLottieView
                        source={require('../assets/archiveempty.json')} autoPlay loop
                        style={{ width: screenWidth, marginTop: -20 }}
                    />
                    <Text style={{ fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>ToDo List is Empty, Try adding some!</Text>
                </View>}
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-evenly', width: screenWidth, marginBottom: 20 }}>
                <TextInput placeholder="Add new ToDo" style={{ width: screenWidth - 100, paddingStart: 10, paddingTop: 5, paddingBottom: 5, paddingEnd: 10 }}
                    underlineColor="transparent" outlineStyle={{ borderRadius: 20 }} multiline={false} maxLength={100}
                    cursorColor="#FFBC01" selectionColor="#FFBC01" mode="outlined" ref={inputRef}
                    activeUnderlineColor="transparent" value={task} onChangeText={(txt) => { setTask(txt) }}
                />
                <TouchableOpacity style={{
                    width: 55, height: 55, backgroundColor: '#FFBC01', borderRadius: 30, alignItems: 'center',
                    justifyContent: 'center'
                }} onPress={() => { 
                    inputRef.current.blur()
                    AddData(task.trim())
                    setTask('') }}>
                    <MaterialIcons name="add" size={25} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default ToDo