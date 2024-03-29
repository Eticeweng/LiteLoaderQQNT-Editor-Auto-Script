const { APPEND_FUNCTION } = require("./localCmd");
const { _hash, _randomString } = require("./_utils");

let FUNCTION_MAP = {
	"${timeNow}": (params) =>
		new Date().toLocaleTimeString("zh-cn", {
			month: "numeric",
			year: "numeric",
			day: "numeric",
		}),
	"${repeat}": (params) =>
		(params[0] + (+params[2] ? " " : "")).repeat(+params[1]),
	"${rdStr}": (params) => _randomString(params[0]), // ${hash: [length]}
	"${hash}": (params) => _hash(params[0], params[1], params[2]), // ${hash: <info> [algr] [digestWay]}
	// "${encrypt}": (params) => { // ${encrypt: <info> [algr] [key] [iv]}
	// 	const _key = params[2] || "hash-key-default";
	// 	const key = Buffer.from(_key);

	// 	const _iv = params[3] || "nerf-kin-sudo";
	// 	const iv = Buffer.from(_iv.length >= 16 ? _iv.substring(0, 16) : _iv.padEnd(16, "Z"));

	// 	const cipher = crypto.createCipheriv(params[1] || "aes-256-cbc", key, iv);
	// 	let r = cipher.update(params[0], "utf-8", "hex");
	// 	r += cipher.final("hex");

	// 	return r;
	// }
};
FUNCTION_MAP = Object.assign(FUNCTION_MAP, APPEND_FUNCTION);
function paramsProcessor(raw) {
	let _cache = [];
	let _frag = [];
	let _stringLikeMarker = false;
	for (let p of raw) {
		if (p === '"') {
			_stringLikeMarker = !_stringLikeMarker;
			continue;
		}
		if (p === " " && !_stringLikeMarker) {
			_cache.push(_frag);
			_frag = [];
			continue;
		}
		_frag.push(p);
	}
	_cache.push(_frag);
	return _cache.map((f) => f.join(""));
}
const SEARCH_PATTRERN = /\$\{.*?\}/g;
function _split(raw, divideBy = ":") {
	let index = raw.indexOf(divideBy);
	return [raw.slice(0, index), raw.slice(index + 1)];
}
function cmdProcessor(complex) {
	let splitedComplex = _split(complex);
	if (splitedComplex.length > 1) {
		let cmd = splitedComplex[0];
		let params = paramsProcessor(splitedComplex[1].trim());

		let lastIndex = params.length - 1;
		params[lastIndex].endsWith("}") &&
			(params[lastIndex] = params[lastIndex].slice(
				0,
				params[lastIndex].length - 1
			));
		return [`${cmd}}`, params];
	}
	return [complex];
}

async function cmd(originalMessage, window) {
	let message = [...originalMessage.matchAll(SEARCH_PATTRERN)];
	let final = [];
	let first = true;
	let lastStopIndex = 0;
	for (let index = 0; index < message.length; index++) {
		let _cmd = message[index][0];
		let start = first ? 0 : lastStopIndex;
		lastStopIndex = message[index].index + message[index][0].length;
		let end = message[index].index;
		final.push(originalMessage.slice(start, end));
		let complex = cmdProcessor(_cmd);
		let _fn = FUNCTION_MAP[complex[0]];
		if (!_fn) {
			window.webContents.send(
				"LiteLoader.editor_auto_script.changeHintText",
				`No such cmd, try ${[
					Object.entries(FUNCTION_MAP)
						.map((entry) => entry[0])
						.join(","),
				]}`
			);
			final.push("?");
			first = false;
			continue;
		}
		final.push(await _fn(complex[1], window));
		first = false;
	}
	final.push(originalMessage.slice(lastStopIndex));
	return final.map((f) => (f["__error__"] ? "?" : f)).join("");
}

module.exports = {
	cmd,
};
