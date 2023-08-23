import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "./Styles";
import { Text } from "react-native-paper";

const StarredNotes = (props) =>{
    return(
        <SafeAreaView style={Styles.container}>
            <Text>Starred Notes</Text>
        </SafeAreaView>
    )
}

export default StarredNotes