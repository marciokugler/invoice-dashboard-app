import { registerOTel } from '@vercel/otel'
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_NAMESPACE, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-node';
//import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
//const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import opentelemetry from '@opentelemetry/api';
import {
  
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';



//diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

//ENV NEXT_RUNTIME always returns nodejs
//To turn on vercel set NEXT_RUNTIME=nodejs the registerOtel function will be called
//To turn on opentelemetry instrumentation, set NEXT_RUNTIME=nodejs and instrumentation.node file will be imported, refer there for instrumentation code


export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs2') {
    console.log('Registering OTel for Node.js')
    await import('./instrumentation.node.ts')
  }
  
  if (process.env.NEXT_RUNTIME === 'nodejs3') {
    console.log('Registering OTel for Vercel')
    await registerOTel({
      serviceName: 'next-app',
      attributes: {
        [SEMRESATTRS_SERVICE_NAMESPACE]: 'development',
        
      },
      
    })
  }
}

