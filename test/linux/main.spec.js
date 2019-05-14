const ms = require("../../main");
const assert = require("assert");

// hack block for the event loop (useful for the events)
let hackSleep = new Promise((res) => {
   setTimeout(() => {
      res(true);
   }, 1500);
});

it("should run and return 'Linux'", async () => {
   let command = await ms.run("/bin/uname");
   command = command.trim();
   expect(command).toBe("Linux")
});

it('should reject promise', async () => {
   await expect(ms.run("/zero/null/XxXxXx")).rejects.toThrow()
});

it('should reject the falsy process', async () => {
   let test = ms.run("/usr/bin/nodejs", "-e \"process.stderr.write('error')\"", {shell: true});
   await expect(test).rejects.toBe("error");
});

it('should print out \'hello\'', async () => {
   jest.spyOn(console, "log");
   await ms.log("/bin/echo", "-n hello");
   expect(console.log.mock.calls[0][0]).toBe("hello");
});

it('should run script and return 10', async () => {
   const script = "myvar=\"$((5 + 5))\"\n"
      + "echo -n \"$myvar\"";
   const test = await ms.script(script);
   expect(test).toBe("10");
});

it('should run command in stream mode and return hello', async () => {
   let startListening = ms.stream("/usr/bin/nodejs", "-e \"console.log('hello')\"");
   startListening.on("data", (data) => {
      expect(data.toString().trim()).toBe("hello");
   });
   await hackSleep;
});

it('should return an array with 6 specific elements', () => {
   let args = "--log 'meow meow' --doSomething --myvar=\"Hello World\" --anotherArg \"This works too\"";
   let test = ms._escapeArgs(args);
   assert.deepStrictEqual(test.length,6);
   assert.deepStrictEqual(test[0], '--log');
   assert.deepStrictEqual(test[1], "'meow meow'");
   assert.deepStrictEqual(test[2], '--doSomething');
   assert.deepStrictEqual(test[3], '--myvar="Hello World"');
   assert.deepStrictEqual(test[4], '--anotherArg');
   assert.deepStrictEqual(test[5], '"This works too"');
});

it('should return an array with 2 specific elements', () => {
   let args = "'arg1 here' \"arg2 here\"";
   let test = ms._escapeArgs(args);
   assert.deepStrictEqual(test.length,2);
   assert.deepStrictEqual(test[0],"'arg1 here'");
   assert.deepStrictEqual(test[1], '"arg2 here"');
});

afterEach(() => {
   jest.clearAllMocks();
});

