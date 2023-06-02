import {
  Github,
} from 'lucide-react'

export interface Props {
  repos: any[]
  onRepoSelection: (repo: any) => void
}

function RepositoriesList({
  repos,
  onRepoSelection,
}: Props) {
  return (
    <ul role="list" className="w-full overflow-auto divide-y divide-gray-700">
      {repos.map((r) => (
        <li key={r.id} className="px-2 flex items-center justify-between py-5 h-[70px]">
          <div className="flex flex-col items-start justify-start">
            <div className="flex items-center space-x-1">
              <Github color="#fff" size={14} />
              <p className="text-xs leading-6 text-white">{r.owner.login}</p>
              <p className="text-xs text-white">/</p>
              <p className="text-sm font-semibold leading-6 text-white">{r.name}</p>
            </div>
            {r.language && (
              <p className="text-xs leading-6 text-gray-400">{r.language}</p>
            )}
          </div>
          <button
            type="button"
            className="rounded bg-white/10 px-2 py-1 text-sm font-medium text-white shadow-sm hover:bg-white/20"
            onClick={() => onRepoSelection(r)}
          >
            Select
          </button>
        </li>
      ))}
    </ul>
  )
}

export default RepositoriesList