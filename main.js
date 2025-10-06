import { TOTAL_LOGS, LOGS_PER_SECOND, TOKENS } from './config/Constants.js';
import { PerformanceMetrics } from './metrics/PerformanceMetrics.js';
import { LogSender } from './services/LogSender.js';

const performanceMetrics = new PerformanceMetrics();
const errorRate = performanceMetrics.getErrorRate();
const logSender = new LogSender(errorRate);

export const options = {
    scenarios: {
        constant_rate: {
            executor: 'constant-arrival-rate',
            rate: LOGS_PER_SECOND,
            timeUnit: '1s',
            duration: `${Math.ceil(TOTAL_LOGS / LOGS_PER_SECOND)}s`,
            preAllocatedVUs: Math.min(LOGS_PER_SECOND * 2, 50),
            maxVUs: Math.min(LOGS_PER_SECOND * 3, 100),
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        errors: ['rate<0.1'],
    },
};

let testStartTime = null;
let testEndTime = null;

function formatDateTime(date) {
    return date.toLocaleString('ru-RU', {
        timeZone: 'Asia/Bishkek',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export function setup() {
    testStartTime = Date.now();
    console.log(`Тест начат: ${formatDateTime(new Date(testStartTime))}`);
    return { startTime: testStartTime };
}

export default function() {
    logSender.send();
    testEndTime = Date.now();
}

export function teardown(data) {
    if (!testEndTime) {
        testEndTime = Date.now();
    }
    console.log(`Тест завершен: ${formatDateTime(new Date(testEndTime))}`);
}

export function handleSummary(data) {
    const duration = data.state?.testRunDurationMs ? data.state.testRunDurationMs / 1000 : 
                     (testEndTime && testStartTime ? (testEndTime - testStartTime) / 1000 : 0);
    
    const totalRequests = data.metrics.http_reqs?.values?.count || 0;
    const failedRequests = data.metrics.http_req_failed?.values?.passes || 0;
    const successRequests = totalRequests - failedRequests;
    const actualRate = duration > 0 ? totalRequests / duration : 0;
    const successRate = totalRequests > 0 ? (successRequests / totalRequests * 100) : 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ИТОГОВАЯ СТАТИСТИКА');
    console.log('='.repeat(60));
    console.log(`⏱️  Время выполнения:    ${duration.toFixed(2)} секунд`);
    console.log(`📤 Всего отправлено:    ${totalRequests}`);
    console.log(`✅ Успешно:             ${successRequests}`);
    console.log(`❌ Ошибок:              ${failedRequests}`);
    console.log(`🎯 Целевая скорость:    ${LOGS_PER_SECOND} логов/сек`);
    console.log(`📈 Фактическая скорость: ${actualRate.toFixed(2)} логов/сек`);
    console.log(`🎯 Успешность:          ${successRate.toFixed(1)}%`);
    console.log(`🔗 Интеграций:          ${TOKENS.length}`);
    console.log('='.repeat(60));
    
    const speedDiff = Math.abs(actualRate - LOGS_PER_SECOND);
    const speedDiffPercent = (speedDiff / LOGS_PER_SECOND) * 100;
    
    if (speedDiffPercent < 10) {
        console.log('✅ Скорость близка к целевой!');
    } else {
        console.log(`⚠️  Фактическая скорость отличается от целевой на ${speedDiff.toFixed(1)} лог/сек (${speedDiffPercent.toFixed(1)}%)`);
    }
    
    if (failedRequests === 0) {
        console.log('🎉 Все логи отправлены успешно!');
    } else {
        console.log(`⚠️  ${failedRequests} логов не отправлено`);
    }
    console.log('='.repeat(60) + '\n');
    
    return {
        'stdout': '',
        'summary.json': JSON.stringify(data, null, 2),
    };
}