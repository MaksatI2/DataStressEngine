import { Rate } from 'k6/metrics';

export class PerformanceMetrics {
    constructor() {
        this.errorRate = new Rate('errors');
    }

    getErrorRate() {
        return this.errorRate;
    }

}