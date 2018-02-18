[![Node Version](https://img.shields.io/badge/node.js%20-%3E%3D9.0.0-brightgreen.svg)](https://nodejs.org/en/download/current/)
[![License](https://img.shields.io/badge/license-GPL-blue.svg)](https://www.gnu.org/licenses/gpl-3.0.en.html)

Microspawn is a basic tiny piece of code which contains some methods that can be
really useful & handy when it comes to running commands using node.js.
It's still in beta so any kind of contribution would be fine. I'm not intend to
expand it cause it's not like a library or something.


## Getting Started
#### new microspawn(optional_options:object)
Initialize a new microspawn object. Options can be found at the following link: https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options

#### + run(command:string, args:string || args:array)
Returns a promise which contains the result back from the stream

#### + log(command:string, args:string || args:array)
Simple void method which executes & logs a command

#### + stderr: bool => default:true
For special occasions only. For example some commands may return an error but can be treated like std out.

## Examples
Example #1 : Running a simple command with args
```
async function example1() {
   try {
      let appEngine = new microspawn();
      appEngine.stderr=false;
      let args = "-screenshot test.jpg ipinfo.io";
      await appEngine.run("C:\\Program Files\\Mozilla Firefox\\firefox.exe",args)
   } catch (e) {
      console.error(e);
      process.exit(1);
   }
}
```
Example #2: Running a command inside a shell

```
async function example2() {
   // enable running commands inside a shell
   let appEngine = new microspawn({shell: true, detached: true});
   await appEngine.run("powershell.exe", "dir").catch(e => {
      console.log(e);
      process.exit(1);
   });
```