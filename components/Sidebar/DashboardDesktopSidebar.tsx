import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Navigation } from './types'

export interface Props {
  onSignOut: () => void
  navigation: Navigation
}

function DashboardDesktopSidebar({
  onSignOut,
  navigation,
}: Props) {
  const router = useRouter()
  const view = router.query.view as string | undefined
  const isOnRunDetail = router.pathname.startsWith('/deployed/[projectID]/run/[runID]')
  const isOnLogDetail = router.pathname.startsWith('/log/[logFileID]')

  return (
    <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-56 xl:flex-col">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-black/10 px-6 border-r border-white/5">
        {/* Logo */}
        {/* <div className="flex h-16 shrink-0 items-center">
          <img
            className="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
            alt="Your Company"
          />
        </div> */}
        <nav className="flex flex-1 flex-col space-y-6 py-[22px]">
          <div className="font-bold text-gray-100">
            e2b
          </div>
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={`/?view=${item.view}`}
                      className={clsx(
                        item.view === view || (isOnRunDetail && item.view === 'runs') || (isOnLogDetail && item.view === 'logs')
                          ? 'bg-[#1F2437] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-[#1F2437]',
                        'group gap-x-3 rounded-md px-2 py-1 text-sm leading-6 font-semibold flex items-center'
                      )}
                      shallow
                    >
                      <item.icon size={16} className="shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li className="-mx-6 mt-auto">
              <div
                className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white"
              >
                <button
                  className="text-sm font-semibold text-white"
                  onClick={onSignOut}
                >
                  Sign Out
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default DashboardDesktopSidebar