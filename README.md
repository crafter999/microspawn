[![Node Version](https://img.shields.io/badge/node.js%20-%3E%3D9.0.0-brightgreen.svg)](https://nodejs.org/en/download/current/)
[![License](https://img.shields.io/badge/license-GPL-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)

## Install
````
npm install microspawn
````

## Usage
+ **run**(program: string, args: string[] | string, options?: SpawnOptions, stderr?: boolean): Promise<string>  
_Returns the `stdout` **Event** that will be triggered when the process output some data.   
WARNING: It will be terminated if the process output error._

+ **log**(program: string, args: string[] | string, options?: 
[SpawnOptions](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)): void  
_Return a **promise** which contains the result back from the stream_

+ **script**(scriptContents: string): Promise<string>  
_Run a **Linux** script using `/bin/sh`  
WARNING: argument should be the script contents, not the file location of a script._
+ **stream**(program: string, args: string[], options?: SpawnOptions): Readable  
_Return an event named `data`. Can be useful for listening for some data inside a shell._

## Examples
Example #1 : Running a simple command with args
```javascript
try {
   let args = "-screenshot test.jpg ipinfo.io";
   await microspawn.run("C:\\Program Files\\Mozilla Firefox\\firefox.exe", args)
} catch (e) {
   console.error(e);
   process.exit(1);
}
```
Example #2: Running a command inside a shell

```javascript
await microspawn.log("powershell.exe", "dir",{shell: true, detached: true});
```

Example #3: Run inline script (shell arguments don't work)
```javascript
(async()=> {  
   let arg = "hello";
   let script = `test="${arg}"
   if [ "$test" = "hello" ]; then
      echo "world"
   fi`;
   let result = await ms.script(script).catch(e => {
      console.error(e);
      process.exit(1);
   });

   console.log(result);
})();
```

Example #4: Run command and start listening for data
```javascript
let nodejsPath = process.platform === "linux" ? "/usr/bin/node" : "C:\\node.exe";
const nodeInception = "\"var i=0;setInterval(()=>{process.stdout.write(i.toString());i++},1000);\"";
const nodeInception2 = "\"for(let x=0;x<=999999;x++){console.log(x);}\"";
const nodeInception3 = "\"setTimeout(()=>{console.log('hello'+'world')},1000)\"";
let streamFromStd = microspawn.stream(nodejsPath,
   `-e ${nodeInception2}`, {shell: true});

streamFromStd.on("data", (data) => {
   // do something with the data
   console.log(parseInt(data)*100);
});
```
