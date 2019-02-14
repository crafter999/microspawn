// Copyright (C) 2018  N. Drakos

const microspawn = require("./main");

// example #1
async function example1() {
   try {
      let appEngine = new microspawn();
      appEngine.stderr = false;
      let args = "-screenshot test.jpg ipinfo.io";
      await appEngine.run("C:\\Program Files\\Mozilla Firefox\\firefox.exe", args)
   } catch (e) {
      console.error(e);
      process.exit(1);
   }
}

async function example2() {
   // enable running commands inside a shell
   let appEngine = new microspawn({shell: true, detached: true});
   await appEngine.run("powershell.exe", "dir").catch(e => {
      console.log(e);
      process.exit(1);
   });
}

async function example3() {
   // run inline script with arguments (shell arguments don't work)
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
}
