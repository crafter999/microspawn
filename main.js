// Copyright (C) 2018  N. Drakos

const spawn = require("child_process").spawn;

class microspawn {
   constructor(options = {}) {
      this._options = options;
      this.stderr = true;
   }

   run(program, arrayOfArgs = []) {
      // convert string args to array
      if (typeof arrayOfArgs === "string"){
         arrayOfArgs = arrayOfArgs.split(" ");
      }
      return new Promise((resProm, rejProm) => {
         // type check
         if (typeof program!=="string" || !Array.isArray(arrayOfArgs)){
            rejProm(new TypeError("Invalid arguments. run() " +
               "should be string and an array"));
         }

         // run command
         let child = spawn(program, arrayOfArgs, this._options);

         let chunk = "";
         let chunkError = "";

         // start listening for events
         child.stdout.on("data", (data)=> {
            chunk += data;
         });
         child.stderr.on("data", (data)=> {
            // treat stderr like stdout for special occasions
            if (!this.stderr)
               chunk+= data;
            else
               chunkError += data;
         });
         child.on("error", (e)=> {
            rejProm(e);
         });
         child.on("close", (/* optional_code */)=> {
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
}

module.exports = microspawn;