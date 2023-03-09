import useSWRMutation from 'swr/mutation'
import { Fragment, useState } from 'react'
import Hotkeys from 'react-hot-keys'
import { projects } from '@prisma/client'

import { Block, methods, Method } from 'state/store'
import { useStateStore } from 'state/StoreProvider'
import Select from 'components/Select'
import Button from 'components/Button'
import Text from 'components/Text'
import { useLatestDeployment } from 'hooks/useLatestDeployment'

import BlockEditor from './BlockEditor'
import ConnectionLine from './ConnectionLine'
import AddBlockButton from './AddBlockButton'
import Logs from './Logs'
import Routes from './Routes'
import { useRouter } from 'next/router'

// TODO: Prod API host
const apiHost = process.env.NODE_ENV === 'development' ?
  'http://0.0.0.0:5000' :
  'https://ai-api-service-7d2cl2hooq-uc.a.run.app'

export type Log = string

export interface Props {
  project: projects
}

async function handlePostGenerate(url: string, { arg }: {
  arg: {
    projectID: string
    blocks: Block[]
    method: Method
    route: string
  },
}) {
  return await fetch(url, {
    method: 'POST',
    body: JSON.stringify({
      projectID: arg.projectID,
      blocks: arg.blocks.map(b => b.prompt),
      method: arg.method.toLowerCase(),
      route: arg.route,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(r => r.json())
}

function Editor({ project }: Props) {
  const router = useRouter()
  const store = useStateStore()

  const routes = store.use.routes()
  const addBlock = store.use.addBlock()
  const deleteBlock = store.use.deleteBlock()
  const changeBlock = store.use.changeBlock()
  const changeRoute = store.use.changeRoute()

  const selectedRoute =
    routes.find(r => r.id === router.query.route) ||
    (routes.length > 0 ? routes[0] : undefined)
  const deployment = useLatestDeployment(project, selectedRoute)
  const logs = deployment?.logs as Log[] | undefined

  const [focusedBlock, setFocusedBlock] = useState({ index: 0 })
  const { trigger: generate } = useSWRMutation(`${apiHost}/generate`, handlePostGenerate)

  async function deploy() {
    if (!selectedRoute) return

    const response = await generate({
      blocks: selectedRoute.blocks,
      projectID: project.id,
      method: selectedRoute.method,
      route: selectedRoute.route,
    })
    console.log(response.code)
    console.log(response.host)
  }

  return (
    <Hotkeys
      keyName="command+enter,control+enter,shift+command+enter,shift+control+enter"
      onKeyDown={(s) => {
        if (s === 'command+enter' || s === 'control+enter') {
          if (!selectedRoute) return
          setFocusedBlock(b => {
            if (selectedRoute.blocks.length === 0 || b.index === selectedRoute?.blocks.length - 1) {
              addBlock(selectedRoute.id)
            }
            return { index: b.index + 1 }
          })
        } else if (s === 'shift+command+enter' || s === 'shift+control+enter') {
          setFocusedBlock(b => ({ index: b.index > 0 ? b.index - 1 : b.index }))
        }
      }}
      filter={() => {
        return true
      }}
      allowRepeat
    >
      <div className="flex flex-row flex-1 overflow-hidden">
        <Routes
          routes={routes}
          projectID={project.id}
        />
        {selectedRoute &&
          <>
            <div className="
      flex
      flex-1
      p-8
      flex-col
      items-center
      overflow-auto
      scroller
      relative
    ">
              <div className="flex items-center space-x-2">
                <Text
                  text="Incoming"
                  className='font-bold'
                />
                <Select
                  direction="left"
                  selectedValue={{ key: selectedRoute.method, title: selectedRoute.method.toUpperCase() }}
                  values={methods.map(m => ({ key: m, title: m.toUpperCase() }))}
                  onChange={m => changeRoute(selectedRoute.id, { method: m.key as Method })}
                />
                <Text
                  text="Request"
                  className='font-bold'
                />
              </div>
              <div className="
        flex
        flex-col
        items-center
        transition-all
        ">
                {selectedRoute.blocks.map((b, i) =>
                  <Fragment
                    key={b.id}
                  >
                    <ConnectionLine className='h-4' />
                    <BlockEditor
                      block={b}
                      onDelete={() => {
                        deleteBlock(selectedRoute.id, i)
                        setTimeout(() => {
                          if (i <= focusedBlock.index) {
                            setFocusedBlock(b => ({ index: b.index - 1 }))
                          } else {
                            setFocusedBlock(b => ({ index: b.index }))
                          }
                        }, 0)
                      }}
                      onChange={(b) => changeBlock(selectedRoute.id, i, b)}
                      index={i}
                      focus={focusedBlock}
                      onFocus={() => setFocusedBlock({ index: i })}
                    />
                  </Fragment>
                )}
              </div>
              <ConnectionLine className='min-h-[16px]' />
              <AddBlockButton addBlock={(block) => {
                addBlock(selectedRoute.id, block)
                setTimeout(() => setFocusedBlock({ index: selectedRoute.blocks.length }), 0)
              }} />
              <div className="fixed right-3 top-14">
                <Button
                  text="Deploy"
                  onClick={deploy}
                  variant={Button.variant.Full}
                />
              </div>
            </div>
            {logs && <Logs logs={logs} />}
          </>
        }
      </div>
    </Hotkeys>
  )
}

export default Editor
