import { RemovalPolicy, SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as apprunner from 'aws-cdk-lib/aws-apprunner';

export interface BackendStackProps extends StackProps {
  vpc: ec2.Vpc;
  database: rds.DatabaseInstance;
  databaseSecurityGroup: ec2.SecurityGroup;
}

/**
 * The API as an App Runner service pulling from a dedicated ECR repo, reaching
 * Postgres over a VPC connector. Wompi's private key / integrity secret are
 * placeholders here — fill in the real sandbox values in Secrets Manager
 * after deploying (see README), never in source control.
 */
export class BackendStack extends Stack {
  public readonly repository: ecr.Repository;
  public readonly service: apprunner.CfnService;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, 'BackendRepository', {
      repositoryName: 'checkout-backend',
      removalPolicy: RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    const wompiSecret = new secretsmanager.Secret(this, 'WompiSecret', {
      description: 'Wompi sandbox private key + integrity secret — overwrite the placeholder values after deploy',
      secretObjectValue: {
        privateKey: SecretValue.unsafePlainText('prv_stagtest_REPLACE_ME'),
        integritySecret: SecretValue.unsafePlainText('stagtest_integrity_REPLACE_ME'),
      },
    });

    const vpcConnector = new apprunner.CfnVpcConnector(this, 'VpcConnector', {
      subnets: props.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }).subnetIds,
      securityGroups: [props.databaseSecurityGroup.securityGroupId],
    });

    const accessRole = new iam.Role(this, 'AppRunnerEcrAccessRole', {
      assumedBy: new iam.ServicePrincipal('build.apprunner.amazonaws.com'),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSAppRunnerServicePolicyForECRAccess')],
    });

    const instanceRole = new iam.Role(this, 'AppRunnerInstanceRole', {
      assumedBy: new iam.ServicePrincipal('tasks.apprunner.amazonaws.com'),
    });
    props.database.secret?.grantRead(instanceRole);
    wompiSecret.grantRead(instanceRole);

    const dbSecretArn = props.database.secret!.secretArn;

    this.service = new apprunner.CfnService(this, 'BackendService', {
      serviceName: 'checkout-backend',
      sourceConfiguration: {
        authenticationConfiguration: { accessRoleArn: accessRole.roleArn },
        autoDeploymentsEnabled: true,
        imageRepository: {
          imageIdentifier: `${this.repository.repositoryUri}:latest`,
          imageRepositoryType: 'ECR',
          imageConfiguration: {
            port: '3000',
            runtimeEnvironmentVariables: [
              { name: 'PORT', value: '3000' },
              { name: 'DB_HOST', value: props.database.instanceEndpoint.hostname },
              { name: 'DB_PORT', value: '5432' },
              { name: 'DB_NAME', value: 'checkout' },
              { name: 'BASE_FEE_IN_CENTS', value: '500000' },
              { name: 'DELIVERY_FEE_IN_CENTS', value: '800000' },
              { name: 'CURRENCY', value: 'COP' },
              { name: 'WOMPI_API_URL', value: 'https://api-sandbox.co.uat.wompi.dev/v1' },
              // Update once the frontend/CloudFront domain is known (see README) so CORS isn't wide open.
              { name: 'CORS_ORIGIN', value: '*' },
            ],
            runtimeEnvironmentSecrets: [
              { name: 'DB_USERNAME', value: `${dbSecretArn}:username::` },
              { name: 'DB_PASSWORD', value: `${dbSecretArn}:password::` },
              { name: 'WOMPI_PRIVATE_KEY', value: `${wompiSecret.secretArn}:privateKey::` },
              { name: 'WOMPI_INTEGRITY_SECRET', value: `${wompiSecret.secretArn}:integritySecret::` },
            ],
          },
        },
      },
      instanceConfiguration: {
        cpu: '1024',
        memory: '2048',
        instanceRoleArn: instanceRole.roleArn,
      },
      networkConfiguration: {
        egressConfiguration: { egressType: 'VPC', vpcConnectorArn: vpcConnector.attrVpcConnectorArn },
      },
      healthCheckConfiguration: {
        protocol: 'HTTP',
        path: '/api/health',
        interval: 10,
        timeout: 5,
        healthyThreshold: 1,
        unhealthyThreshold: 5,
      },
    });
  }
}
