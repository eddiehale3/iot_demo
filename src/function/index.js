const iot = require('@google-cloud/iot')

const client = new iot.v1.DeviceManagerClient()
const deviceId = process.env.DEVICEID ?? `demo-iot-device`;
const registryId = process.env.REGISTRYID ?? `demo-iot-registry`; 
const region = process.env.REGION ?? 'us-central1';

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.handler = async (req, res) => {
    try {
        const projectId = await client.getProjectId();
        const devicePath = client.devicePath(projectId, region, registryId, deviceId);
        const message = req.body;

        console.log(`Message received: ${message}`)
        await sendDeviceConfig(devicePath, message);

        res.sendStatus(200);
    } catch (e) {
        console.error(`An error occurred: ${e}`);
        res.sendStatus(500);
    }
}

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
// exports.handler = async (event, context) => {
//     try {
//         const projectId = await client.getProjectId();
//         const devicePath = client.devicePath(projectId, region, registryId, deviceId);
//         const message = JSON.parse(Buffer.from(event.data, 'base64').toString('ascii'));

//         console.log(`Message received: ${message.data}`)
//         if(message.data > 10) {
//             console.log('Setting increment to false')
//             await sendDeviceConfig(devicePath, {increment: false})
//         } else if(message.data < 1) {
//             console.log('Setting increment to true')
//             await sendDeviceConfig(devicePath, {increment: true})
//         }
//     } catch(e) {
//         console.error(`An error occurred: ${e}`);
//     }
// };

/**
 * Sends configuration to device
 * 
 * @param {!String} devicePath Generated device path with format projects/{projectId}/locations/{region}/registries/{registryId}/devices/{deviceId}
 * @param {!Object} config Configuration sent by the client
 */
async function sendDeviceConfig(devicePath, config) {
    try {
        const binaryData = Buffer.from(JSON.stringify(config)).toString('base64')
        const request = {
            name: devicePath,
            versionToUpdate: 0,
            binaryData: binaryData
        }

        const [response] = await client.modifyCloudToDeviceConfig(request);
        console.log(`Success sending device configuration: ${response}`);
    } catch(e) {
        console.log(`An error occurred sending device configuration`);
        console.error(e);
    }
}
