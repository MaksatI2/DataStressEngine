export const WEBHOOK_URL = "https://web.paprikabitdev.com/webhook/v1/events";

export const TOKENS = [
    "PBWK.V1.b_-V3MLpFElS3DCt.5UOnhVbeOS3ETCM_T-IO5Q",
    "PBWK.V1.G2dMV0f8qV1icKxs.D4lELIING_DNcbTO2gUkZg",
    "PBWK.V1.s7wMtqarI7r_sq-n.M-XgyYDKJBFIGBX4z4S8Cg",
    "PBWK.V1.uFUkz-eGEEHXvsLR.6XvmD8eZhJl3WU_lzlKsjg",
    "PBWK.V1.IOwSLXIB-Rpku3Nm.VG9o8jPDp48pyIHYyyPKWw",
];

export const TOTAL_LOGS = 100;
export const LOGS_PER_SECOND = 20;

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
        description: "If the interface is under administrative maintenance, we return a 0. Otherwise, we return the value of OperState. Status code summary below:\n\nStatus codes:\n-1=Alerting Disabled, as Interface doesn't match alert enabling properties,\n0=Administratively down,\n1=Up - Ready to pass packets,\n2=Down,\n3=Testing - in a test mode,\n4=Unknown - status cannot be determined,\n5=Dormant - interface is not actually in a condition to pass packets (i.e., it is not 'up') but is in a \"pending\" state, waiting for some external event.,\n6=Not Present - some component is missing,\n7=Lower Layer Down - down due to state of a lower-layer interface(s)."
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
};