const iot = require('@google-cloud/iot')

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */

const client = new iot.v1.DeviceManagerClient()
exports.handler = async (req, res) => {
    await getDevices();
    res.send(200);
}

async function getDevices() {
    const projectId = await client.getProjectId();
    const parent = client.locationPath(projectId, 'us-central1');
    const [resources] = await client.listDeviceRegistries({parent});

    console.log(`${resources.length} resource(s) found.`);
    
    for (const resource of resources) {
        console.log(resource);
    }
}
