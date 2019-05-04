// Copyright (C) 2018  N. Drakos

const spawn = require("child_process").spawn;

class microspawn {
   constructor(options = {}) {
      this._options = options;
      this.stderr = true;
   }

   run(program, args = []) {
      return new Promise((resProm, rejProm) => {
         // convert string args to array
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

         // run command
         let child = spawn(program, args, this._options);

         let chunk = "";
         let chunkError = "";

         // start listening
         child.stdout.on("data", (data) => {
            chunk += data;
         });
         child.stderr.on("data", (data) => {
            // treat stderr like stdout for special occasions
            if (!this.stderr)
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
   async log(program, args) {
      let result = await this.run(program, args).catch(e => {
         console.error(e);
         process.exit(1);
      });
      console.log(result);
   }

   async script(scriptContents) {
      return this.run("/bin/sh", ["-c", scriptContents]);
   }

   _escapeArgs(args) {
      let result = [];
      let escaped = args.match(/("|')(.*?)("|')/g);
      let quotesHack = args.replace(/("|')(.*?)("|')/g, " quotes ").split(" ");

      for (let q of quotesHack) {
         for (let m = 0; m <= escaped.length; m++) {
            if (q === "quotes" && escaped[m]!=="") {
               q = escaped[m];
               escaped[m] = ""; // *remove* it from queue
            }
         }
         result.push(q);
      }

      return result;
   }
}

module.exports = microspawn;
