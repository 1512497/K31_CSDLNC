const neo4j = require('neo4j-driver');
const productReviews = { };

productReviews.setup = function(uri, database, user, passwd) {
	this._uri = uri;
	this._database = database;
	this._user = user;
	this._passwd = passwd;
};

productReviews.getAll = async function(productId) {
	var result = [];
	var driver = neo4j.driver(this._uri, neo4j.auth.basic(this._user, this._passwd));
	var session = driver.session({ database: this._database});
	try {
		var cypher = "";
		cypher += "match (n)-[r:child*]-(m) where id(n) = ";
		cypher += "$productId";
		cypher += " return m.comment";
		
		var r = await session.run(
			cypher,
			{ productId: productId }
		);

		result = r.records;
	} finally {
		await session.close();
	}
	await driver.close();
	return result;
};

module.exports = productReviews;
