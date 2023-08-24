import { platform } from 'os';

export function adjustCommandForPlatform(command: string, args: string[] = []): { cmd: string, args: string[] } {
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