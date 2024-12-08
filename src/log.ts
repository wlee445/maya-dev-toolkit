import * as vscode from 'vscode';

export class Logger {
    private static instance: Logger;
    private outputChannel:vscode.OutputChannel;
    private constructor() {
        this.outputChannel = vscode.window.createOutputChannel("Maya Output")
        const maya_config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("maya");
        if (maya_config.get<boolean>("log", false)) {
            this.outputChannel.show()
        }
        
    }
    public static getInstance() : Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    public get_outputChannel(){
        return this.outputChannel;
    }
    public info(str:string) {
        if (str == "\n") {
            return
        }
        this.outputChannel.appendLine(str.replace(/\u0000/g,"").replaceAll("\n\n",""))
    }
}


