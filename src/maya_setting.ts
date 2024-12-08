import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { error } from 'console';

function initDevDir(projectName: string | undefined, version: string[] | undefined, extensionPath: string) {
    // 合法性验证
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage("Do not found workspaceFolders ")
        return;
    }
    if (!(projectName && version && version.length > 0 && extensionPath)) {
        return;
    }

    if (projectName == undefined) {
        vscode.window.showErrorMessage(`Project name is undefined`)
        return;
    }
    if (!(version && version.length > 0)) {
        vscode.window.showErrorMessage(`Version error :${version}`)
        return;
    }
    if (extensionPath == undefined) {
        vscode.window.showErrorMessage(`ExtensionPath error :${extensionPath}`)
        return;
    }

    // 处理路径
    let root_dir = vscode.workspace.workspaceFolders[0].uri.fsPath;
    let module_dir = path.join(root_dir, "module")
    let sources_dir = path.join(root_dir, "sources")
    let scripts_dir = path.join(sources_dir, "scripts")
    let shelves_dir = path.join(sources_dir, "shelves")
    let plugins_dir = path.join(sources_dir, "plug-ins")
    let template_path = path.join(extensionPath, "resources", "template")

    //  创建目录结构
    let dir_array = [module_dir, sources_dir, scripts_dir, shelves_dir, plugins_dir]
    dir_array.forEach(element => {
        if (!fs.existsSync(element)) {
            fs.mkdirSync(element);
        }
    });
    version.forEach(element => {
        let _version_path = path.join(plugins_dir, element)
        if (!fs.existsSync(_version_path)) {
            fs.mkdirSync(_version_path);
        }
    });

    // 写 .mod 
    let mod_file_path = path.join(module_dir, projectName + ".mod")
    if (!fs.existsSync(mod_file_path)) {
        let template_mod = path.join(template_path, "template.mod")
        if (!fs.existsSync(template_mod)) {
            vscode.window.showErrorMessage(`Path not exist : ${template_mod}`)
            return;
        }
        fs.readFile(template_mod, function (err, data) {
            let template_txt = data.toString()
            let mod_txt = ""
            version.forEach(element => {
                let to_write = template_txt.replaceAll("<Version>", element)
                to_write = to_write.replaceAll("<ModuleName>", projectName)
                mod_txt += to_write
                mod_txt += "\r\n"
            });
            fs.writeFileSync(path.join(module_dir, projectName + ".mod"), mod_txt)
        })
    }

    // 写 启动 .bat
    let template_bat = path.join(template_path, "template.bat")
    if (!fs.existsSync(template_bat)) {
        vscode.window.showErrorMessage(`Path not exist : ${template_bat}`)
        return;
    }
    const maya_config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("maya");
    let installRootDir_path: string = maya_config.get<string>("InstallRootDir", "");
    console.log(installRootDir_path)
    // installRootDir_path = "C:\\Program Files\\Autodesk"
    if (!fs.existsSync(installRootDir_path)) {
        vscode.window.showErrorMessage(`install Root Dir Path not exist : ${installRootDir_path}`)
        return;
    }
    fs.readFile(template_bat, function (err, data) {
        let template_txt = data.toString()
        template_txt = template_txt.replaceAll("<MayaInstallRootDir>", installRootDir_path)
        version.forEach(element => {
            let bat_file_path = path.join(root_dir, `Maya${element}.bat`)
            if (!fs.existsSync(bat_file_path)) {
                let to_write = template_txt.replaceAll("<Version>", element)
                fs.writeFileSync(path.join(root_dir, `Maya${element}.bat`), to_write)
            }
        });
    })
    // 写 userSetup.py
    let userSetup_file_path = path.join(scripts_dir, "userSetup.py")
    let template_userSetup = path.join(template_path, "userSetup.py")
    if (!fs.existsSync(userSetup_file_path) && fs.existsSync(template_userSetup)) {
        fs.readFile(template_userSetup, function (err, data) {
            let template_txt = data.toString()
            let to_write = template_txt.replaceAll("<ModuleName>", projectName)
            fs.writeFileSync(userSetup_file_path, to_write)
        })
    }
    vscode.window.showInformationMessage("Initialization Maya development directory structure Success ! ")
}

export class MayaInitializeDevDir {
    // public projectName :string;
    constructor(extensionPath: string) {
        let local_projectName: string | undefined;
        let local_versions: string[] = [];
        vscode.window.showInputBox(
            {
                password: false, // 输入内容是否是密码
                ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
                placeHolder: 'Project Name', // 在输入框内的提示信息
                prompt: 'Not Input : Default used current workspace name', // 在输入框下方的提示信息
                // validateInput:function(text){return text;} // 对输入内容进行验证并返回
            }).then(function (msg) {
                // 处理异常
                if (!msg) {
                    if (vscode.workspace.name) {
                        msg = vscode.workspace.name
                    }
                    else {
                        vscode.window.showErrorMessage("Please input project name.");
                        return;
                    }
                }
                local_projectName = msg.replaceAll(" (Workspace)", "")
                // 获取安装的 Maya 版本
                const maya_config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("maya");
                const installRootDirs: string = maya_config.get<string>("InstallRootDir", "");
                let files: string[] = fs.readdirSync(installRootDirs);
                let selectMaya: string[] = [];
                files.forEach(element => {
                    if (element.startsWith("Maya2")) {
                        let maya_exe = path.join(installRootDirs, element, "bin", "maya.exe")
                        if (fs.existsSync(maya_exe)) {
                            selectMaya.push(element)
                        }
                    }
                });
                vscode.window.showQuickPick(
                    selectMaya,
                    {
                        canPickMany: true,
                        ignoreFocusOut: true,
                        matchOnDescription: true,
                        matchOnDetail: true,
                        title: "",
                        placeHolder: 'Maya Version'
                    })
                    .then(function (msg) {
                        if (msg && msg.length > 0) {
                            msg.forEach(element => {
                                local_versions.push(element.replaceAll("Maya", ""))
                            });
                        }
                        else {
                            vscode.window.showErrorMessage("Please choose at least one version.")
                            return;
                        }
                        // 开始初始化 文件夹结构
                        initDevDir(local_projectName, local_versions, extensionPath)
                    })
            });
    }
};