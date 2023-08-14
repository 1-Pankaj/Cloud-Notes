import React from "react";
import { Dimensions, TouchableOpacity, View } from "react-native";
import Styles from "./Styles";
import { Text } from "react-native-paper";

import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import { SafeAreaView } from "react-native-safe-area-context";


const screenWidth = Dimensions.get("window").width
const screenHeight = Dimensions.get("window").height

const Directory = (props) =>{
    return(
        <SafeAreaView style={Styles.container}>
        <View style={[Styles.container,{padding:8}]}>
            <View style={{width:screenWidth, flexDirection:'row', alignItems:'center'}}>
            <TouchableOpacity onPress={()=>{props.navigation.navigate("Home")}} style={{margin:20}}>
                <MaterialIcons name="arrow-back-ios" size={25} color="#FFBC01"/>
            </TouchableOpacity>
            </View>
            
        </View>
        </SafeAreaView>
    )
}

export default Directory