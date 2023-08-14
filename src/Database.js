import React, { useState } from "react";
import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabase("CloudNotes.db")

const CreateTable = (tableName, columns) =>{
    db.transaction(tx =>{
        tx.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`, [],
        (sql, rs)=>{
            console.log("Created");
        },
        (error) => {
            console.log("Error creating table");
        })
    })
}

const SelectData = (tableName) =>{
    db.transaction(tx =>{
        tx.executeSql(`SELECT * FROM ${tableName}`,[],
        (sql, rs)=>{
            console.log(rs.rows._array);
        },
        error=>{
            console.log("Error");
        })
    })
}

const InsertData = (tableName,columns,values) =>{
    db.transaction(tx =>{
        tx.executeSql(`INSERT INTO ${tableName}(${columns}) values(${values})`, [],
        (sql, rs)=>{
            console.log("Inserted");
        },
        error=>{
            console.log("Error");
        })
    })
}





export {CreateTable,SelectData, InsertData}