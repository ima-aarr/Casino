export class Logger {
    static info(message) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
    static error(message, error) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
    }
}
