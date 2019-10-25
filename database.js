"use strict";
const mysql = require('mysql2');
const pool = mysql.createPool({host:'localhost', user: 'root', password:'test123', database:'Union'});
const promisePool = pool.promise();

async function query(qs,p){ 
    //qs = 'SELECT * FROM `table` WHERE `name` = ? AND `age` > ?'
    //"CREATE TABLE person(id int,user varchar(255),password varchar(255))
    if(p){
        return await promisePool.query(qs, p);
    }else{
        return await promisePool.query(qs);
    }
}

async function execute(es, p){
    console.log(es);
    if(p){
        return await promisePool.execute(es, p);
    }else{
        return await promisePool.execute(es);
    }
}

async function close(){
    await promisePool.end();
}

module.exports={
    query, execute, close
}