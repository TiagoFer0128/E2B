import Link from 'next/link'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import useSWRMutation from 'swr/mutation'

import { projects } from '@prisma/client'
import Text from 'components/Text'
import { Route, Block } from 'state/store'
import { useLatestDeployment } from 'hooks/useLatestDeployment'
import { useStateStore } from 'state/StoreProvider'
import { html2markdown } from 'editor/schema'

import Agent from './Agent'
import Envs from './Envs'
import Context from './Context'

export interface Props {
  project: projects
  route?: Route
  activeMenuSection?: MenuSection
}

export enum MenuSection {
  Agent = 'Agent',
  Envs = 'Envs',
  Context = 'Context',
  Deploy = 'Deploy',
}

const apiHost = process.env.NODE_ENV === 'development'
  ? 'http://localhost:49155'
  : 'https://ai-api-service-7d2cl2hooq-uc.a.run.app'

async function handlePostGenerate(url: string, { arg }: {
  arg: {
    projectID: string,
    route: Route,
    envs: { key: string, value: string }[],
  }
}) {
  return await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      projectID: arg.projectID,
      routeID: arg.route.id,
      // Transform block with structured prose into block with plain prompt text.
      blocks: arg.route.blocks.map(b => {
        switch (b.type) {
          case 'Description':
          case 'Instructions':
            const [markdown, references] = html2markdown(b.content)
            const block: Block = {
              ...b,
              content: markdown,
            }
            return block
          default:
            return b
        }
      }),
      method: arg.route.method.toLowerCase(),
      route: arg.route.route,
      envs: arg.envs,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(r => r.json())
}

function Sidebar({
  project,
  route,
  activeMenuSection,
}: Props) {
  const deployment = useLatestDeployment(project, route)

  const {
    trigger: generate,
    isMutating: isDeployRequestRunning,
  } = useSWRMutation(`${apiHost}/generate`, handlePostGenerate)

  const [selectors] = useStateStore()
  const envs = selectors.use.envs()

  async function deploy() {
    if (!route) return
    await generate({
      projectID: project.id,
      route,
      envs,
    })
  }

  const [isInitializingDeploy, setIsInitializingDeploy] = useState(false)

  useEffect(function handleDeployState() {
    if (!deployment) return
    setIsInitializingDeploy(false)
  }, [deployment])

  useEffect(function handleDeployState() {
    if (!isDeployRequestRunning) return
    setIsInitializingDeploy(true)
  }, [isDeployRequestRunning])

  return (
    <div
      className={clsx(`
      flex
      bg-white
      w-full
      flex-col
      min-h-0
      `,
      )}
    >
      {activeMenuSection === MenuSection.Deploy &&
        <div
          className="
        flex
        px-4
        py-2
        justify-start
        border-b
        flex-col
      "
        >
          <div
            className="
            flex
            flex-1
            items-center
            justify-between
          "
          >
            <Text
              text="Latest Deployment"
              className="
              font-semibold
              uppercase
              text-slate-400
            "
              size={Text.size.S2}
            />
          </div>
          {deployment?.url &&
            <Link
              href={deployment.url}
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text
                size={Text.size.S3}
                text={deployment.url.substring('https://'.length)}
              />
            </Link>
          }
          {!deployment?.url &&
            <Text
              text="No deployment URL found"
              size={Text.size.S3}
              className="text-slate-400"
            />
          }
        </div>
      }
      {activeMenuSection === MenuSection.Context &&
        <Context />
      }
      {activeMenuSection === MenuSection.Envs &&
        <Envs />
      }
      {activeMenuSection === MenuSection.Agent &&
        <Agent
          deploy={deploy}
          isDeployRequestRunning={isDeployRequestRunning}
          isInitializingDeploy={isInitializingDeploy}
          deployment={deployment}
        />
      }
    </div>
  )
}
export default Sidebar
