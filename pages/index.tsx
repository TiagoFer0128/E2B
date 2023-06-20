import type { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { nanoid } from 'nanoid'
import path from 'path'

import { prisma, projects, deployments, log_files } from 'db/prisma'
import { serverCreds } from 'db/credentials'
import DashboardHome from 'components/DashboardHome'
import { AgentNextActionLog, AgentPromptLogs, LiteLogUpload } from 'utils/agentLogs'

export interface Props {
  projects: (projects & { log_uploads: LiteLogUpload[], deployments: deployments[] })[]
  defaultProjectID: string
}

function getLastTwoDirsAndFile(fullPath: string): string {
  const fileName = path.basename(fullPath)
  const dirName = path.dirname(fullPath)

  const parts = dirName.split(path.sep)
  const lastTwoDirs = parts.slice(-2).join(path.sep)

  return path.join(lastTwoDirs, fileName)
}

function formatLogFileContent(logFile: Omit<log_files, 'project_id' | 'type' | 'size' | 'last_modified' | 'deployment_id'>) {
  const relativePath = getLastTwoDirsAndFile(logFile.relativePath)

  // This parsing is very Ssecific to the AutoGPT format.
  const filename = logFile.filename
  console.log('filename', filename)
  if (filename.includes('user_input.txt')
    || filename.includes('summary.txt')
  ) {
    return {
      ...logFile,
      relativePath,
      content: logFile.content as string,
    }
  } else if (filename.includes('next_action')) {
    const parsedFileContent = JSON.parse(logFile.content)
    return {
      ...logFile,
      relativePath,
      content: parsedFileContent as AgentNextActionLog,
    }
  } else if (
    filename.includes('full_message_history')
    || filename.includes('current_context')
    || filename.includes('prompt_summary')
  ) {
    const parsedFileContent = JSON.parse(logFile.content)
    return {
      ...logFile,
      relativePath,
      content: {
        logs: parsedFileContent as AgentPromptLogs,
      },
    }
  } else {
    console.error(`Unexpected log file: ${filename}`)
  }

  const parsedFileContent = JSON.parse(logFile.content)
  return {
    ...logFile,
    relativePath,
    content: {
      ...parsedFileContent,
      logs: parsedFileContent?.context || [],
      context: undefined,
    },
  }
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  // Select the 'deployed' view by default.
  const view = ctx.query['view'] as string
  const defaultNewTeamID = process.env.DEFAULT_NEW_TEAM_ID as string | undefined
  if (!view) {
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

  const teams = await prisma.teams.findMany({
    where: {
      users_teams: {
        some: {
          user_id: session.user.id,
        }
      }
    },
    select: {
      id: true,
      is_default: true,
      projects: {
        where: {
          is_default: true,
        },
        include: {
          log_uploads: {
            select: {
              display_name: true,
              id: true,
              created_at: true,
              log_files: {
                select: {
                  id: true,
                  log_upload_id: true,
                  created_at: true,
                  filename: true,
                  relativePath: true,
                  content: true,
                },
              },
            },
          },
        },
      },
    },
  })

  const defaultTeam =
    teams.find(t => t.is_default) ||
    (defaultNewTeamID && await prisma.teams.update({
      where: {
        id: defaultNewTeamID,
      },
      data: {
        users_teams: {
          connectOrCreate: {
            where: {
              user_id_team_id: {
                team_id: defaultNewTeamID,
                user_id: session.user.id,
              },
            },
            create: {
              user_id: session.user.id,
            },
          },
        },
      },
      include: {
        projects: {
          include: {
            log_uploads: {
              include: {
                log_files: true,
              },
            },
          },
        },
      },
    })) ||
    await prisma.teams.create({
      include: {
        projects: {
          include: {
            log_uploads: {
              include: {
                log_files: true,
              },
            },
          },
        },
      },
      data: {
        id: nanoid(),
        name: session.user.email || session.user.id,
        is_default: true,
        projects: {
          create: {
            name: 'Default Project',
            is_default: true,
          },
        },
        users_teams: {
          create: {
            users: {
              connect: {
                id: session.user.id,
              },
            },
          },
        },
      },
    })

  const defaultProject =
    teams.flatMap(t => t.projects).find(p => p.is_default) ||
    defaultTeam.projects.find(p => p.is_default) ||
    await prisma.projects.create({
      data: {
        id: nanoid(),
        is_default: true,
        name: 'Default Project',
        teams: {
          connect: {
            id: defaultTeam.id,
          },
        },
      },
      include: {
        log_uploads: {
          include: {
            log_files: true,
          },
        },
      },
    })

  return {
    props: {
      defaultProjectID: defaultProject.id,
      projects: [defaultProject]
        .map(p => ({
          ...p,
          // Don't send any deployments to the client but keep the props structure so we don't have to change the component now.
          deployments: [],
          log_uploads: p
            .log_uploads
            .map<LiteLogUpload>(u => ({
              ...u,
              log_files: u.log_files.map(formatLogFileContent),
            }))
        }))
    },
  }
}

function Home({ projects, defaultProjectID }: Props) {


  return (
    <DashboardHome
      defaultProjectID={defaultProjectID}
      projects={projects}
    />
  )
}

export default Home
