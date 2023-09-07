import React from "react";

import { Dimensions, View } from "react-native";
import { Button, Text } from "react-native-paper";

import * as SQLite from 'expo-sqlite'
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../Styles";
import AnimatedLottieView from "lottie-react-native";

const db = SQLite.openDatabase("CloudNotes.db")

const screenWidth = Dimensions.get('window').width

const MarketplaceSplash = (props) => {

    const WriteToSplash = () =>{
        db.transaction((tx)=>{
            tx.executeSql("INSERT INTO marketplacesplash(firsttime) values (false)",[],
            (sql,rs)=>{
                props.navigation.replace('Marketplace')
            }, error =>{
            })
        })
    }

    return (
        <SafeAreaView style={[Styles.container, { justifyContent: 'space-around' }]}>
            <AnimatedLottieView
                source={require('../../assets/marketplace.json')} renderMode="HARDWARE"
                autoPlay loop style={{ width: screenWidth, }}
            />

            <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 22, textAlign: 'center', marginHorizontal: 10 }}>
                Your destination for new features and releases!</Text>
            <Text style={{ fontWeight: 'bold', fontSize: 14, textAlign: 'center', paddingHorizontal: 10 }}>
                To reduce interruption while using CloudNotes, extra features that CloudNotes offers are in Marketplace. You can install those features anytime as extension and uninstall as you will.{'\n\n'}
                Features you uninstall are not permanently removed but are just removed from Home Page.
            </Text>
            <Button labelStyle={{ width: '80%', padding: 10 }}
                mode="contained"
                style={{ justifyContent: 'center', alignItems: 'center' }}
                onPress={() => { WriteToSplash() }}>
                <Text style={{ fontFamily: 'mulish', fontWeight: 'bold', fontSize: 17, color: 'white' }}>
                    Continue to Marketplace
                </Text>
            </Button>
        </SafeAreaView>
    )
}

export default MarketplaceSplash