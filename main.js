const {exec} = require("child_process")


const commandRun = `afterfx -r "D:\\Projects\\code\\other\\nodejs\\AWFX_module\\index.jsx"`

exec(commandRun, (err, stdOut, stdErr) => {
    if (err) console.log(err)
    else {
        console.log(stdOut)
        console.log(stdErr)
    }
})