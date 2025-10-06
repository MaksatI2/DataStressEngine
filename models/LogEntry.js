import { 
    SITES, DEVICE_TYPES_SHORT, MANUFACTURERS, DEVICE_TYPES, 
    SEVERITIES, STATUSES, ENVIRONMENTS, NETWORK_TYPES, 
    SITE_NAMES, INTERFACES, DATAPOINTS 
} from '../config/Constants.js';
import { RandomGenerator } from '../utils/RandomGenerator.js';

export class LogEntry {
    static generate() {
        const site = RandomGenerator.choice(SITES);
        const location = RandomGenerator.int(1, 999);
        const deviceTypeShort = RandomGenerator.choice(DEVICE_TYPES_SHORT);
        const number = RandomGenerator.int(1, 999);
        const host = `${site}${location.toString().padStart(3, '0')}${deviceTypeShort}${number.toString().padStart(3, '0')}`;
        
        const manufacturer = RandomGenerator.choice(MANUFACTURERS);
        const deviceType = RandomGenerator.choice(DEVICE_TYPES);
        const poe = RandomGenerator.boolean() ? 'FP' : '';
        const portSize = RandomGenerator.choice(['24', '48']);
        const model = `${manufacturer} ${deviceType} ${portSize}${poe}`;
        const deviceInfo = `${model} Cloud Managed ${poe ? 'PoE ' : ''}${deviceType}`;
        
        const interfaceType = RandomGenerator.choice(INTERFACES);
        const portId = interfaceType.includes('Port') ? RandomGenerator.int(1, 48) : RandomGenerator.int(1, 10);
        const datasourceName = interfaceType.includes('Port') 
            ? `${interfaceType} ${portId} [ID:${portId}]`
            : `${interfaceType} [ID:${portId}]`;
        
        const interfaceKey = interfaceType.split('-')[0];
        const datapointInfo = DATAPOINTS[interfaceKey] || DATAPOINTS['Network Interfaces-Port'];
        
        const ip = RandomGenerator.ipAddress();
        const serial = RandomGenerator.serialNumber();
        const alertId = `DS${RandomGenerator.int(10000000, 99999999)}`;
        const deviceId = RandomGenerator.int(100, 9999);
        const lmdId = `LMD${RandomGenerator.int(1000000, 9999999)}`;
        
        return {
            severity: RandomGenerator.choice(SEVERITIES),
            host: host,
            status: RandomGenerator.choice(STATUSES),
            site_name: RandomGenerator.choice(SITE_NAMES),
            env: RandomGenerator.choice(ENVIRONMENTS),
            tags: {
                device_url: `https://acme.logicmonitor.com/santaba/uiv3/device/index.jsp#tree/-d-${deviceId}`,
                url: `https://acme.logicmonitor.com/santaba/uiv4/alert#detail~id=${lmdId}&type=alert`,
                datapoint: datapointInfo.datapoint,
                datapoint_description: datapointInfo.description,
                datasource: datasourceName,
                datasource_description: `Collects ${interfaceType.toLowerCase()} performance and operational stats.`,
                alert_id: alertId,
                threshold: datapointInfo.threshold,
                host_info: deviceInfo,
                host_ip: ip,
                host_manufacturer: manufacturer,
                host_model: deviceInfo,
                host_serial_number: serial,
                network_type: RandomGenerator.choice(NETWORK_TYPES)
            },
            title: `${host} has reported ${datasourceName} to be in alert due to ${datapointInfo.datapoint} threshold being breached.`,
            manager: 'Logicmonitor',
            aiops_data: RandomGenerator.boolean(),
            cribl_pipe: [
                'logicmonitor',
                RandomGenerator.choice(['passthru', 'enrichment', 'filtering'])
            ]
        };
    }
}