import express from 'express';
const { spawn } = require('child_process');
import { adjustCommandForPlatform } from './utils';
import vms from './data/vm-instances.json';

const port = 3000;

const app = express();

app.get('/run/:action/:instanceid', (req, res) => {
    
    const action = req.params.action;
    const instanceID = parseInt(req.params.instanceid);
    
    const validActions = ['start', 'stop', 'describe'];
    if (!validActions.includes(action)) {
        res.status(401).send('action must be start or stop or describe');
        return;
    }
    
    const instance = vms.find((vm: any) => vm.instanceId == instanceID);    
    if (!instance) {
        res.status(401).send('instance not found');
        return;
    }

    const instanceName =    instance.instanceName;
    const zone =            instance.instanceZone;

    let cmd =     ['gcloud'];
    cmd = [...cmd, 'compute']
    cmd = [...cmd, 'instances']
    cmd = [...cmd,  action]
    cmd = [...cmd,  instanceName]
    
    if (action == 'describe') {
        cmd = [...cmd, '--format=value(status)']
    }
    
    cmd = [...cmd, '--zone', zone]

    const scriptCmd = cmd[0];
    const scriptArgs = cmd.slice(1);
    
    const { cmd: spawnCmd, args: spawnArgs } = adjustCommandForPlatform(scriptCmd, scriptArgs);
    
    const script = spawn(spawnCmd, spawnArgs);
    
    let stdout = '';
    let stderr = '';
    
    script.stdout.on('data', (data: Buffer) => {
        const _stdout = data.toString()
        stdout += _stdout + '\n';
        console.log(`stdout: ${_stdout}`);
    });

    script.stderr.on('data', (data: Buffer) => {
        const _stderr = data.toString()
        stderr += _stderr + '\n';
        console.error(`stderr: ${_stderr}`);
    });

    script.on('close', (code: number) => {
        const data = {
            code,
            cmd,
            stdout,
            stderr
        }
        res.json(data)
    });
});

app.get('/', (req, res) => {
    res.send('ok');
});

app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});