# LiteLoaderQQNT-Editor-Auto-Script  

为QQNT编辑区域添加拦截格式化字符串指令的功能，将对应匹配的指令字符串替换为对应指令的文字输出或者执行代码  

需要安装[LLQQNT](https://github.com/LiteLoaderQQNT/LiteLoaderQQNT)  

### 用法  
直接在编辑区域输入对应格式的指令即可，以符号格式`${}`包裹指令  
暂不支持指令嵌套如`${hash: ${rdStr: 12}}`的功能  
例如
```
现在是${timeNow} @someone，这是你刚刚要的一串24位的随机字符串${rdStr: 24}
这是一串md5: ${hash: "HELLO WORLD"}
```
会被在发送的时候拦截下来并替换为以下文本并发送
```
现在是2024/3/29 00:00:00 @someone，这是你刚刚要的一串24位的随机字符串myks7pyj6qgpzrn3att4dat4
这是一串md5: 361fadf1c712e812d198c4cab5712a79
```
![{0359A7DD-2A99-4252-AE4C-F6E42E014510}](https://github.com/Eticeweng/LiteLoaderQQNT-Editor-Auto-Script/assets/43090280/1d3ee956-e76d-490b-9416-b9dbf989680e)

### 格式  
基础用法为
`${<cmd>[:] [["]...params["]]}`  
`cmd`为必填，作为指令  
`params`为参数可以传入多个，参数可以使用`""`包裹使解释器将其视为一个参数而不是由空格分隔的多个参数  


### 内置指令  
#### `timeNow`  
输出当前时间和日期  


#### `repeat: <info> <time> [insertDelimiter]`  
重复传入的字符串n次，可以自定义是否插入` `分隔符  
`info`: 需要重复的字符串  
`time`: 重复的次数  
`insertDelimiter`: 是否插入分隔符` `，可选，默认为不插入  


#### `rdStr: [length]`  
生成一串随机字符串，默认长度为`12`  
`length`: 重复次数，可选，默认为`12`  


#### `hash: <info> [algr] [digestWay]`  
计算传入的信息的hash  
`info`: 需要计算hash的字符串  
`algr`: 算法，可选，默认为`md5`，可选的值为NodeJS中`crypto.createHash`可以支持的算法  
`digestWay`: 输出的hash的编码方式，可选，默认为`hex`，可选的值为NodeJS中`Hash.digest`可以支持的encoding 

### 自定义指令
可在`src/localCmd.js`中自定义指令  
#### 用法  
将对应的自定义函数追加到常量`APPEND_FUNCTION`中即可，脚本将会在启动的时候自动把自定义的函数添加到列表中  
该脚本运行在`main`进程下，所以无法访问到`renderer`下的例如`document`对象，若需要请自行编写  
#### 自定义函数  
`src/localCmd.js`中内建了一个自定义函数的参考模板  
```
"${exmple}": (params, window) => { /* code */ }
```
`params`为传入的参数，为一个数组，通过下标读取  
`window`为从`main`中获取的window对象，可以访问`webContents`等对象进行操作  
#### 返回值

若为成功，则直接返回替换后的字符串结果  
若为失败，则返回`{ __error__: true }`对象，此时拦截器会将该指令替换为`?`字符  

### 指令执行反馈  
目前仅有在编辑器右下方区域提供的一小块`class`为`.auto-script-hint`的`div`容器作为文字提示  
可以通过修改css来变更其样式  
若需要反馈可以使用ID`LiteLoader.editor_auto_script.changeHintText`来变更该区域的提示文字，具体用法为  
```
window.webContents.send("LiteLoader.editor_auto_script.changeHintText", "Hello");
```
将会在编辑器右下角区域显示文字`Hello`  

### 其他  
此插件对消息信道拦截的代码来源于大佬[MisaLiu](https://github.com/MisaLiu)编写的[LiteLoaderQQNT-Pangu](https://github.com/MisaLiu/LiteLoaderQQNT-Pangu/)  
因为都是对发出的消息进行修改，所以可能会与其产生冲突，暂时无法解决，请见谅
