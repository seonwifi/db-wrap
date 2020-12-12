 
 //varsion 0.0.3
const mariadb = require('mariadb'); 

export class MariaDB
{
/*
연결 문제 시 참고

https://stackoverflow.com/questions/44946270/er-not-supported-auth-mode-mysql-server
mysql-installer-community-8.0.19.0.msi 실행
MySQL Server ... Reconfiure 클릭 두번째 Authentication Method
Authentiocation Method 에서 밑에꺼 Use Legacy Authentication Method 선택 (이슈 있는거 같음)
이게 되어 있지 않으면 아이피 포트 관계없이 연결이 되지 않음


*/

	public TAG = "MariaDB: "; 
	private pool: any = null;
	private con: any = null;
	private queryNumber: number = 0; 

    constructor() {

    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//commcon
	init(  dbConfig: any): boolean {
		  
		let bSuccess = false;
		try {
			this.pool = mariadb.createPool(dbConfig); 

			bSuccess = this.pool != null;
		}
		catch {
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

	createDatabase(sql: string, callbackfn: (err: any, result: any, fields: any) => void) { 
		 
		console.log(this.TAG + "try createDatabase");

		this.query(sql, callbackfn);
	} 

	createTable(sql: string, callbackfn: (err: any, result: any, fields: any) => void) {
		console.log(this.TAG + "try createTable");

		this.query(sql, callbackfn);
	}

	insert(sql: string, callbackfn: (err: any, result: any, fields: any) => void) {

		console.log(this.TAG + "try insert");

		this.query(sql, callbackfn);
	}

	update(sql: string, callbackfn: (err: any, result: any, fields: any) => void) {
		console.log(this.TAG + "try update");
		this.query(sql, callbackfn);
	}

	delete(sql: string, callbackfn: (err: any, result: any, fields: any) => void) {
		console.log(this.TAG + "try delete");
		this.query(sql, callbackfn);
	}

	select(sql: string, callbackfn: (err: any, result: any, fields: any) => void) {
		console.log(this.TAG + "try select");
		this.query(sql, callbackfn); 
	}

	dropTable(tableName: string, callbackfn: (err: any, result: any) => void) {
		console.log(this.TAG + "try dropTable");
		this.query(tableName, callbackfn);
	}

	async query(sql: string, callbackfn: (err: any, result: any, fields: any) => void) {

		this.queryNumber++;

		console.log(this.TAG + "------------------ begin query " + this.queryNumber + " ------------------");

		console.log(this.TAG + "query: " + sql);

		let _this = this;

		if (this.pool == null) {
			console.error(_this.TAG + "query: ");

			if (callbackfn) {
				let obj : any = new Object();
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

			conn = await this.pool.getConnection();
			const resQuery = await conn.query(sql);

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

		} catch (err) {

			let errorJsonText = JSON.stringify(err);
			if (err.code == "ER_TABLE_EXISTS_ERROR") {// 테이블 생성시 이미 존재함
				console.log(_this.TAG + err + " errorJson: " +errorJsonText);
			}
			else if (err.code == "ER_DB_CREATE_EXISTS") {// 데이타 베이스 생성시 이미 존재함
				console.log(_this.TAG + err + " errorJson: " + errorJsonText);
			}
			else if (err.code == "ER_DUP_ENTRY") {// insert 시 primary 키가 존재함
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
		} finally {
			 
			if (conn) {
				conn.release(); //release to pool
				console.log(_this.TAG + "conn.release();");
			} 

			console.log(_this.TAG + "------------------ end query " + this.queryNumber + " ------------------");
		}

 
	}

//commcon
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// only

// only
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}


export function convertSqlInsert(dbObj: any, tableName): string {

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

export function convertSqlUpdate(dbObj: any): string  {

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