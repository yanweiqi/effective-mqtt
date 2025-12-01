import mqtt from 'mqtt';

let client = null;

export function initMqtt({ host, port, protocol = 'ws', clientId, username, password, onMessage, onConnect, onError }) {
  if (client) return client;
  const url = `${protocol}://${host}:${port}`;
  client = mqtt.connect(url, {
    clientId: clientId || `web_${Math.random().toString(16).slice(2)}`,
    username,
    password,
    protocolVersion: 5,
    clean: true,
    keepalive: 60,
    properties: {
      sessionExpiryInterval: 0,
      receiveMaximum: 50,
      maximumPacketSize: 1048576,
      topicAliasMaximum: 10,
      requestResponseInformation: true,
      requestProblemInformation: true,
    },
  });

  client.on('connect', () => {
    onConnect && onConnect();
  });

  client.on('error', (err) => {
    onError && onError(err);
  });

  client.on('message', (topic, payload, packet) => {
    onMessage && onMessage({
      topic,
      payload: payload.toString(),
      qos: packet.qos,
      retain: packet.retain,
      dup: packet.dup,
      properties: packet.properties || {},
    });
  });

  return client;
}

export function subscribe(topicFilters, options = {}) {
  if (!client) throw new Error('MQTT client not initialized');
  // topicFilters can be string or array
  client.subscribe(topicFilters, {
    qos: options.qos ?? 0,
    nl: options.noLocal ? true : undefined,
    rap: options.retainAsPublished ? true : undefined,
    rh: options.retainHandling, // 0,1,2
  });
}

export function unsubscribe(topicFilters) {
  if (!client) return;
  client.unsubscribe(topicFilters);
}

export function publish(topic, message, options = {}) {
  if (!client) throw new Error('MQTT client not initialized');
  client.publish(topic, message, {
    qos: options.qos ?? 0,
    retain: options.retain ?? false,
    properties: {
      responseTopic: options.responseTopic,
      correlationData: options.correlationData,
      userProperties: options.userProperties,
      messageExpiryInterval: options.messageExpiryInterval,
      contentType: options.contentType,
      payloadFormatIndicator: options.payloadFormatIndicator, // 0 or 1
      topicAlias: options.topicAlias,
    },
  });
}

export function disconnect() {
  if (client) {
    client.end(true);
    client = null;
  }
}
