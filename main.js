const spawn = require("child_process").spawn;

class Microspawn {
   static run(program, args = [], options = {}, stderr = true) {
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
   static stream(program, args = [], options = {}) {
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
         this._exit(e)
      });
      child.on("close", (/* optional_code */) => {
         if (chunkError !== "") {
            this._exit(chunkError);
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
      let quotesHack = args.replace(/("(.*?)")|('(.*?)')/g, "_$quotes$_").split(" ");

      if (!escaped) {
         return args;
      }

      if (escaped.length > 1) {
         this._exit(new Error("Error while escaping string quotes. " +
            "Please wrap with double quotes and use single quotes inside. Or anything opposite from this\n\n" +
            "Example: \"-e \\\"console.log('hello world');\\\"\""))
      }

      for (let q of quotesHack) {
         for (let m = 0; m <= escaped.length; m++) {
            if (q === "_$quotes$_" && escaped[m] !== "") {
               q = escaped[m];
               escaped[m] = ""; // *remove* it from queue
            }
         }
         result.push(q);
      }

      return result;
   }

   static _exit(e) {
      console.error(e);
      process.exit(1);
   }
}

module.exports = Microspawn;
