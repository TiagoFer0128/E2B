import {
  LambdaClient,
  CreateFunctionCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  CreateFunctionUrlConfigCommand,
  waitUntilFunctionUpdatedV2,
  AddPermissionCommand,
  GetFunctionCommand,
  GetFunctionUrlConfigCommand,
} from '@aws-sdk/client-lambda'
// import { APIGatewayClient } from '@aws-sdk/client-api-gateway'
import { EnvVars, Session } from '@devbookhq/sdk'

import { packageFunction } from './packaging'

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
}

if (!credentials.accessKeyId || !credentials.secretAccessKey) {
  throw new Error('AWS credentials not found')
}

const region = 'us-east-1'

// TODO: Devbook Acc env var for aws initialization
// TODO: lambda.destroy() on quit?
const lambda = new LambdaClient({
  region,
  credentials,
})

// TODO: gateway.destroy() on quit?
// const gateway = new APIGatewayClient({
//   region,
//   credentials,
// })

const deploymentParams = {
  Runtime: 'nodejs16.x',
  // TODO: Replace lambda role with valid role in Devbook Acc
  Role: 'arn:aws:iam::066766119186:role/service-role/test-1-role-lgud7u7z',
  Handler: 'index.handler',
  // TODO: Experiment with ARM vs x86_64
}

async function waitForUpdate(projectID: string) {
  await waitUntilFunctionUpdatedV2(
    {
      client: lambda,
      maxWaitTime: 30,
    },
    {
      FunctionName: projectID,
    }
  )
}

async function getIsFunctionDeployed(projectID: string) {
  try {
    await lambda.send(
      new GetFunctionCommand(
        { FunctionName: projectID }
      )
    )
    return true
  } catch (err: any) {
    if (err.name === 'ResourceNotFoundException') {
      return false
    }
    throw err
  }
}

async function getFunctionURL(projectID: string) {
  try {
    const func = await lambda.send(
      new GetFunctionUrlConfigCommand(
        { FunctionName: projectID }
      )
    )
    return func.FunctionUrl
  } catch (err: any) {
    if (err.name === 'ResourceNotFoundException') {
      return undefined
    }
    throw err
  }
}

export async function createDeploymentInSession(
  session: Session,
  projectID: string,
  envVars?: EnvVars
) {
  // Start packaging function in session
  const zipping = packageFunction(session)
  const gettingURL = getFunctionURL(projectID)
  const isFunctionDeployed = await getIsFunctionDeployed(projectID)

  // Deploy function
  if (!isFunctionDeployed) {
    const zip = await zipping
    await lambda
      .send(
        new CreateFunctionCommand({
          ...deploymentParams,
          FunctionName: projectID,
          Code: {
            ZipFile: zip,
          },
          Environment: {
            Variables: envVars,
          },
        })
      )
    await waitForUpdate(projectID)

    const urlResult = await lambda
      .send(
        new CreateFunctionUrlConfigCommand({
          FunctionName: projectID,
          AuthType: 'NONE',
          Cors: {},
        })
      )
    await waitForUpdate(projectID)

    await lambda
      .send(
        new AddPermissionCommand({
          Action: 'lambda:InvokeFunctionUrl',
          FunctionName: projectID,
          Principal: '*',
          StatementId: `${projectID}-url-permission`,
          FunctionUrlAuthType: 'NONE',
        })
      )
    await waitForUpdate(projectID)

    // TODO: Configure the Gateway to handle custom domain wildcards
    return urlResult.FunctionUrl
  }

  // Update function
  if (envVars) {
    await lambda.send(
      new UpdateFunctionConfigurationCommand({
        ...deploymentParams,
        FunctionName: projectID,
        Environment: {
          Variables: envVars,
        },
      })
    )
    await waitForUpdate(projectID)
  }

  const zip = await zipping

  await lambda.send(
    new UpdateFunctionCodeCommand({
      FunctionName: projectID,
      ZipFile: zip,
    })
  )
  await waitForUpdate(projectID)

  return await gettingURL
}
