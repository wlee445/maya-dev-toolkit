// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from "path";
import * as mayamel from "./mayamel_toolkit";
import * as maya_debug from "./maya_debug_toolkit";
import * as log from "./log";



// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "maya-dev-toolkit" is now active!');


	// 获取 配置
	const maya_config:vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("maya");
	const code_completion_path :string = maya_config.get<string>("code.MelCompletionPath","");
	const code_extend_lib_path :string = maya_config.get<string>("code.ExtendLibPath","");
	const code_command_port :number = maya_config.get<number>("code.CommandPort",4648);

	//  设置 Maya Python Extend Lib Path
	let python_config = vscode.workspace.getConfiguration("python");
    let extra_paths: string[] = python_config.get("autoComplete.extraPaths",[]);
    if (!extra_paths.includes(code_extend_lib_path)) {
        extra_paths.splice(0, 0, code_extend_lib_path);
        python_config.update("autoComplete.extraPaths", extra_paths, true);
    }
	
	// 注册 maya mel 自动补充
	vscode.languages.registerCompletionItemProvider(
		"mayamel",
		new mayamel.MayamelCompletionItemProvider(code_completion_path)
	);

	// 注册 maya mel 悬停提示
	vscode.languages.registerHoverProvider(
		"mayamel",
		new mayamel.MayamelHoverProvider(code_completion_path)
	)
	// 注册 logger 
	let logger = log.Logger.getInstance();
	context.subscriptions.push(logger.get_outputChannel());

	// 注册 Send To Maya 命令 
	let mayaDebugToolkit = new maya_debug.MayaDebugToolkit(code_command_port)
	let disposable = vscode.commands.registerCommand('maya-dev-toolkit.SendToMaya', () => {
		mayaDebugToolkit.sendToMaya()
	});
	context.subscriptions.push(disposable);
	// 注册 Maya Python Debugger 命令 
	disposable = vscode.commands.registerCommand('maya-dev-toolkit.MayaPythonDebugger', () => {
		mayaDebugToolkit.debugAttachProcessId()
	});
	context.subscriptions.push(disposable);

}

// This method is called when your extension is deactivated
export function deactivate() {}
