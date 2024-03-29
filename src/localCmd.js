const APPEND_FUNCTION = {
    // 用法 ${命令: ["]参数1["] ...参数2}
    "${example}": async (params, window) => { // params 为传入参数，通过下标访问，空格分隔
        return await new Promise(resolve => setTimeout(() => resolve(params[0]), 1000))
        .then(r => {
            window.webContents.send( // 发送到编辑器右下角的提示文本中
                "LiteLoader.editor_auto_script.changeHintText",
                `${r}`
            );
            return r;
        })
        .catch(err => {
            window.webContents.send(
                "LiteLoader.editor_auto_script.changeHintText",
                `${err}`
            );
            return { __error__: true }; // 失败则返回该对象
        })
    }
}

module.exports = {
    APPEND_FUNCTION
}