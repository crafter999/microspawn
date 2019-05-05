[![Node Version](https://img.shields.io/badge/node.js%20-%3E%3D9.0.0-brightgreen.svg)](https://nodejs.org/en/download/current/)
[![License](https://img.shields.io/badge/license-GPL-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)

Microspawn is a basic tiny piece of code with **0 dependencies** which contains some methods that can be
really useful & handy when it comes to running commands using node.js. I'm not intend to
expand it cause it's not like a library or something.


## Getting Started
#### new microspawn(optional_options:object)
Initialize a new microspawn object. Options can be found at the following link: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options

#### + run(command:string, args:string | args:array) : promise *(can be static)*
Returns a **promise** which contains the result back from the stream

#### + stream(command:string, args:string | args:array) : Event *(can be static)*
Returns 'data' '**Event** that will be triggered when the process output some data.   
*It will be terminated if the process output error.*

#### + log(command:string, args:string | args:array) : void 
Simple void method which executes & logs a command

#### + stderr: bool => default:true
For special occasions only. For example some commands may return an error but can be treated like std out.

## Examples
Example #1 : Running a simple command with args
```javascript
try {
   let test = new microspawn();
   test.stderr = false;
   let args = "-screenshot test.jpg ipinfo.io";
   test.run("C:\\Program Files\\Mozilla Firefox\\firefox.exe", args);
} catch (e) {
   console.error(e);
   process.exit(1);
}
```
Example #2: Running a command inside a shell

```javascript
let test = new microspawn({shell: true, detached: true});
test.log("powershell.exe", "dir");
```

Example #3: Run inline script (shell arguments don't work)
```javascript
(async()=> {  
   let test = new microspawn();
   let arg = "hello";
   let script = `test="${arg}"
   if [ "$test" = "hello" ]; then
     echo "world"
   fi`;
   let result = await test.script(script).catch(e => {
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
let streamFromStd = microspawn.stream(nodejsPath,
   `-e ${nodeInception2}`, {shell: true});

streamFromStd.on("data", (data) => {
   // do something with the data
   console.log(parseInt(data)*100);
});
```
