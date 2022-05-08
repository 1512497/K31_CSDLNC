const mysql = require('mysql');
const mysql2Mongo = { };

mysql2Mongo.setup = function(host, db, user, passwd) {
	this._host = host;
	this._database = db;
	this._user = user;
	this._passwd = passwd;
	
	this._lastConnErr = null;
};

mysql2Mongo._connectAsync = function() {
	var this0 = this;
	var conn = mysql.createConnection({
		host: this0._host,
		user: this0._user,
		password: this0._passwd
	});
	return new Promise((resolve, reject) => {
		conn.connect(function(err) {
			var conn2 = conn;
			if (err != null) { conn2 = null; }
			resolve([err, conn2]);
		});
	});
};

mysql2Mongo.queryAsync = function(conn, sql) {
	return new Promise((resolve, reject) => {
		conn.query(sql, function(err, result, fields) {
			var result2 = result;
			if (err != null) { result2 = null; }
			resolve([err, result2, fields]);
		});
	});
};

mysql2Mongo.connectAsync = async function() {
	var this0 = this;
	var r = await this._connectAsync();
	var conn = r[1];
	if (conn != null) {
		var sql = "use " + this0._database;
		r = await this.queryAsync(conn, sql);
	}
	return conn;
}

mysql2Mongo.queryData = function(moduleInstance, rowID = null, search = null) {
	var tableName = moduleInstance._tableName;

	var instance = { };
	instance._mysql2Mongo = this;
	instance._moduleInstance = moduleInstance;
	instance._selectedRowID = rowID;
	instance._advSearch = search;
	instance._tableName = tableName;
	instance._skipRow = 0;

	Object.defineProperty(instance, "length", {
		get: function() {
			console.log('length', this._rowsCount);
			return this._rowsCount;
		}
	});
	
	instance._sqlWhere = function() {
		var rowID = this._selectedRowID;
		var advSearch = this._advSearch;
		
		var sql = "";
		if (rowID != null) {
			sql += " id = ";
			sql += mysql.escape(rowID);
		}
		
		if (advSearch != null) {
			var keys = Object.keys(advSearch);
			var n = keys.length;
			for (var i = 0; i < n; ++i) {
				var key = keys[i];
				if (sql.length > 0) {
					sql += " and ";
				}
				sql += key;
				sql += " REGEXP \'";
				sql += advSearch[key]["$regex"].source;
				sql += "\'";
			}
			
		}
		
		if (rowID != null || advSearch != null) {
			sql = " where " + sql;
		}
		return sql;
	};
	
	instance._defaultMapping = function(rows) {
		var result = [];
		var n = rows.length;
		for (var i = 0; i < n; ++i) {
			var row = rows[i];
			var keys = Object.keys(row);
			var m = { };

			var n2 = keys.length;
			for (var j = 0; j < n2; ++j) {
				var key = keys[j];
				if ("id" == key) {
					m._id = row.id;
				}
				else {
					m[key] = row[key];
				}
			}
			result.push(m);
		}
		return result;
	};
	
	instance.countDocuments = async function() {
		var result = 0;
		var conn = await this._mysql2Mongo.connectAsync();
		if (conn != null) {
			var sql = "select count(*) as N from " + this._tableName;
			sql += this._sqlWhere();
			
			var r = await this._mysql2Mongo.queryAsync(conn, sql);
			var rows = r[1];
			result = parseInt(rows[0].N);
			conn.end();
		}
		return result;
	};
	
	instance.skip = function(n) {
		this._skipRow = n;
		return this;
	};
	
	instance.limit = async function(n) {
		var result = null;
		var conn = await this._mysql2Mongo.connectAsync();
		if (conn != null) {
			var sql = "select * from " + this._tableName;
			sql += this._sqlWhere();
			
			var skipRow = this._skipRow;
			if (skipRow != null && n != null) {
				sql += " limit ";
				sql += skipRow;
				sql += ", ";
				sql += n;
			}
			
			var r = await this._mysql2Mongo.queryAsync(conn, sql);
			var rows = r[1];
			result = this._defaultMapping(rows);
			result = this._moduleInstance._convModel(result);
			conn.end();
		}
		return result;
	};

	return instance;
};

mysql2Mongo.model = function(name, schema) {
	var moduleInstance = {};
	
	moduleInstance._mysql2Mongo = this;
	moduleInstance._tableName = name.toLowerCase();
	moduleInstance._schema = schema;
	
	moduleInstance[name] = function(data) {
		console.log(data);
		return null;
	};
	
	moduleInstance._convModel = function(rows) {
		var schema = this._schema.obj;
		var schemaKeys = Object.keys(schema);
		var n2 = schemaKeys.length;
		
		var n = rows.length;
		for (var i = 0; i < n; ++i) {
			var row = rows[i];
			for (var j = 0; j < n2; ++j) {
				var key = schemaKeys[j];
				if (key in row) {
					continue;
				}
				row[key] = schema[key].type();
			}
			//
		}
		return rows;
	};
	
	moduleInstance.find = function(search = null) {
		var result = this._mysql2Mongo.queryData(this, null, search);
		if (search != null) {
			result = result.skip(null).limit(null);
		}
		return result;
	};
	
	moduleInstance.findById = async function(id) {
		var r = this._mysql2Mongo.queryData(this, id, null);
		var rows = await r.skip(0).limit(1);
		var result = rows[0];
		return result;
	};
	
	return moduleInstance;
}

module.exports = mysql2Mongo;
