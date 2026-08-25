#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { NetworkDbStack } from '../lib/network-db-stack';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

const networkDb = new NetworkDbStack(app, 'Checkout-NetworkDb', { env });

new BackendStack(app, 'Checkout-Backend', {
  env,
  vpc: networkDb.vpc,
  database: networkDb.database,
  databaseSecurityGroup: networkDb.databaseSecurityGroup,
});

new FrontendStack(app, 'Checkout-Frontend', { env });
