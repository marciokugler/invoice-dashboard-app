import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { Resource } from '@opentelemetry/resources'
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_NAMESPACE, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
import { DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { diag } from '@opentelemetry/api';

const exporter = new OTLPTraceExporter({});

const resource = Resource.default().merge(
  new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'next-app',
    [SEMRESATTRS_SERVICE_VERSION]: '0.1.0',
    [SEMRESATTRS_SERVICE_NAMESPACE]: 'development',
  }),
);



diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
const sdk = new NodeSDK({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: 'next-app',
    [SEMRESATTRS_SERVICE_NAMESPACE]: 'development',
  }),
  spanProcessor: new BatchSpanProcessor(exporter),
  
  instrumentations: [getNodeAutoInstrumentations(
    {"@opentelemetry/instrumentation-fs":{'enabled':false},
    "@opentelemetry/instrumentation-pg":{'enabled':true}},
    
  )],

})

sdk.start()