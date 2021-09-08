const credentials = '../experiment-231217-eba99ceda7e5.json'
const deviceId = `demo-iot-device`;
const gatewayId = `mygateway`;
const registryId = `demo-iot-registry`;
const region = `us-central1`;
const algorithm = `RS256`;
const privateKeyFile = `./rsa_private.pem`;
const serverCertFile = `./roots.pem`;
const mqttBridgeHostname = `mqtt.googleapis.com`;
const mqttBridgePort = 8883;
const numMessages = 5;
const tokenExpMins = 60;
const {readFileSync} = require('fs');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
const iot = require('@google-cloud/iot');

const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${gatewayId}`;
console.log(`MQTT client id: ${mqttClientId}`);

const connectionArgs = {
  host: mqttBridgeHostname,
  port: mqttBridgePort,
  clientId: mqttClientId,
  username: 'unused',
  password: createJwt(projectId, privateKeyFile, algorithm),
  protocol: 'mqtts',
  qos: 1,
  secureProtocol: 'TLSv1_2_method',
  ca: [readFileSync(serverCertFile)],
};

const iatTime = parseInt(Date.now() / 1000);
const client = mqtt.connect(connectionArgs);

client.on('connect', success => {
  if (!success) {

  } else if (!publishChainInProgress) {
    console.log('connected');
    
  }
})

// const createJwt = (projectId, privateKeyFile, algorithm) => {
//   const token = {
//     iat: parseInt(Date.now() / 1000),
//     exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
//     aud: projectId,
//   };

//   const privateKey = readFileSync(privateKeyFile);
//   return jwt.sign(token, privateKey, {algorithm: algorithm});
// }