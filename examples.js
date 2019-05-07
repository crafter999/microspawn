const microspawn = require("./main");

// example #1
async function example1() {
   try {
      let test = new microspawn();
      test.stderr = false;
      let args = "-screenshot test.jpg ipinfo.io";
      await test.run("C:\\Program Files\\Mozilla Firefox\\firefox.exe", args)
   } catch (e) {
      console.error(e);
      process.exit(1);
   }
}

async function example2() {
   // enable running commands inside a shell
   let test = new microspawn({shell: true, detached: true});
   await test.log("powershell.exe", "dir");
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


function example4() {
   // run command and start listening for data
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
}
