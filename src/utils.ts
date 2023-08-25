import { platform } from 'os';
import { spawn } from 'child_process';

export async function callCommand(action: string, instanceName: string, zone: string):Promise<any> {
    
    return new Promise((resolve, reject) => {
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
            resolve(data)
        });
    });
}

export async function listBucket(bucketAddr: string):Promise<any> {
    
    return new Promise((resolve, reject) => {
        let cmd =     ['gsutil'];
        cmd = [...cmd, 'ls']
        cmd = [...cmd, '-lh']
        cmd = [...cmd, bucketAddr]
        
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
            resolve(data)
        });

    });

}

function adjustCommandForPlatform(command: string, args: string[] = []): { cmd: string, args: string[] } {
    if (platform() === 'win32') {
        // For Windows, use 'cmd' and '/c'
        return {
            cmd: 'cmd',
            args: ['/c', command, ...args]
        };
    } else {
        // For non-Windows platforms, return the command and args as they are
        return {
            cmd: command,
            args: args
        };
    }
}

export function parseStatus(data: any): { success: boolean, status: string } {
    const { code, stdout, stderr } = data;

    let success = false;
    let status = '';

    if (code == 0) {
        success = true;
        status = stdout.trim();
    } else {
        success = false;
        status = stderr.trim();
    }

    return { success, status };
}