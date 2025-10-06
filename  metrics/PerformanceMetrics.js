import { Rate } from 'k6/metrics';
import { TOKENS} from '../config/Constants.js';

export class PerformanceMetrics {
    constructor() {
        this.errorRate = new Rate('errors');
    }

    getErrorRate() {
        return this.errorRate;
    }

    static createSummary(data, startTime, totalLogs, logsPerSecond) {
        const endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        
        const totalRequests = data.metrics.http_reqs?.values?.count || 0;
        const failedRequests = data.metrics.http_req_failed?.values?.passes || 0;
        const successRequests = totalRequests - failedRequests;
        const actualRate = duration > 0 ? totalRequests / duration : 0;
        const successRate = totalRequests > 0 ? (successRequests / totalRequests * 100) : 0;
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 ИТОГОВАЯ СТАТИСТИКА');
        console.log('='.repeat(60));
        console.log(`🕐 Время старта:        ${startTime.toISOString()}`);
        console.log(`🕐 Время окончания:     ${endTime.toISOString()}`);
        console.log(`⏱️  Время выполнения:    ${duration.toFixed(2)} секунд`);
        console.log(`📤 Всего отправлено:    ${totalRequests}`);
        console.log(`✅ Успешно:             ${successRequests}`);
        console.log(`❌ Ошибок:              ${failedRequests}`);
        console.log(`🎯 Целевая скорость:    ${logsPerSecond} логов/сек`);
        console.log(`📈 Фактическая скорость: ${actualRate.toFixed(2)} логов/сек`);
        console.log(`🎯 Успешность:          ${successRate.toFixed(1)}%`);
        console.log(`🔗 Интеграций:          ${TOKENS.length}`);
        console.log('='.repeat(60));
        
        if (Math.abs(actualRate - logsPerSecond) / logsPerSecond < 0.1) {
            console.log('✅ Скорость близка к целевой!');
        } else {
            console.log(`⚠️  Фактическая скорость отличается от целевой на ${Math.abs(actualRate - logsPerSecond).toFixed(1)} лог/сек`);
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
}