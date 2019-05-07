const ms = require("../../main");

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

it('should return the an array with 3 elements', () => {
   let args = "";
   let test = new ms({})._escapeArgs(args);
   expect(test)
});

afterEach(() => {
   jest.clearAllMocks();
});

