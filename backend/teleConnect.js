import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import net from 'net';
import os from 'os';

// Array to store logs
const apiLogs = [];

// Track concurrent requests
let concurrentRequests = 0;

// Function to send logs to Logstash
function sendLog(log) {
    const client = new net.Socket();
    client.connect(5000, 'localhost', () => {
        client.write(JSON.stringify(log) + '\n');
        client.end();
        console.log(`Log sent to Logstash:`, log);
    });
    client.on('error', (err) => console.error('Logstash connection error:', err));
}

// Custom Span Processor to Capture API & MongoDB Operations
class CapturingSpanProcessor extends SimpleSpanProcessor {
    onStart(span) {
        concurrentRequests++;
        span.setAttribute('concurrent.requests', concurrentRequests);
    }

    onEnd(span) {                

        concurrentRequests--;

        const attributes = span.attributes || {};
        
        // Calculate CPU and memory utilization
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryUtilization = ((totalMem - freeMem) / totalMem * 100).toFixed(2);

        const cpus = os.cpus();
        const cpuUtilization = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            const idle = cpu.times.idle;
            return acc + ((total - idle) / total * 100);
        }, 0) / cpus.length;

        // Handle API Requests
        if (attributes['http.method']) {
            const responseTime = span._duration[1]/1000000;
            const networkLatency = Math.round(responseTime * 0.1);

            const logEntry = {
                type: 'API',
                endpoint: attributes['http.route'] || attributes['http.url'],
                timestamp: new Date().toISOString(),
                responseTimeMs: responseTime,
                requestPayloadSize: attributes['http.request.content_length'] || 0,
                requestPayload: attributes['http.request.body'] || null, // Added request payload
                requestIP: attributes['http.client_ip'] || attributes['net.peer.ip'] || 'unknown', // Added request IP
                queryParams: attributes['http.request.query'] || null, // Added query parameters
                concurrentRequests: attributes['concurrent.requests'] || 0,
                networkLatencyMs: networkLatency,
                cpuUtilization: cpuUtilization.toFixed(2) + '%',
                memoryUtilization: memoryUtilization + '%',
                method: attributes['http.method'],
                statusCode: attributes['http.status_code']
            };

            apiLogs.push(logEntry);
            console.log(`Captured API Log: ${JSON.stringify(logEntry)}`);
            
            sendLog(logEntry);
        }

        // Handle MongoDB Queries
        if (attributes['db.system'] === 'mongodb') {
            const dbLogEntry = {
                type: 'DB',
                timestamp: new Date().toISOString(),
                dbSystem: 'mongodb',
                dbName: attributes['db.name'],
                dbCollection: attributes['db.mongodb.collection'],
                dbOperation: attributes['db.operation'],
                dbStatement: attributes['db.statement'],
                responseTimeMs: attributes['db.duration_ms'] || span.duration / 1000000, // Convert ns to ms
                host: attributes['net.peer.name'],
                port: attributes['net.peer.port'],
                cpuUtilization: cpuUtilization.toFixed(2) + '%',
                memoryUtilization: memoryUtilization + '%',
            };

            console.log(`Captured MongoDB Operation: ${JSON.stringify(dbLogEntry)}`);
            sendLog(dbLogEntry);
        }
    }
}

// Create OpenTelemetry SDK with API & MongoDB Instrumentation
const sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
    spanProcessor: new CapturingSpanProcessor(new ConsoleSpanExporter()),
    instrumentations: [
        getNodeAutoInstrumentations(),
        new MongoDBInstrumentation(), // MongoDB Query Logging
    ],
});

// Start the SDK
sdk.start();

// Add shutdown hooks to stop the SDK when the process exits
process.on('exit', () => {
    sdk.shutdown();
});

process.on('uncaughtException', (err) => {
    console.error('Error shutting down SDK:', err);
    sdk.shutdown();
});

process.on('SIGINT', () => {
    sdk.shutdown();
});

process.on('SIGTERM', () => {
    sdk.shutdown();
});

export { apiLogs };