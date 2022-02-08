const {readFileSync} = require('fs');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');

const projectId = 'PROJECT_ID';
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

var config = {
  "increment": true
}

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

// MQTT topic to publish state
const mqttState = `/devices/${deviceId}/state`;

var data = 50;
client.on('connect', success => {
  if (!success) {
    console.log(`Client not connected`);
  } else {
    console.log('connected!');

    setInterval(() => {
      if(Object.keys(config).length != 0) {
        if(config.increment) {
          data++;
        } else {
          data--;
        }
  
        const payload = JSON.stringify({ data });
        console.log('Publishing message: ', payload);
        client.publish(mqttTopic, payload, {qos: 1}, err => {
          if (err) {
            console.log(`Error sending message: ${err}`);
          }
        });
      }
    }, 5000);
  }
}); 

client.on('message', (topic, message) => {
  if (topic === `/devices/${deviceId}/config`) {
    const newConfig = Buffer.from(message, 'base64').toString('ascii');
    if(Object.keys(newConfig) != 0) {
      console.log('Config message received: ', newConfig);

      // Set new configuration
      config = JSON.parse(newConfig); 
      // console.log(`Updated config: ${JSON.stringify(config)}`);
      
      // publish state
      console.log(`Publishing state: ${JSON.stringify(config)}`);
      client.publish(mqttState, JSON.stringify(config), {qos:1}, err => {
        if (err) {
          console.log(`Error sending state: ${err}`);
        }
      });
    }
  }
  // } else if (topic.startsWith(`/devices/${deviceId}/commands`)) {
  //   const command = JSON.parse(Buffer.from(message, 'base64').toString('ascii'));
  //   console.log(`Command message received: ${JSON.stringify(command)}`);
  //   if(command.increment) config.increment = command.increment;
  // }
});

client.on('close', () => {
  console.log('close');
});

client.on('error', error => {
  console.log('error: ', error);
});
