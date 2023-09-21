import express from 'express';
import path from 'path';
import axios, { AxiosResponse } from 'axios';
import { callCommand, listBucket, parseStatus } from './utils';
import vms from './data/vm-instances.json';

const port = 3000;

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/run/:action/:instanceid', async (req, res) => {
    
    const action = req.params.action;
    const instanceID = parseInt(req.params.instanceid);
    
    const validActions = ['start', 'stop', 'describe'];
    if (!validActions.includes(action)) {
        res.status(401).send(`action must be one of ${validActions.join(', ')}`);
        return;
    }
    
    const instance = vms.find((vm: any) => vm.instanceId == instanceID);    
    if (!instance) {
        res.status(401).send('instance not found');
        return;
    }

    const instanceName =    instance.instanceName;
    const zone =            instance.instanceZone;

    const data = await callCommand(action, instanceName, zone);

    res.json(data);

});

app.get('/bucket/:bucketpath', async (req, res) => {
    
    const _bucketPath = req.params.bucketpath;

    const bucketPath = `gs://${decodeURI(_bucketPath)}`;
    
    const data = await listBucket(bucketPath);

    res.json(data);
});

app.get('/available/:instanceid', async (req, res) => {

    const instanceID = parseInt(req.params.instanceid);

    const instance = vms.find((vm: any) => vm.instanceId == instanceID);    
    if (!instance) {
        res.status(401).send('instance not found');
        return;
    }
    
    const endpoint = `http://${instance.instanceAddr}/inquiries/available`;
    
    try {
        const response: AxiosResponse = await axios.get(endpoint, { timeout: 5000 });
        res.json({
            available: response.data.available,
            messgae: 'successful availablity check'
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('server error fetching availablity');
    }
});

app.get('/status/:instanceid', async (req, res) => {

    const instanceID = parseInt(req.params.instanceid);

    const instance = vms.find((vm: any) => vm.instanceId == instanceID);    
    if (!instance) {
        res.status(401).send('instance not found');
        return;
    }
    const instanceName =    instance.instanceName;
    const zone =            instance.instanceZone;

    const data = await callCommand('describe', instanceName, zone);

    const {success, status } = parseStatus(data)

    res.json({success, status});
});

app.get('/', (req, res) => {
    res.render('index', { instances: vms });
});

app.listen(port, () => {
    return console.log(`server is listening on ${port}`);
});