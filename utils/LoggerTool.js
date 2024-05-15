/**
 * 日志工具
 * Author: Golu
 * Create: 2024-05-09
 * Update: 2024-05-09
 */
const { createLogger, format, transports, addColors } = require('winston');
require('winston-daily-rotate-file');

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(info => {
    const message = typeof info.message === 'object' ? JSON.stringify(info.message) : info.message;
    return `${info.timestamp} [${info.level}]: ${message}`;
});

// 定义日志级别的颜色映射
const myCustomLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
    },
    colors: {
        info: 'cyan'
    }
};

addColors(myCustomLevels.colors);

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // 动态日志级别
    transports: [
        new transports.Console({
            format: combine(
                colorize({ all: true }),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        }),
        new transports.DailyRotateFile({
            filename: `${process.cwd()}/logs/%DATE%.log`,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: combine(
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                logFormat
            )
        })
    ]
});

// 监听 logger 错误事件
logger.on('error', (error) => {
    console.error('Logger error:', error); // 错误处理
});

module.exports = logger;
