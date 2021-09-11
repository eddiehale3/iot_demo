const {readFileSync} = require('fs');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
// const iot = require('@google-cloud/iot');

const projectId = 'experiment-231217';
const deviceId = `demo-iot-device`;
const registryId = `demo-iot-registry`;
const region = `us-central1`;
const algorithm = `RS256`;
const privateKeyFile = `certs/rsa_private.pem`;
const serverCertFile = `certs/roots.pem`;
const mqttBridgeHostname = `mqtt.googleapis.com`;
const mqttBridgePort = 8883;
const messageType = `events`;

const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${deviceId}`;
console.log(`MQTT client id: ${mqttClientId}`);

const createJwt = (projectId, privateKeyFile, algorithm) => {
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    aud: projectId,
  };

  const privateKey = readFileSync(privateKeyFile);
  return jwt.sign(token, privateKey, {algorithm: algorithm});
}

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

//const iatTime = parseInt(Date.now() / 1000);
const client = mqtt.connect(connectionArgs);

// Subscribe to config topic to receive config updates
client.subscribe(`/devices/${deviceId}/config`, {qos: 1});

// Subscribe to commands topic and all subfolders
client.subscribe(`/devices/${deviceId}/commands/#`, {qos: 0});

// MQTT topic to publish data
const mqttTopic = `/devices/${deviceId}/${messageType}`;

client.on('connect', success => {
  if (!success) {
    console.log(`Client not connected`);
  } else {
    console.log('connected!');
    setInterval(() => {
      const payload = JSON.stringify({
        'helloThere': 'generalKenobi'
      })
      console.log('Publishing message: ', payload);
      client.publish(mqttTopic, payload, {qos: 1}, err => {
        if (err) {
          console.log(`Error sending message: ${err}`);
        }
      });
    }, 1000);
  }
}); 

client.on('close', () => {
  console.log('close');
});

client.on('error', error => {
  console.log('error: ', error);
});

client.on('message', (topic, message) => {
  let messageStr = 'Message received: ';
  if (topic === `/devices/${deviceId}/config`) {
    messageStr = 'Config message received: ';
  } else if (topic.startsWith(`/devices/${deviceId}/commands`)) {
    messageStr = 'Command message received: ';
  }

  messageStr += Buffer.from(message, 'base64').toString('ascii');
  console.log(messageStr);
});
