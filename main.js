const spawn = require("child_process").spawn;

class Microspawn {
   static run(program, args = [], options = {}, stderr = false) {
      return new Promise((resProm, rejProm) => {
         // convert string args to array
         args = this._stringToArray(args);

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
   static async log(program, args, options) {
      let result = await this.run(program, args, options).catch(e => this._exit(e));
      console.log(result);
   }

   static async script(scriptContents) {
      return this.run("/bin/sh", ["-c", scriptContents]);
   }

   // read only stream
   static stream(program, args = [], options = {}, exitOrErrorOrClose = false, silent = false) {
      options.shell = true;

      // convert string args to array
      args = this._stringToArray(args);

      // run command
      let child = spawn(program, args, options);

      let chunkError = "";
      child.stderr.on("data", (e) => {
         chunkError += e;
      });
      
      child.on("error", (e) => {
         if (exitOrErrorOrClose){
            this._exit(e, silent)
         } else {
            if (!silent){
               console.error(e);
            }
         }
      });
      child.on("close", (/* optional_code */) => {
         if (chunkError !== "") {
            if (exitOrErrorOrClose){
               this._exit(chunkError,silent)
            } else {
               if (!silent){
                  console.error(chunkError);
               }
            }
         }
      });

      return child.stdout;
   }

   static _stringToArray(args) {
      if (typeof args === "string") {
         // support escaping
         if (args.includes('"') || args.includes("'")) {
            args = this._escapeArgs(args);
         } else {
            args = args.split(" ");
         }
      }

      // trim empty args
      args = args.filter(e => e);

      return args;
   }

   static _escapeArgs(args) {
      let result = [];
      let escaped = args.match(/("(.*?)")|('(.*?)')/g);
      let quotesHack = args.replace(/("(.*?)")|('(.*?)')/g, "_$quotes$_");

      if (!escaped) {
         return args;
      }

      for (let q of quotesHack.split(" ")) {
         for (let m = 0; m <= escaped.length; m++) {
            if (q.includes("_$quotes$_") && escaped[m] !== "") {
               q = q.replace("_$quotes$_",escaped[m]);
               escaped[m] = ""; // *remove* it from queue
            }
         }
         result.push(q);
      }

      return result;
   }

   static _exit(e,silent=true) {
      if (!silent){
         console.error(e);
      }
      process.exit(1);
   }
}

module.exports = Microspawn;
