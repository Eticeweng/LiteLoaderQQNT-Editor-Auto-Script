const crypto = require("crypto");

const CHAR_TABLE = "abcdefghijklmnopqrstuvwxyz0123456789";

function _randomString(length = 12) {
	let final = "";
	for (let i = 0; i < +length; i++) {
		final +=
			CHAR_TABLE[Math.floor(Math.random() * (CHAR_TABLE.length - 1))];
	}
	return final;
}

function _hash(info, algr = "md5", digestWay = "hex") {
	return crypto.createHash(algr).update(info).digest(digestWay);
}

module.exports = {
	_randomString,
	_hash
};