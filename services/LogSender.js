import http from 'k6/http';
import { check } from 'k6';
import { TOKENS, WEBHOOK_URL } from '../config/Constants.js';
import { RandomGenerator } from '../utils/RandomGenerator.js';
import { LogEntry } from '../models/LogEntry.js';
import { TOTAL_LOGS } from '../config/Constants.js';

let globalCounter = 0;

export class LogSender {
    constructor(errorRate) {
        this.errorRate = errorRate;
    }

    send() {
        if (globalCounter >= TOTAL_LOGS) {
            return false;
        }
        
        globalCounter++;
        const currentLog = globalCounter;
        
        if (currentLog > TOTAL_LOGS) {
            return false;
        }
        
        const token = RandomGenerator.choice(TOKENS);
        const logEntry = LogEntry.generate();
        
        const response = http.post(
            WEBHOOK_URL,
            JSON.stringify(logEntry),
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                timeout: '30s',
            }
        );
        
        const success = check(response, {
            'status is 200-202': (r) => r.status >= 200 && r.status <= 202,
        });
        
        if (!success) {
            this.errorRate.add(1);
        }
        
        return success;
    }

    static getCounter() {
        return globalCounter;
    }

    static resetCounter() {
        globalCounter = 0;
    }
}