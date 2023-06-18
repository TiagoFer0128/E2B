import {
  useRef,
  useState,
} from 'react'
import {
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import Splitter from '@devbookhq/splitter'

import { log_files } from 'db/prisma'
import { useUploadLogs } from 'hooks/useUploadLogs'
import LogFolderUploadButton from 'components/LogFolderUploadButton'
import {
  LiteLogUpload,
  AgentPromptLogs,
  AgentNextActionLog,
} from 'utils/agentLogs'
import Spinner from 'components/Spinner'
import AgentLogFileContent from 'components/AgentLogFileContent'
import { useGetLogFile } from 'hooks/useGetLogFile'
import Uploadtree from 'components/Uploadtree'

export interface Props {
  logUploads: LiteLogUpload[]
  defaultProjectID: string
}

function AgentLogFilesList({
  logUploads,
  defaultProjectID,
}: Props) {
  const getLogFile = useGetLogFile()
  const [isUploading, setIsUploading] = useState(false)
  const [openedLogUploads, setOpeneLogUploads] = useState<string[]>([])
  const [selectedLogFile, setSelectedLogFile] = useState<Omit<log_files, 'content'> & { content: AgentPromptLogs | AgentNextActionLog }>()
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const uploadFiles = useUploadLogs(defaultProjectID)

  const sortedLogUploads = logUploads
    // logUploads sorted by created_at - the newest first
    .sort((a, b) => {
      if (a.created_at > b.created_at) return -1
      if (a.created_at < b.created_at) return 1
      return 0
    })
    // Sort the log_files inside logUploads alphabtetical by relativePath
    .map(logUpload => {
      const sortedLogFiles = logUpload.log_files.sort((a, b) => {
        if (a.relativePath > b.relativePath) return 1
        if (a.relativePath < b.relativePath) return -1
        return 0
      })

      return {
        ...logUpload,
        log_files: sortedLogFiles,
      }
    })


  function handleClickOnUpload() {
    // trigger the click event of the file input
    fileInput.current?.click()
  }

  async function handleUpload(files: FileList) {
    const logFiles: Pick<log_files, 'content' | 'filename' | 'relativePath' | 'size' | 'last_modified' | 'type'>[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const content = await file.text()

      if (file.name.startsWith('.')) continue

      logFiles.push({
        filename: file.name,
        relativePath: file.webkitRelativePath,
        type: file.type,
        content,
        last_modified: new Date(file.lastModified),
        size: file.size,
      })
    }

    await uploadFiles(logFiles)
    // Reload to refresh the list of log files
    router.reload()
  }

  async function handleFileChange(event: any) {
    if (event.target.files.length === 0) return
    setIsUploading(true)
    await handleUpload(event.target.files)
    setIsUploading(false)
  }

  function toggleLogUpload(logUploadID: string) {
    if (openedLogUploads.includes(logUploadID)) {
      setOpeneLogUploads(prev => prev.filter(id => id !== logUploadID))
    } else {
      setOpeneLogUploads(prev => [...prev, logUploadID])
    }
  }

  function logFileURL(logFileID: string) {
    // Create URL like so /?logFileID=123 and also pass any existing queries in the router.
    const query = {
      ...router.query,
      logFileID,
      selectedLog: '0',
    }
    return `/?${new URLSearchParams(query).toString()}`
  }

  async function selectLogFile(logFileID: string) {
    // Log files in logUploads don't have content. We fetch the full log file lazily.
    const logFile = await getLogFile(logFileID)
    if (!logFile) return

    const parsedFileContent = JSON.parse(logFile.content)

    // Specific to AutoGPT
    if (logFile.filename.includes('next_action')) {
      setSelectedLogFile({
        ...logFile,
        content: parsedFileContent,
      })
    } else if (logFile.filename.includes('full_message_history') || logFile.filename.includes('current_context')) {
      setSelectedLogFile({
        ...logFile,
        content: {
          //logs: parsedFileContent as AgentNextActionLog,
          logs: parsedFileContent as any,
        },
      })
    } else {
      setSelectedLogFile({
        ...logFile,
        content: {
          ...parsedFileContent,
          logs: parsedFileContent?.context || [],
          context: undefined,
        },
      })
    }
  }

  return (
    <main className="overflow-hidden flex flex-col max-h-full flex-1">
      <input
        type="file"
        style={{ display: 'none' }}
        ref={fileInput}
        onChange={handleFileChange}
        // @ts-ignore
        directory=""
        webkitdirectory=""
        mozdirectory=""
        allowdirs=""
        multiple
      />
      <header className="flex items-center justify-between p-4 sm:p-6 lg:px-8 min-h-[88px]">
        <h1 className="text-2xl font-semibold text-white">Log Files</h1>
        {isUploading ? (
          <Spinner />
        ) : (
          <LogFolderUploadButton
            onClick={handleClickOnUpload}
          />
        )}
      </header>
      {sortedLogUploads.length === 0 && (
        <div
          className="flex items-center justify-center flex-1"
        >
          <p className="text-gray-400 text-lg">No log files uploaded yet</p>
        </div>
      )}

      {sortedLogUploads.length > 0 && (
        <Splitter
          gutterClassName={clsx(
            'bg-gray-900 hover:bg-[#6366F1] transition-all delay-75 duration-[400ms] px-0.5 rounded-sm group',
          )}
          draggerClassName={clsx(
            'bg-gray-700 group-hover:bg-[#6366F1] transition-all delay-75 duration-[400ms] w-0.5 h-full',
          )}
          classes={['flex pr-2 overflow-auto', 'bg-gray-900 flex pl-2']}
        >
          <div className="flex flex-col space-y-4 p-4 sm:p-6 lg:px-8 overflow-auto min-w-[320px]">
            <Uploadtree logUploads={logUploads} />
            {sortedLogUploads.map((logUpload, i) => (
              <div
                key={logUpload.id}
              >
                <div
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={clsx(
                        'p-1 cursor-pointer hover:bg-gray-700 transition-all rounded-md',
                        openedLogUploads.includes(logUpload.id) && 'bg-gray-700',
                        !openedLogUploads.includes(logUpload.id) && 'bg-gray-800',
                      )}
                      onClick={() => toggleLogUpload(logUpload.id)}
                    >
                      <ChevronRight size={15} className={clsx(
                        'text-gray-400',
                        'transition-all',
                        'select-none',
                        openedLogUploads.includes(logUpload.id) && 'rotate-90',
                      )} />
                    </div>
                    <span
                      className={clsx(
                        'text-sm',
                        'font-semibold',
                        'text-gray-500',
                        'whitespace-nowrap',
                      )}
                      // This prevents hydration warning for timestamps rendered via SSR
                      suppressHydrationWarning
                    >
                      Upload from {logUpload.created_at.toLocaleString()}
                    </span>
                  </div>

                  {openedLogUploads.includes(logUpload.id) && (
                    <div className="flex flex-col space-y-3 border-l border-gray-800 pl-2 ml-[10px]">
                      {logUpload.log_files.map((logFile) => (
                        <span
                          key={logFile.id}
                          className={clsx(
                            'rounded-md',
                            'py-0.5',
                            'px-2',
                            'text-gray-200',
                            'hover:bg-[#1F2437]',
                            'transition-all',
                            'w-full',
                            'text-sm',
                            'cursor-pointer',
                            'font-mono',
                            'flex',
                            'items-center',
                            'space-x-2',
                          )}
                        >
                          <Link
                            href={logFileURL(logFile.id)}
                            shallow={true}
                            onClick={() => selectLogFile(logFile.id)}
                          >
                            {logFile.relativePath.split('/').map(p => (
                              <span key={p}>{'/ '}{p}</span>
                            ))}
                          </Link>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <AgentLogFileContent
            logFile={selectedLogFile}
          />
        </Splitter>
      )}
    </main >
  )
}

export default AgentLogFilesList