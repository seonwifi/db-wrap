"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSqlUpdate = exports.convertSqlInsert = exports.MariaDB = void 0;
const mariadb = require('mariadb');
class MariaDB {
    constructor() {
        /*
        ���� ���� �� ����
        
        https://stackoverflow.com/questions/44946270/er-not-supported-auth-mode-mysql-server
        mysql-installer-community-8.0.19.0.msi ����
        MySQL Server ... Reconfiure Ŭ�� �ι�° Authentication Method
        Authentiocation Method ���� �ؿ��� Use Legacy Authentication Method ���� (�̽� �ִ°� ����)
        �̰� �Ǿ� ���� ������ ������ ��Ʈ ������� ������ ���� ����
        
        
        */
        this.TAG = "MariaDB: ";
        this.pool = null;
        this.con = null;
        this.queryNumber = 0;
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //commcon
    init(dbConfig) {
        //var dbConfig = {
        //	host: "127.0.0.1",
        //	port: 3306,
        //	user: "root",
        //	password: "nba769937", 
        //	database: 'test_database' 
        //};
        //var dbConfig = {
        //	host: "worldbench.cqz0byzxa5kz.ap-northeast-2.rds.amazonaws.com",
        //	port: 3306,
        //	user: "admin",
        //	password: "nba769937",
        //	database: 'test'
        //}; 
        let bSuccess = false;
        try {
            this.pool = mariadb.createPool(dbConfig);
            bSuccess = this.pool != null;
        }
        catch (_a) {
            console.error(this.TAG + "error init mariadb.createPool fail: ");
            bSuccess = false;
        }
        return bSuccess;
    }
    close() {
        if (this.pool) {
            this.pool.end();
        }
    }
    createDatabase(sql, callbackfn) {
        console.log(this.TAG + "try createDatabase");
        this.query(sql, callbackfn);
    }
    createTable(sql, callbackfn) {
        console.log(this.TAG + "try createTable");
        this.query(sql, callbackfn);
    }
    insert(sql, callbackfn) {
        console.log(this.TAG + "try insert");
        this.query(sql, callbackfn);
    }
    update(sql, callbackfn) {
        console.log(this.TAG + "try update");
        this.query(sql, callbackfn);
    }
    delete(sql, callbackfn) {
        console.log(this.TAG + "try delete");
        this.query(sql, callbackfn);
    }
    select(sql, callbackfn) {
        console.log(this.TAG + "try select");
        this.query(sql, callbackfn);
    }
    dropTable(tableName, callbackfn) {
        console.log(this.TAG + "try dropTable");
        this.query(tableName, callbackfn);
    }
    query(sql, callbackfn) {
        return __awaiter(this, void 0, void 0, function* () {
            this.queryNumber++;
            console.log(this.TAG + "------------------ begin query " + this.queryNumber + " ------------------");
            console.log(this.TAG + "query: " + sql);
            let _this = this;
            if (this.pool == null) {
                console.error(_this.TAG + "query: ");
                if (callbackfn) {
                    let obj = new Object();
                    obj.code = "ER_POOL_NULL";
                    obj.errno = 9999991;
                    obj.fatal = false;
                    obj.message = this.TAG + "this.pool == nul";
                    obj.sqlState = "query fail";
                    obj.stack = "no stack";
                    callbackfn(obj, null, null);
                }
                else {
                    console.error(_this.TAG + "this.pool == nul callbackfn == null");
                }
                return;
            }
            let conn = null;
            try {
                conn = yield this.pool.getConnection();
                const resQuery = yield conn.query(sql);
                if (callbackfn) {
                    if (resQuery) {
                        console.log(_this.TAG + "success Query: " + JSON.stringify(resQuery));
                    }
                    else {
                        console.log(_this.TAG + "success Query: NULL");
                    }
                    callbackfn(null, resQuery, null);
                }
                else {
                    console.error(_this.TAG + "try callbackfn == null");
                }
                console.log(_this.TAG + "queryed");
            }
            catch (err) {
                let errorJsonText = JSON.stringify(err);
                if (err.code == "ER_TABLE_EXISTS_ERROR") { // ���̺� ������ �̹� ������
                    console.log(_this.TAG + err + " errorJson: " + errorJsonText);
                }
                else if (err.code == "ER_DB_CREATE_EXISTS") { // ����Ÿ ���̽� ������ �̹� ������
                    console.log(_this.TAG + err + " errorJson: " + errorJsonText);
                }
                else if (err.code == "ER_DUP_ENTRY") { // insert �� primary Ű�� ������
                    console.log(_this.TAG + err + " errorJson: " + errorJsonText);
                }
                else {
                    console.error(_this.TAG + err + " errorJson: " + errorJsonText);
                }
                if (callbackfn) {
                    callbackfn(err, null, null);
                }
                else {
                    console.error(_this.TAG + "catch callbackfn == null");
                }
            }
            finally {
                if (conn) {
                    conn.release(); //release to pool
                    console.log(_this.TAG + "conn.release();");
                }
                console.log(_this.TAG + "------------------ end query " + this.queryNumber + " ------------------");
            }
        });
    }
}
exports.MariaDB = MariaDB;
function convertSqlInsert(dbObj, tableName) {
    var names = Object.getOwnPropertyNames(dbObj);
    var culumn = "";
    var culumnValue = "";
    names.forEach(function (val, idx, array) {
        var objValue = dbObj[val];
        var objValueType = typeof (objValue);
        culumn += val;
        if (objValueType == 'string') {
            culumnValue += "'" + objValue + "'";
        }
        else if (objValueType == 'number') {
            culumnValue += objValue;
        }
        else if (objValueType == 'object') {
            culumnValue += "'" + JSON.stringify(objValue) + "'";
        }
        else if (objValueType == 'boolean') {
            culumnValue += objValue;
        }
        else {
            console.log('Unknow objValueType: ' + objValueType);
            return;
        }
        if (idx < array.length - 1) {
            culumn += ',';
            culumnValue += ',';
        }
    });
    var sql = 'INSERT INTO {tableName} ({field}) VALUES({val})';
    sql = sql.replace('{tableName}', tableName);
    sql = sql.replace('{field}', culumn);
    sql = sql.replace('{val}', culumnValue);
    return sql;
}
exports.convertSqlInsert = convertSqlInsert;
function convertSqlUpdate(dbObj) {
    var names = Object.getOwnPropertyNames(dbObj);
    var update = "";
    names.forEach(function (val, idx, array) {
        var objValue = dbObj[val];
        var objValueType = typeof (objValue);
        var sqlValue = '';
        if (objValueType == 'string') {
            sqlValue = "'" + objValue + "'";
        }
        else if (objValueType == 'number') {
            sqlValue = objValue;
        }
        else if (objValueType == 'object') {
            sqlValue = "'" + JSON.stringify(objValue) + "'";
        }
        else if (objValueType == 'boolean') {
            sqlValue = objValue;
        }
        else {
            return;
        }
        var keyValue = '{key}={value} ';
        keyValue = keyValue.replace('{key}', val);
        keyValue = keyValue.replace('{value}', sqlValue);
        update += keyValue;
    });
    var sql = "UPDATE {tableName} SET {update}";
    sql = sql.replace('{tableName}', 'mytable');
    sql = sql.replace('{update}', update);
    return sql;
}
exports.convertSqlUpdate = convertSqlUpdate;
//# sourceMappingURL=maria-db.js.map