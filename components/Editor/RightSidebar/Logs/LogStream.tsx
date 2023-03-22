import { Fragment, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

import ConnectionLine from 'components/Editor/ConnectionLine'
import { Log } from 'db/types'

import LogEntry from './LogEntry'

export interface Props {
  logs?: Log[]
  rawLogs?: string | null
}

function LogStream({ logs, rawLogs }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(function scrollLogs() {
    if (!ref.current) return
    ref.current.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div
      className="
        flex-1
        overflow-auto
        text-xs
        tracking-wide
        font-sans
        scroller
        whitespace-pre-wrap
        py-4
        flex
        flex-col
        px-2
    ">
      {rawLogs &&
        <ReactMarkdown>
          {rawLogs}
        </ReactMarkdown>
      }
      {logs && logs.map((l, i, a) =>
        <Fragment key={i}>
          <LogEntry
            log={l}
          />
          {i < a.length - 1 &&
            <div className="flex items-center flex-col">
              <ConnectionLine className="h-4" />
            </div>
          }
        </Fragment>
      )}
      <div ref={ref} />
    </div>
  )
}

export default LogStream
