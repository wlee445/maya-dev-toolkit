import * as fs from 'fs';
import * as path from "path";
import * as readline from "readline"
import * as vscode from 'vscode';

const TurndownService = require('turndown')


export class MayamelCompletionItemProvider implements vscode.CompletionItemProvider{
    public word_completions: Array<vscode.CompletionItem> = [];
    private completion_path:string = "";
    constructor(
        in_completion_path : string
    ){
        this.completion_path = in_completion_path;
        if (! fs.existsSync(this.completion_path)) {
            console.log(`路径不存在 ${this.completion_path}`)
            return;
        }

        // Dev kit / doc read mel command html
        const files = fs.readdirSync(`${this.completion_path}/Commands`);
        files.forEach((val, idx, files)=>{
            this.word_completions.push(new vscode.CompletionItem(val.split(".",1)[0], vscode.CompletionItemKind.Text));
        });
        // Dev kit / doc / internalCommandList.txt
        const rl = readline.createInterface({
            input : fs.createReadStream(`${this.completion_path}/internalCommandList.txt`)
        });
        rl.on("line",(line) => {
            if (! (line === undefined)) {
                this.word_completions.push(new vscode.CompletionItem(line, vscode.CompletionItemKind.Text));
            }; 
        });
    }
    public provideCompletionItems(
        document: vscode.TextDocument, 
        position: vscode.Position, 
        token: vscode.CancellationToken, 
        context: vscode.CompletionContext
    ):
     vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        // let word_completions: Array<vscode.CompletionItem> = [];
        let completions: Array<vscode.CompletionItem> = [];
        return [...this.word_completions, ...completions];
    };
};

export class MayamelHoverProvider implements vscode.HoverProvider{
    private completion_path:string = "";
    constructor(
        in_completion_path : string
    ){
        this.completion_path = in_completion_path;
        if (! fs.existsSync(this.completion_path)) {
            console.log(`路径不存在 ${this.completion_path}`)
            return;
        }
    }
    public provideHover(
        document: vscode.TextDocument, 
        position: vscode.Position, 
        token: vscode.CancellationToken
    ): 
    vscode.ProviderResult<vscode.Hover>
    {
        const word = document.getText(document.getWordRangeAtPosition(position));
        if (word === undefined) {
            return;
        };
        let word_path :string = `${this.completion_path}/Commands/${word}.html`;
        if (fs.existsSync(word_path)){
            let text = fs.readFileSync(word_path,"utf-8");
            const turndownService = new TurndownService();
            const markdown = turndownService.turndown(text);
            return new vscode.Hover(new vscode.MarkdownString(markdown));
        }
        else
        {
            return;
        }
    };
};
