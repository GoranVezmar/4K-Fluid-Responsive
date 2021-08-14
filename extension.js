const vscode = require('vscode');
const cpt = require('copy-paste');
const { parse, stringify } = require('scss-parser')
const prettier = require('prettier');

let configuration = vscode.workspace.getConfiguration("4k-fluid-responsive", vscode.Uri);
let baseDesignWidth = configuration.get("designWidth");

const formatRule = (rule) => {
	const filteredRule = rule.value[1].value.filter(val => {
		if(val.type === 'rule') {
			return formatRule(val);
		} else if (val.type === 'declaration') {
			return formatDelaration(val);
		} else {
			return false;
		}
	})
	if(filteredRule.length > 0) {
		rule.value[1].value = filteredRule;
		return true;
	} else {
		return false;
	}
}

const formatDelaration = (declaration) => {
	let value;
	declaration.value.forEach(val => {
		if(val.type === 'value') {
			value = val;
		}
	})
	if(!value) return false;

	let indetifier;
	let func;
	value.value.forEach(val => {
		if(val.type === 'identifier' && val.value === 'px') {
			indetifier = true;
		}
		if(val.type === 'function') {
			func = true;
		}
	})
	
	if(!indetifier && !func) return false;
	
	if(indetifier) {
		let newValue = [];
		value.value.forEach((val, index) => {
			let newVal = {...val};
			if(value.value[index + 1]) {
				if(val.type === 'number' && value.value[index + 1].value === 'px') {
					const vwValue = (parseInt(val.value) / baseDesignWidth * 100).toFixed(5).toString()
					newVal.value = vwValue;
				}
			}
			if(val.type === 'identifier' && val.value === 'px') {
				newVal.value = 'vw';
			}
			newValue.push(newVal);
		})
		value.value = newValue;
		return true;
	}
	if(func) {
		let newValue = [];
		let hasPxInside = false;
		value.value.forEach(val => {
			let newVal = {...val};
			let newArgs = [];
			if(val.type === "function") {
				val.value[1].value.forEach((arg, index) => {
					const newArg = {...arg};
					if(val.value[1].value[index + 1]) {
						if(arg.type === 'number' && val.value[1].value[index + 1].value === 'px') {
							const vwValue = (parseInt(arg.value) / baseDesignWidth * 100).toFixed(5).toString()
							newArg.value = vwValue;
							hasPxInside = true;
						} 
					}
					if(arg.type === 'identifier' && arg.value === 'px') {
						newArg.value = 'vw';
					}
					newArgs.push(newArg);
				})
				val.value[1].value = newArgs;
				newValue.push(newVal);
			}
		})
		value.value = newValue;
		if(!hasPxInside) return false;
		return true;
	}
}

function activate(context) {

	let disposable = vscode.commands.registerCommand('4k-fluid-responsive.ConvertToVWs', function () {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return; 

		configuration = vscode.workspace.getConfiguration("4k-fluid-responsive", vscode.Uri);
		baseDesignWidth = configuration.get("designWidth");

		const selectedText = editor.document.getText(editor.selection);
		const parsedText = parse(selectedText);
		const formatedText = parsedText.value.filter(val => {
			if(val.type === 'rule') {
				return formatRule(val);
			} else if (val.type === 'declaration') {
				return formatDelaration(val);
			} else {
				return false;
			}
		})
		parsedText.value = formatedText;
		const finalText = stringify(parsedText);
		const prettierText = prettier.format(finalText, {
			parser: "scss"
		});

		cpt.copy(prettierText, ()=> {
			vscode.window.showInformationMessage('Pixels have been converted to VWs!');
		})
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
