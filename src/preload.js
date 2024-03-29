// Electron 主进程 与 渲染进程 交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("editor_auto_script", {
	cmd: async (message) =>
		ipcRenderer.invoke("LiteLoader.editor_auto_script.cmd", message),
	changeHintText: (callback) =>
		ipcRenderer.on(
			"LiteLoader.editor_auto_script.changeHintText",
			callback
		),
});
