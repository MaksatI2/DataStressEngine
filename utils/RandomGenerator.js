export class RandomGenerator {
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
        return `${this.string(4)}-${this.string(4)}-${this.string(4)}`;
    }

    static ipAddress() {
        return `${this.int(10, 252)}.${this.int(1, 255)}.${this.int(1, 255)}.${this.int(1, 255)}`;
    }

    static boolean() {
        return Math.random() > 0.5;
    }
}