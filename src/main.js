// 运行在 Electron 主进程 下的插件入口

const { app, ipcMain, dialog } = require("electron");
const { cmd } = require("./cmd");

// 创建窗口时触发
module.exports.onBrowserWindowCreated = (window) => {
	// window 为 Electron 的 BrowserWindow 实例
	hookQQNTApiCall(window);
};

const HookApiPreProcesses = [];

// from https://github.com/MisaLiu/LiteLoaderQQNT-Pangu/
function hookQQNTApiCall(window) {
	const webContents = window.webContents;
	const ipcUpMsg =
		webContents._events["-ipc-message"]?.[0] ||
		webContents._events["-ipc-message"];

	const ipcUpMsgProxy = new Proxy(ipcUpMsg, {
		async apply(target, thisArg, args) {
			if (
				!args[3][1] ||
				!(args[3][1] instanceof Array) ||
				typeof args[3][1][0] !== "string"
			) {
				return target.apply(thisArg, args);
			}

			const newArgs = args;
			try {
				const [postHead, [postCommand, ...postPayload]] = newArgs[3];
				if (!!postPayload && postPayload.length > 0) {
					for (const hook of HookApiPreProcesses) {
						if (hook.command !== postCommand) continue;
						const newPostPayload = (await hook.hookFn([...postPayload], window));
						newArgs[3] = [
							postHead,
							[postCommand, ...newPostPayload],
						];
					}
				}
			} catch (__) {
				console.log(__);
			}

			return (await target.apply(thisArg, newArgs));
		},
	});

	if (
		webContents._events["-ipc-message"] &&
		webContents._events["-ipc-message"][0]
	) {
		webContents._events["-ipc-message"][0] = ipcUpMsgProxy;
	} else {
		webContents._events["-ipc-message"] = ipcUpMsgProxy;
	}
}

// from https://github.com/MisaLiu/LiteLoaderQQNT-Pangu/
function addApiPreProcess(postCommand, hookFn) {
	return HookApiPreProcesses.push({
		command: postCommand,
		hookFn,
	});
}

// from https://github.com/MisaLiu/LiteLoaderQQNT-Pangu/
addApiPreProcess("nodeIKernelMsgService/sendMsg", async (payload, window) => {
	const newPayload = payload;
	newPayload[0] = (await doCmdReplace(payload[0], window));
	return newPayload;
});

// from https://github.com/MisaLiu/LiteLoaderQQNT-Pangu/
async function doCmdReplace(msgData, window) {
	const newMsgElements = [ ...msgData.msgElements ];

	for (const msgElement of newMsgElements) {
	  if (msgElement.elementType !== 1) continue;
	  if ((msgElement).textElement.atType !== 0) continue;
  
	  const { content } = (msgElement).textElement;
	  (msgElement).textElement.content = (await cmd(content, window));
	}

	return {
	  msgId: msgData.msgId,
	  peer: msgData.peer,
	  msgElements: newMsgElements,
	  msgAttributeInfos: msgData.msgAttributeInfos,
	};
  }

onLoad();
function onLoad() {
}
