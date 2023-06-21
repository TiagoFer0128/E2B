import type { GetServerSideProps } from 'next'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type { ParsedUrlQuery } from 'querystring'

import { prisma, projects } from 'db/prisma'
import { serverCreds } from 'db/credentials'
import AgentRun from 'components/AgentRun'

interface PathProps extends ParsedUrlQuery {
  runID: string
  projectID: string
}

export const getServerSideProps: GetServerSideProps<Props, PathProps> = async (ctx) => {
  const projectID = ctx.params?.projectID
  const logID = ctx.params?.logID
  if (!projectID) {
    return {
      redirect: {
        destination: '/',
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
                where: {
                  id: {
                    equals: projectID,
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  const project = user
    ?.users_teams
    .flatMap(t => t.teams.projects)
    .find(p => p.id === projectID)

  if (!project) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      project,
      logID,
    }
  }
}

interface Props {
  project: projects
  runID: string
}

function ProjectPage({
  project,
  runID,
}: Props) {
  return (
    <AgentRun
    />
  )
}

export default ProjectPage
