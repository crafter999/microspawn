const spawn = require("child_process").spawn;

function run(program, args = [], options = {}, stderr = false) {
   return new Promise((resProm, rejProm) => {
      // convert string args to array
      args = stringToArray(args);

      // run command
      let child = spawn(program, args, options);

      let chunk = "";
      let chunkError = "";

      // start listening
      child.stdout.on("data", (data) => {
         chunk += data;
      });
      child.stderr.on("data", (data) => {
         // treat stderr like stdout for special occasions
         if (!stderr)
            chunk += data;
         else
            chunkError += data;
      });
      child.on("error", (e) => {
         rejProm(e);
      });
      child.on("close", (/* optional_code */) => {
         // check for errors
         if (chunkError === "") {
            resProm(chunk.toString());
         } else {
            rejProm(chunkError.toString());
         }
      });
   });
}

// execute & log out the result
async function log(program, args, options) {
   let result = await run(program, args, options).catch(e => exit(e));
   console.log(result);
}

async function script(scriptContents) {
   return run("/bin/sh", ["-c", scriptContents]);
}

// read only stream
function stream(program, args = [], options = {}, exitOrErrorOrClose = false, silent = false) {
   options.shell = true;

   // convert string args to array
   args = stringToArray(args);

   // run command
   let child = spawn(program, args, options);

   let chunkError = "";
   child.stderr.on("data", (e) => {
      chunkError += e;
   });

   child.on("error", (e) => {
      if (exitOrErrorOrClose) {
         exit(e, silent)
      } else {
         if (!silent) {
            console.error(e);
         }
      }
   });
   child.on("close", (/* optional_code */) => {
      if (chunkError !== "") {
         if (exitOrErrorOrClose) {
            exit(chunkError, silent)
         } else {
            if (!silent) {
               console.error(chunkError);
            }
         }
      }
   });

   return child.stdout;
}

function stringToArray(args) {
   if (typeof args === "string") {
      // support escaping
      if (args.includes('"') || args.includes("'")) {
         args = escapeArgs(args);
      } else {
         args = args.split(" ");
      }
   }

   // trim empty args
   args = args.filter(e => e);

   return args;
}

function escapeArgs(args) {
   let result = [];
   let escaped = args.match(/("(.*?)")|('(.*?)')/g);
   let quotesHack = args.replace(/("(.*?)")|('(.*?)')/g, "_$quotes$_");

   if (!escaped) {
      return args;
   }

   for (let q of quotesHack.split(" ")) {
      for (let m = 0; m <= escaped.length; m++) {
         if (q.includes("_$quotes$_") && escaped[m] !== "") {
            q = q.replace("_$quotes$_", escaped[m]);
            escaped[m] = ""; // *remove* it from queue
         }
      }
      result.push(q);
   }

   return result;
}

function exit(e, silent = true) {
   if (!silent) {
      console.error(e);
   }
   process.exit(1);
}

module.exports.run = run
module.exports.log = log
module.exports.script = script
module.exports.stream = stream
module.exports.escapeArgs = escapeArgs
module.exports.stringToArray = stringToArray