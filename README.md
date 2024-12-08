# Autodesk Maya Dev Toolkit

---
## **Mel syntax highlighting tips and autocomplete**
### completion setting : download Maya devkit from [Maya developer center](https://www.autodesk.com/developer-network/platform-technologies/maya)
> ![mel_completion_setting](https://github.com/wlee445/maya-dev-toolkit/raw/main/data/mel_completion_setting.png)

---
### code completion and definition preview
> ![01_module](https://github.com/wlee445/maya-dev-toolkit/raw/main/data/mel_auto_completion.gif)


## **Maya Python extend lib path**
### Find Maya Python site-packages in the Maya installation directory
> ![01_module](https://github.com/wlee445/maya-dev-toolkit/raw/main/data/python_extend_lib_path_setting.png)


## **Send the current file to run in Maya with one click**
### Frist set Maya port in the VSCode setting, and copy template code to Maya Script Editor
> * Maya Port Setting 
> ![01_module](https://github.com/wlee445/maya-dev-toolkit/raw/main/data/maya_port_setting.png)

> * Right click `Send To Maya`
> ![01_module](https://github.com/wlee445/maya-dev-toolkit/raw/main/data/send_to_maya.png)

> * Key short `Ctrl + Alt + F5`
> ![01_module](https://github.com/wlee445/maya-dev-toolkit/raw/main/data/send_to_maya.gif)


## **Python breakpoint debugging for attach Maya processes**
> * Key short `Ctrl + Alt + p`
> ![01_module](https://github.com/wlee445/maya-dev-toolkit/raw/main/data/maya_debug.gif)

## **Initializes the Maya development directory structure**
Command : `Maya Initialize Development Directory Structure`
```
input ${project} and ${version}

root-dir
├-module
│ └─${project}.mod
├-sources
| ├-scripts
│ │ └-userSetup.py
│ ├-shelves
│ └-plug-ins
│   └-${version}
└-maya${version}.bat
```

## Extensions Dependencies
* [Python](https://marketplace.visualstudio.com/items?itemName=ms-python.python) - Linting, Debugging (multi-threaded, remote), Intellisense, code formatting, refactoring, unit tests, snippets, Data Science (with Jupyter), PySpark and more.  
* [Python Debuger](https://marketplace.visualstudio.com/items?itemName=ms-python.debugpy) - A Visual Studio Code extension that supports Python debugging with debugpy. Python Debugger provides a seamless debugging experience by allowing you to set breakpoints, step through code, inspect variables, and perform other essential debugging tasks. The debugpy extension offers debugging support for various types of Python applications including scripts, web applications, remote processes, and multi-threaded processes.
