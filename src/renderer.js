// 运行在 Electron 渲染进程 下的页面脚本


onLoad();

const STYLE_ID = "editor-auto-script";
function patchCSS() {
	let cssNode = document.querySelector(`html > head > style[id=${STYLE_ID}]`);
	if (cssNode) {
		cssNode.parentNode.removeChild(cssNode);
	}
	let cssPatch = document.createElement("style");
	cssPatch.setAttribute("id", STYLE_ID);
	cssPatch.setAttribute("type", "text/css");
	cssPatch.innerText = `
	.auto-script-hint {position: absolute;right: 0px;bottom: 0px;margin-right: 8px;pointer-events: none;}`;
	document.querySelector("html > head").appendChild(cssPatch);
}

async function onLoad() {
	editor_auto_script.changeHintText(async (e, message) => {
		let nullableNode = document.querySelector(".auto-script-hint");
		if (nullableNode) {
			nullableNode.innerText = message;
		}
	});

	// editor_auto_script.push

	let loopInjector = setInterval(() => {
		let nullableNode = document.querySelector(".ml-list.list");
		if (nullableNode) {
			let hintNode = document.createElement("DIV");
			hintNode.classList.add("auto-script-hint");
			document.querySelector(".ck-editor").appendChild(hintNode);
			patchCSS();
			clearInterval(loopInjector);
		}
	}, 500);
}
