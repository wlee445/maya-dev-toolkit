import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import * as net from "net";
import * as log from "./log";

var logger = log.Logger.getInstance()

export class MayaDebugToolkit{
    public commandPort :number;
    private socket : net.Socket | any;
    constructor(
        commandPort:number,
    ){
        this.commandPort = commandPort;
        // this.reconnect(commandPort)
    }
    private reconnect(commandPort:number){
        
        if (!this.socket || this.socket.closed) {
            // 初始化 Socket 
            let socket = net.createConnection({port:this.commandPort},function(){
                logger.info(`Maya Port: ${commandPort} 链接成功！`)
            })
            socket.on('error', function (error) {
                logger.info(`Maya Port: ${commandPort} 链接失败！`)
                logger.info("复制以下代码到 Maya Script Editor （Python）运行\r\n\r\nimport maya.cmds as cmds\r\nif not cmds.commandPort(\":4648\",q=True):cmds.commandPort(n=\":4648\",stp=\"mel\",echoOutput=True)")
            });
            socket.on('data', function (data) {
                logger.info(data.toString());
            });
            socket.on('end', function () {
                logger.info(`Maya Port: ${commandPort} 断开链接！`);
            });
            this.socket = socket;
        }
    }

    private sendData(data:string){
        // logger.info(data);
        this.reconnect(this.commandPort);
        return this.socket.write(data + '\n',"utf-8");
    }

    private sendPyTmpFile(uri:any){
        const temp_path = path.join(path.dirname(__dirname), "py");
        const file_name = path.basename(uri.fsPath, ".py");
        const file_path = path.dirname(uri.fsPath);
        const attach_code = `
import sys
path = r"${file_path}"
if path not in sys.path:
    sys.path.insert(0,path)
from importlib import reload

if "${file_name}" not in globals():
    import ${file_name}
else:
    reload(${file_name})
`;
    const debugPath = path.join(os.tmpdir(), 'maya_python_debug_tmp.py').replaceAll("\\","/");
    fs.writeFile(debugPath,attach_code, function (err) {
        if (err) {
            logger.info(`Failed to write code to temp file ${debugPath}`);
        }
    })
    // with open(file_name, 'r') as fff:
    //     exec(compile(fff.read(), file_name, 'exec'))
    this.sendData(`python(\"with open(r'${debugPath}', 'r') as fff:\\r\\n    exec(compile(fff.read(), r'${debugPath}', 'exec'))\")`)
    };

    public sendToMaya(){
        const activeTextEditor = vscode.window.activeTextEditor;
        if ( (activeTextEditor == undefined)) {
            logger.info("未获取到当前激活的文档")
            return;
        }
        if ( ! (activeTextEditor.document.languageId == "mayamel" || "python")){
            logger.info("当前文档类型不是 mel 或 python ")
        }
        
        let send_text :string = "";
        if (activeTextEditor.document.languageId == "mayamel") {
            send_text = activeTextEditor.document.getText()
            this.sendData(send_text);
        }
        else if (activeTextEditor.document.languageId == "python"){
            this.sendPyTmpFile(activeTextEditor.document.uri)
        }
    }

    public debugAttachProcessId(){
        // 开启 Debug 模式
        let configuration = {
            "name": "Maya Python Debugger: Attach using Process Id",
            "type": "debugpy",
            "request": "attach",
            "processId": "${command:pickProcess}"
        };
        return vscode.debug.startDebugging(undefined, configuration);
    }
}