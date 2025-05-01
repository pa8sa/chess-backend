import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import * as Elasticsearch from 'winston-elasticsearch';

const esTransportOpts = {
  level: 'info',
  clientOpts: {
    node: 'http://localhost:9200',
    auth: {
      username: 'elastic',
      password: 'changeme',
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
  indexPrefix: 'winston',
};

const esTransport = new Elasticsearch.ElasticsearchTransport(esTransportOpts);

export const winstonLogger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
    }),
    esTransport,
  ],
});
