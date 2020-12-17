import winston from 'winston';

export const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
        winston.format.metadata()
    ),
    transports: new winston.transports.Console({
        format: winston.format.colorize({})
    })
});
