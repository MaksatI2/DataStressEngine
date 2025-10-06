const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

const K6_TESTS_DIR = path.join(__dirname, 'k6-tests');
const RESULTS_DIR = path.join(__dirname, 'results');

if (!fs.existsSync(K6_TESTS_DIR)) {
  fs.mkdirSync(K6_TESTS_DIR, { recursive: true });
}

if (!fs.existsSync(RESULTS_DIR)) {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

function generateK6Script(config) {
  const constantsContent = `export const WEBHOOK_URL = "${config.webhookUrl}";

export const TOKENS = ${JSON.stringify(config.selectedTokens, null, 4)};

export const TOTAL_LOGS = ${config.totalLogs};
export const LOGS_PER_SECOND = ${config.logsPerSecond};

export const SITES = ['USOAK', 'USDFW', 'USNYC', 'USSEA', 'CATOR'];
export const DEVICE_TYPES_SHORT = ['ACDMSWE', 'RTRCOR', 'SRVAPP', 'FWDMZ'];
export const MANUFACTURERS = ['Cisco', 'Meraki', 'Juniper', 'Dell', 'HPE'];
export const DEVICE_TYPES = ['Switch', 'Router', 'Server', 'Firewall', 'Load Balancer'];
export const SEVERITIES = ['info', 'warn', 'error', 'critical'];
export const STATUSES = ['clear', 'active', 'acknowledged', 'suppressed'];
export const ENVIRONMENTS = ['dev', 'staging', 'prod'];
export const NETWORK_TYPES = ['Corporate', 'DMZ', 'Guest', 'Management'];
export const SITE_NAMES = ['', 'Main Office', 'Branch Office', 'Data Center'];

export const INTERFACES = [
    'Network Interfaces-Port',
    'CPU Utilization',
    'Memory Usage',
    'Disk Space',
    'Temperature Sensors',
    'Power Supply Status'
];

export const DATAPOINTS = {
    'Network Interfaces-Port': {
        datapoint: 'Status',
        threshold: '> 1',
        description: "Interface status monitoring"
    },
    'CPU Utilization': {
        datapoint: 'CPUBusyPercent',
        threshold: '> 90',
        description: 'CPU utilization percentage across all cores'
    },
    'Memory Usage': {
        datapoint: 'MemoryUtilization',
        threshold: '> 85',
        description: 'Memory usage percentage'
    },
    'Disk Space': {
        datapoint: 'Status',
        threshold: '> 1',
        description: 'Disk space utilization monitoring'
    }
};`;

  const randomGeneratorContent = `export class RandomGenerator {
    static choice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    static int(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static string(length, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    static serialNumber() {
        return \`\${this.string(4)}-\${this.string(4)}-\${this.string(4)}\`;
    }

    static ipAddress() {
        return \`\${this.int(10, 252)}.\${this.int(1, 255)}.\${this.int(1, 255)}.\${this.int(1, 255)}\`;
    }

    static boolean() {
        return Math.random() > 0.5;
    }
}`;

  const logEntryContent = `import { 
    SITES, DEVICE_TYPES_SHORT, MANUFACTURERS, DEVICE_TYPES, 
    SEVERITIES, STATUSES, ENVIRONMENTS, NETWORK_TYPES, 
    SITE_NAMES, INTERFACES, DATAPOINTS 
} from './constants.js';
import { RandomGenerator } from './utils.js';

export class LogEntry {
    static generate() {
        const site = RandomGenerator.choice(SITES);
        const location = RandomGenerator.int(1, 999);
        const deviceTypeShort = RandomGenerator.choice(DEVICE_TYPES_SHORT);
        const number = RandomGenerator.int(1, 999);
        const host = \`\${site}\${location.toString().padStart(3, '0')}\${deviceTypeShort}\${number.toString().padStart(3, '0')}\`;
        
        const manufacturer = RandomGenerator.choice(MANUFACTURERS);
        const deviceType = RandomGenerator.choice(DEVICE_TYPES);
        const poe = RandomGenerator.boolean() ? 'FP' : '';
        const portSize = RandomGenerator.choice(['24', '48']);
        const model = \`\${manufacturer} \${deviceType} \${portSize}\${poe}\`;
        const deviceInfo = \`\${model} Cloud Managed \${poe ? 'PoE ' : ''}\${deviceType}\`;
        
        const interfaceType = RandomGenerator.choice(INTERFACES);
        const portId = interfaceType.includes('Port') ? RandomGenerator.int(1, 48) : RandomGenerator.int(1, 10);
        const datasourceName = interfaceType.includes('Port') 
            ? \`\${interfaceType} \${portId} [ID:\${portId}]\`
            : \`\${interfaceType} [ID:\${portId}]\`;
        
        const interfaceKey = interfaceType.split('-')[0];
        const datapointInfo = DATAPOINTS[interfaceKey] || DATAPOINTS['Network Interfaces-Port'];
        
        const ip = RandomGenerator.ipAddress();
        const serial = RandomGenerator.serialNumber();
        const alertId = \`DS\${RandomGenerator.int(10000000, 99999999)}\`;
        const deviceId = RandomGenerator.int(100, 9999);
        const lmdId = \`LMD\${RandomGenerator.int(1000000, 9999999)}\`;
        
        return {
            severity: RandomGenerator.choice(SEVERITIES),
            host: host,
            status: RandomGenerator.choice(STATUSES),
            site_name: RandomGenerator.choice(SITE_NAMES),
            env: RandomGenerator.choice(ENVIRONMENTS),
            tags: {
                device_url: \`https://acme.logicmonitor.com/santaba/uiv3/device/index.jsp#tree/-d-\${deviceId}\`,
                url: \`https://acme.logicmonitor.com/santaba/uiv4/alert#detail~id=\${lmdId}&type=alert\`,
                datapoint: datapointInfo.datapoint,
                datapoint_description: datapointInfo.description,
                datasource: datasourceName,
                datasource_description: \`Collects \${interfaceType.toLowerCase()} performance and operational stats.\`,
                alert_id: alertId,
                threshold: datapointInfo.threshold,
                host_info: deviceInfo,
                host_ip: ip,
                host_manufacturer: manufacturer,
                host_model: deviceInfo,
                host_serial_number: serial,
                network_type: RandomGenerator.choice(NETWORK_TYPES)
            },
            title: \`\${host} has reported \${datasourceName} to be in alert due to \${datapointInfo.datapoint} threshold being breached.\`,
            manager: 'Logicmonitor',
            aiops_data: RandomGenerator.boolean(),
            cribl_pipe: [
                'logicmonitor',
                RandomGenerator.choice(['passthru', 'enrichment', 'filtering'])
            ]
        };
    }
}`;

  const mainScriptContent = `import http from 'k6/http';
import { check } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { TOTAL_LOGS, LOGS_PER_SECOND, WEBHOOK_URL, TOKENS } from './constants.js';
import { RandomGenerator } from './utils.js';
import { LogEntry } from './logentry.js';

const successCounter = new Counter('success_requests');
const failedCounter = new Counter('failed_requests');
const requestDuration = new Trend('request_duration');

let testStartTime;
let testEndTime;

export const options = {
    scenarios: {
        constant_rate: {
            executor: 'constant-arrival-rate',
            rate: LOGS_PER_SECOND,
            timeUnit: '1s',
            duration: \`\${Math.ceil(TOTAL_LOGS / LOGS_PER_SECOND)}s\`,
            preAllocatedVUs: Math.min(LOGS_PER_SECOND * 2, 50),
            maxVUs: Math.min(LOGS_PER_SECOND * 3, 100),
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        'failed_requests': ['count<100'],
    },
};

export function setup() {
    testStartTime = new Date().toISOString();
    console.log('TEST_START_TIME=' + testStartTime);
    return { startTime: testStartTime };
}

export default function(data) {
    const token = RandomGenerator.choice(TOKENS);
    const logEntry = LogEntry.generate();
    
    const startRequest = Date.now();
    const response = http.post(
        WEBHOOK_URL,
        JSON.stringify(logEntry),
        {
            headers: {
                'Authorization': \`Bearer \${token}\`,
                'Content-Type': 'application/json',
            },
            timeout: '30s',
        }
    );
    const duration = Date.now() - startRequest;
    
    requestDuration.add(duration);
    
    const success = check(response, {
        'status is 200-202': (r) => r.status >= 200 && r.status <= 202,
    });
    
    if (success) {
        successCounter.add(1);
    } else {
        failedCounter.add(1);
    }
}

export function teardown(data) {
    testEndTime = new Date().toISOString();
    console.log('TEST_END_TIME=' + testEndTime);
}

export function handleSummary(data) {
    const metrics = data.metrics;
    
    const httpReqs = (metrics.http_reqs && metrics.http_reqs.values && metrics.http_reqs.values.count) || 0;
    const successReqs = (metrics.success_requests && metrics.success_requests.values && metrics.success_requests.values.count) || 0;
    const failedReqs = (metrics.failed_requests && metrics.failed_requests.values && metrics.failed_requests.values.count) || 0;
    
    const iterDuration = (metrics.iteration_duration && metrics.iteration_duration.values && metrics.iteration_duration.values.avg) || 0;
    
    let totalDuration = 0;
    if (data.state && data.state.testRunDurationMs) {
        totalDuration = data.state.testRunDurationMs / 1000;
    } else if (metrics.vus && metrics.vus.values && metrics.vus.values.max) {
        totalDuration = Math.ceil(TOTAL_LOGS / LOGS_PER_SECOND);
    }
    
    const actualRate = totalDuration > 0 ? (httpReqs / totalDuration).toFixed(2) : '0';
    
    const successRate = httpReqs > 0 ? ((successReqs / httpReqs) * 100).toFixed(1) : '0';
    
    const avgDuration = (metrics.http_req_duration && metrics.http_req_duration.values && metrics.http_req_duration.values.avg) || 0;
    
    const p95Duration = (metrics.http_req_duration && metrics.http_req_duration.values && metrics.http_req_duration.values['p(95)']) || 0;
    const maxDuration = (metrics.http_req_duration && metrics.http_req_duration.values && metrics.http_req_duration.values.max) || 0;
    
    const results = {
        startTime: testStartTime || new Date().toISOString(),
        endTime: testEndTime || new Date().toISOString(),
        duration: totalDuration.toFixed(2),
        totalRequests: httpReqs,
        successRequests: successReqs,
        failedRequests: failedReqs,
        targetRate: LOGS_PER_SECOND,
        actualRate: actualRate,
        successRate: successRate,
        avgRequestDuration: avgDuration.toFixed(2),
        integrations: TOKENS.length,
        p95Duration: p95Duration.toFixed(2),
        maxDuration: maxDuration.toFixed(2),
    };
    
    console.log('===TEST_RESULTS_START===');
    console.log(JSON.stringify(results, null, 2));
    console.log('===TEST_RESULTS_END===');
    
    return {
        'stdout': JSON.stringify(results, null, 2)
    };
}`;

  fs.writeFileSync(path.join(K6_TESTS_DIR, 'constants.js'), constantsContent);
  fs.writeFileSync(path.join(K6_TESTS_DIR, 'utils.js'), randomGeneratorContent);
  fs.writeFileSync(path.join(K6_TESTS_DIR, 'logentry.js'), logEntryContent);
  fs.writeFileSync(path.join(K6_TESTS_DIR, 'test.js'), mainScriptContent);
}

app.post('/api/run-test', (req, res) => {
  const config = req.body;

  if (!config.webhookUrl || !config.selectedTokens || config.selectedTokens.length === 0) {
    return res.status(400).json({ error: 'Некорректная конфигурация' });
  }

  try {
    generateK6Script(config);

    const testScript = path.join(K6_TESTS_DIR, 'test.js');
    const command = `k6 run ${testScript}`;

    exec(command, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      console.log('=== K6 Output ===');
      console.log(stdout);
      console.log('=== K6 Stderr ===');
      console.log(stderr);

      const stdoutJsonMatch = stdout.match(/\{[\s\S]*?"startTime"[\s\S]*?"endTime"[\s\S]*?\}/);
      
      if (stdoutJsonMatch) {
        try {
          const results = JSON.parse(stdoutJsonMatch[0]);
          console.log('✅ Parsed results from stdout JSON:', results);
          return res.json({
            ...results,
            output: stdout
          });
        } catch (parseError) {
          console.error('❌ Parse error from stdout JSON:', parseError);
        }
      }

      const stderrLines = stderr.split('\n');
      let jsonStartIdx = -1;
      let jsonEndIdx = -1;
      
      for (let i = 0; i < stderrLines.length; i++) {
        if (stderrLines[i].includes('===TEST_RESULTS_START===')) {
          jsonStartIdx = i + 1;
        }
        if (stderrLines[i].includes('===TEST_RESULTS_END===')) {
          jsonEndIdx = i - 1;
          break;
        }
      }
      
      if (jsonStartIdx !== -1 && jsonEndIdx !== -1) {
        try {
          let jsonStr = '';
          for (let i = jsonStartIdx; i <= jsonEndIdx; i++) {
            const line = stderrLines[i];
            const msgMatch = line.match(/msg="(.*)"/);
            if (msgMatch) {
              jsonStr += msgMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
            }
          }
          
          console.log('📝 Extracted JSON string:', jsonStr);
          const results = JSON.parse(jsonStr);
          console.log('✅ Parsed results from stderr:', results);
          return res.json({
            ...results,
            output: stdout
          });
        } catch (parseError) {
          console.error('❌ Parse error from stderr:', parseError);
        }
      }

      const startTimeMatch = stdout.match(/TEST_START_TIME=(.+)/);
      const endTimeMatch = stdout.match(/TEST_END_TIME=(.+)/);
      
      const httpReqsMatch = stdout.match(/http_reqs[.\s]+(\d+)/);
      const httpReqDurationMatch = stdout.match(/http_req_duration[.\s]+avg=([0-9.]+)ms/);
      const httpReqFailedMatch = stdout.match(/http_req_failed[.\s]+([0-9.]+)%/);

      const totalRequests = httpReqsMatch ? parseInt(httpReqsMatch[1]) : 0;
      const avgDuration = httpReqDurationMatch ? parseFloat(httpReqDurationMatch[1]) : 0;
      const failedPercent = httpReqFailedMatch ? parseFloat(httpReqFailedMatch[1]) : 0;
      
      const failedRequests = Math.round(totalRequests * failedPercent / 100);
      const successRequests = totalRequests - failedRequests;
      const duration = Math.ceil(config.totalLogs / config.logsPerSecond);
      const actualRate = duration > 0 ? (totalRequests / duration).toFixed(2) : '0';
      const successRate = totalRequests > 0 ? ((successRequests / totalRequests) * 100).toFixed(1) : '0';

      return res.json({
        startTime: startTimeMatch ? startTimeMatch[1] : new Date().toISOString(),
        endTime: endTimeMatch ? endTimeMatch[1] : new Date().toISOString(),
        duration: duration.toFixed(2),
        totalRequests,
        successRequests,
        failedRequests,
        targetRate: config.logsPerSecond,
        actualRate,
        successRate,
        avgRequestDuration: avgDuration.toFixed(2),
        integrations: config.selectedTokens.length,
        output: stdout,
        warning: 'Результаты извлечены из текстового вывода'
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📁 K6 tests directory: ${K6_TESTS_DIR}`);
  console.log(`📊 Results directory: ${RESULTS_DIR}`);
});