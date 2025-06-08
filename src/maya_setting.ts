import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { error } from 'console';

function initDevDir(projectName: string | undefined, version: string[] | undefined, extensionPath: string) {
    // 合法性验证
    if (!vscode.workspace.workspaceFolders) {
        vscode.window.showErrorMessage("Do not found workspaceFolders ");
        return;
    }
    if (!(projectName && version && version.length > 0 && extensionPath)) {
        return;
    }

    if (projectName === undefined) {
        vscode.window.showErrorMessage(`Project name is undefined`);
        return;
    }
    if (!(version && version.length > 0)) {
        vscode.window.showErrorMessage(`Version error :${version}`);
        return;
    }
    if (extensionPath === undefined) {
        vscode.window.showErrorMessage(`ExtensionPath error :${extensionPath}`);
        return;
    }

    // 处理路径
    let module_dir_name = "modules";
    let root_dir = vscode.workspace.workspaceFolders[0].uri.fsPath;
    let module_dir = path.join(root_dir, module_dir_name);
    let sources_dir = path.join(root_dir, "sources");
    let project_path = path.join(sources_dir, projectName);
    let scripts_dir = path.join(project_path, "scripts");
    let shelves_dir = path.join(project_path, "shelves");
    let plugins_dir = path.join(project_path, "plug-ins");
    let template_path = path.join(extensionPath, "resources", "template");

    const maya_config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("maya");
    let installRootDir_path: string = maya_config.get<string>("InstallRootDir", "");
    console.log(installRootDir_path);

    //  创建目录结构
    let dir_array = [module_dir, sources_dir, project_path, scripts_dir, shelves_dir, plugins_dir];
    dir_array.forEach(element => {
        if (!fs.existsSync(element)) {
            fs.mkdirSync(element);
        }
    });
    version.forEach(element => {
        let _version_path = path.join(plugins_dir, element);
        if (!fs.existsSync(_version_path)) {
            fs.mkdirSync(_version_path);
        }
    });

    // 写 .mod 

    let mod_template_txt = `
+ MAYAVERSION:<Version> PLATFORM:win64 <ModuleName> 0.0.1 ../sources/<ModuleName>
plugins: ./<Version>
scripts: ./`;

    let mod_txt = "";
    version.forEach(element => {
        let to_write = mod_template_txt;
        to_write = to_write.replaceAll("<Version>", element);
        to_write = to_write.replaceAll("<ModuleName>", projectName);
        mod_txt += to_write;
        mod_txt += "\r\n";
    });
    fs.writeFileSync(path.join(module_dir, projectName + ".mod"), mod_txt);

    // 写 启动 .bat
    let bat_template_txt = `
SET MAYA_MODULE_PATH=%MAYA_MODULE_PATH%;%~dp0<ModuleDirName>
START /d "<MayaInstallRootDir>\\Maya<Version>\\bin" maya.exe`;

    bat_template_txt = bat_template_txt.replaceAll("<ModuleDirName>", module_dir_name);  
    bat_template_txt = bat_template_txt.replaceAll("<MayaInstallRootDir>", installRootDir_path);
    version.forEach(element => {
        let bat_file_path = path.join(root_dir, `Maya${element}.bat`);
        if (!fs.existsSync(bat_file_path)) {
            let to_write = bat_template_txt.replaceAll("<Version>", element);
            fs.writeFileSync(path.join(root_dir, `Maya${element}.bat`), to_write);
        }
    });

    // 写 userSetup.py
    let userSetup_template_txt = `
import maya.utils
maya.utils.executeDeferred("print('<ModuleName> userSetup.py')")`;
    let userSetup_file_path = path.join(scripts_dir, "userSetup.py");
    if (!fs.existsSync(userSetup_file_path)) {
        let to_write = userSetup_template_txt;
        to_write = to_write.replaceAll("<ModuleName>", projectName);
        fs.writeFileSync(userSetup_file_path, to_write);
    }
    vscode.window.showInformationMessage("Initialization Maya development directory structure Success ! ");
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
                        msg = vscode.workspace.name;
                    }
                    else {
                        vscode.window.showErrorMessage("Please input project name.");
                        return;
                    }
                }
                // 检查 project name 是否已经存在
                if (vscode.workspace.workspaceFolders) {
                    let workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
                    let projectPath = path.join(workspacePath, "sources", msg);
                    if (fs.existsSync(projectPath)) {
                        vscode.window.showErrorMessage(`Project "${msg}" already exists in sources folder.`);
                        return;
                    }
                }
                local_projectName = msg.replaceAll(" (Workspace)", "");
                // 获取安装的 Maya 版本
                const maya_config: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration("maya");
                const installRootDirs: string = maya_config.get<string>("InstallRootDir", "");
                let files: string[] = fs.readdirSync(installRootDirs);
                let selectMaya: string[] = [];
                files.forEach(element => {
                    if (element.startsWith("Maya2")) {
                        let maya_exe = path.join(installRootDirs, element, "bin", "maya.exe");
                        if (fs.existsSync(maya_exe)) {
                            selectMaya.push(element);
                        }
                    }
                });
                // 如果没有找到 Maya 版本
                if (selectMaya.length === 0) {
                    vscode.window.showErrorMessage("Do not found Maya version in InstallRootDir, please check your configuration.");
                    return;
                }
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
                                local_versions.push(element.replaceAll("Maya", ""));
                            });
                        }
                        else {
                            vscode.window.showErrorMessage("Please choose at least one version.");
                            return;
                        }
                        // 开始初始化 文件夹结构
                        initDevDir(local_projectName, local_versions, extensionPath);
                    });
            });
    }
};