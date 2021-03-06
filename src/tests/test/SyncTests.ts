import { request, response } from "express";
import { BackupHandler } from "../../db/backup/backup";
import { Router } from "../../db/router";
import DateUtils from "../../db/core/utils/DateUtils";
import Test from "../classes/Test";
import TestSuite from "../classes/TestSuite";
import Assertion from "../lib/Assertion";
import Logger from "../lib/Logger";

export default class SyncTests extends TestSuite {

    private static USER_DATA = {
        user : "test",
        password: "test",
        mail : "test.user@test.user",
        address: "0.0.0.0",
        platform : "Linux"
    }

    tests = [
       
        /**
         * Register a user on the database 
         * user : test
         * password : test
         * mail : test.user@test.user
         * device: 0.0.0.0
         * platform : Linux
         */
        new Test(async function registerUserTest() {

            request.body = SyncTests.USER_DATA;
            const paths = await Router.start("***","test")
            const body = await paths.register(request,response);

            Assertion.assert(body,"Cannot ping the sync API")
            Assertion.assert(body.success || body.code == 200 ,"The sync API send an error [" + body.code + "] " + body.message)

        }),

        /**
         * Login with the test user
         * user : test
         * password : test
         * mail : test.user@test.user
         * device: 0.0.0.0
         * platform : Linux 
         */
        new Test(async function loginTest() {

            request.body = SyncTests.USER_DATA;
            const paths = await Router.start("***","test")
            const body = await paths.login(request,response);

            Assertion.assert(body,"Cannot ping the sync API")
            Assertion.assert(body.success || body.code == 200 ,"The sync API send an error [" + body.code + "] " + body.message)
            
        }),        
        
        /**
         * Check if sync is working when the data is already sync
         * user : test
         * data : The exported data from the db
         * lastSync : Today's date, now.
         */
        new Test(async function alreadySyncTest() {

            // LOGIN
            request.body = SyncTests.USER_DATA;
            const paths = await Router.start("***","test")
            const res = await paths.login(request,response);

            Assertion.assert(res,"Cannot ping the sync API")
            Assertion.assert(res.success || res.code == 200 ,"The sync API send an error on login [" + res.code + "] " + res.message)

            Logger.log("Function: " + "Login")
            Logger.log("Success:  " + (res.success || res.code == 200))
            Logger.jump()

            // GET ACTUAL DATA
            const data = await BackupHandler.export("test");
            data.lastSync = DateUtils.toSQLiteDate(new Date())

            // SYNC
            request.body = {
                auth : "test",
                data : data
            }

            request.headers['auth'] = res.token;
            const body = await paths.sync(request,response);

            Assertion.assert(body,"Cannot ping the sync API")
            Assertion.assert(body.success && body.code == 605 ,"The sync API send an error on sync [" + res.code + "] " + res.message)

            Logger.log("Function: " + "Sync")
            Logger.log("Status:   " + body.code)
            Logger.log("Success:  " + (body.success || body.code == 605))    
        }),


        /**
         * Check if sync is working when the data is older than the last sync
         * user : test
         * data : Empty data with a date older than the last sync
         * lastSync : date older than the server last sync
         */
         new Test(async function outdatedSyncTest() {

            // LOGIN
            request.body = SyncTests.USER_DATA;

            const paths = await Router.start("***","test")
            const res = await paths.login(request,response);

            Assertion.assert(res,"Cannot ping the sync API")
            Assertion.assert(res.success || res.code == 200 ,"The sync API send an error on login [" + res.code + "] " + res.message)

            Logger.log("Function: " + "Login")
            Logger.log("Success:  " + (res.success || res.code == 200))
            Logger.jump()
       
            // SYNC
            request.body = {
                auth : "test",
                data : {
                    lastSync : "1975-1-1 00:00:00"
                }
            }

            request.headers['auth'] = res.token;
            const body = await paths.sync(request,response);

            Assertion.assert(body,"Cannot ping the sync API")
            Assertion.assert(body.lastSync == DateUtils.toSQLiteDate(new Date()),"Cannot ping the sync API")

            Logger.log("Function: " + "Sync")
            Logger.log("Status:   " + body.code)
            Logger.log("Success:  " + (body.success || body.code == 200))

         }),

         /*
         * Check if sync is working when the data is newer than the last sync
         * user : test
         * data : Data with a date newer than the last sync
         * lastSync : date newer than the server last sync
         */
        new Test(async function syncTest() {

            return "Ignoring test";
            // LOGIN
            request.body = SyncTests.USER_DATA

            const paths = await Router.start("***","test")
            const res = await paths.login(request,response);

            Assertion.assert(res,"Cannot ping the sync API")
            Assertion.assert(res.success || res.code == 200 ,"The sync API send an error on login [" + res.code + "] " + res.message)

            Logger.log("Function: " + "Login")
            Logger.log("Success:  " + (res.success || res.code == 200))
            Logger.jump()
       
            // SYNC
            const date = new Date();
            date.setDate(date.getDate() + 1);

            request.body = {
                auth : "test",
                data : {
                    lastSync : DateUtils.toSQLiteDate(date)
                }
            }

            request.headers['auth'] = res.token;
            const body = await paths.sync(request,response);

            console.log(JSON.stringify(body));
            
            Assertion.assert(body,"Cannot ping the sync API")
            Assertion.assert(body.lastSync == DateUtils.toSQLiteDate(new Date()),"Cannot ping the sync API")

            Logger.log("Function: " + "Sync")
            Logger.log("Status:   " + body.code)
            Logger.log("Success:  " + (body.success || body.code == 200))
            
        }),
    ]
    
    async runAll(){
        return await super.runAll(this.constructor.name)
    }
}