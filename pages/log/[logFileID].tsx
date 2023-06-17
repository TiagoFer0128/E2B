import { useState } from 'react'
import { AgentPromptLogs, AgentNextActionLog, } from 'utils/agentLogs'
import type { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { ParsedUrlQuery } from 'querystring'
import clsx from 'clsx'
import Splitter from '@devbookhq/splitter'
import Link from 'next/link'

import { log_files, prisma } from 'db/prisma'
import { serverCreds } from 'db/credentials'
import {
  SystemPromptLog,
  UserPromptLog,
  AssistantPromptLog,
} from 'utils/agentLogs'
import AgentPrompLogDetail from 'components/AgentPromptLogDetail'
import AgentPromptLogsList from 'components/AgentPromptLogsList'
import { alwaysTrue } from 'utils/positive'

interface PathProps extends ParsedUrlQuery {
  logFileID: string
}

export interface Props {
  logFile: log_files & { content: AgentPromptLogs | AgentNextActionLog }
}

export const getServerSideProps: GetServerSideProps<Props, PathProps> = async (ctx) => {
  const logFileID = ctx.params?.logFileID
  if (!logFileID) {
    return {
      redirect: {
        destination: '/?view=logs',
        permanent: false,
      }
    }
  }

  const supabase = createServerSupabaseClient(ctx, serverCreds)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      redirect: {
        destination: '/sign',
        permanent: false,
      },
    }
  }

  const user = await prisma.auth_users.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      users_teams: {
        select: {
          teams: {
            include: {
              projects: {
                include: {
                  log_files: {
                    where: {
                      id: logFileID,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const logFile = user
    ?.users_teams
    .flatMap(ut => ut.teams)
    .flatMap(t => t.projects)
    .flatMap(p => p.log_files)
    .find(alwaysTrue)

  if (!logFile) {
    return {
      notFound: true,
    }
  }

  const parsedFileContent = JSON.parse(logFile.content)

  // Specific to AutoGPT
  if (logFile.filename.includes('next_action')) {
    return {
      props: {
        logFile: {
          ...logFile,
          content: parsedFileContent as AgentNextActionLog,
        }
      }
    }
  }

  return {
    props: {
      logFile: {
        ...logFile,
        content: {
          ...parsedFileContent,
          logs: parsedFileContent?.context || [],
          context: undefined,
        } as AgentPromptLogs,
      },
    },
  }
}

function LogFile({ logFile }: Props) {
  console.log('logFile', logFile)
  const [isResizing, setIsResizing] = useState(false)
  const [sizes, setSizes] = useState([60, 40])
  const [selectedLog, setSelectedLog] = useState<SystemPromptLog | UserPromptLog | AssistantPromptLog>()

  return (
    <main className="overflow-hidden flex flex-col flex-1">
      <header className="flex items-center space-x-2 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <Link
          href="/?view=logs"
        >
          <h1 className="text-2xl font-semibold leading-7 text-[#6366F1]">Log Files</h1>
        </Link>
        <h1 className="text-2xl font-semibold leading-7 text-[#6366F1]">/</h1>
        <h1 className="text-2xl font-semibold leading-7 text-white font-mono">{logFile.filename}</h1>
      </header>

      <div className="flex-1 flex items-start justify-start space-x-2 sm:p-6 lg:px-8 overflow-hidden">
        <Splitter
          draggerClassName={clsx(
            'bg-gray-700 group-hover:bg-[#6366F1] transition-all delay-75 duration-[400ms] w-0.5 h-full',
            isResizing && 'bg-[#6366F1]',
          )}
          gutterClassName={clsx(
            'mx-2 bg-transparent hover:bg-[#6366F1] transition-all delay-75 duration-[400ms] px-0.5 rounded-sm group',
            isResizing && 'bg-[#6366F1]',
          )}
          classes={['flex', 'flex']}
          onResizeStarted={() => setIsResizing(true)}
          onResizeFinished={(_, newSizes) => {
            setIsResizing(false)
            setSizes(newSizes)
          }}
          initialSizes={sizes}
        >
          {logFile.filename.includes('full_message_history') || logFile.filename.includes('current_context') ? (
            <>
              <AgentPromptLogsList
                logs={(logFile.content as AgentPromptLogs).logs}
                onSelected={setSelectedLog}
              />
              <AgentPrompLogDetail
                log={selectedLog}
              />
            </>
          ) : logFile.filename.includes('next_action') ? (
            <div />
          ) : (
            <div>
              Unexpected JSON format. Please reach out to the e2b team.
            </div>
          )}
        </Splitter>
      </div>
    </main >
  )
}

export default LogFile
