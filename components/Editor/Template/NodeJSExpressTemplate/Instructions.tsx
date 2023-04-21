import useInstruction from 'components/Editor/Template/NodeJSExpressTemplate/useInstruction'

import InstructionsEditor from './InstructionsEditor'
import RequestBodyEditor from './RequestBodyEditor'
import useReferences from 'hooks/useReferences'

export interface Props {
  route?: Route
}

function RouteEditor({ route }: Props) {
  const [descriptionBlock, updateDescriptionBlock] = useInstruction('Description', 'xml')
  const [requestBodyBlock, updateRequestBodyBlock] = useInstruction('RequestBody', 'text')
  const [instructionsBlock, updateInstructionsBlock] = useInstruction('Instructions', 'xml')

  const [referenceSearch] = useReferences()

  return (
    <div className="
      py-8
      px-4
      flex
      flex-1
      bg-white
      justify-center
      overflow-auto
      scroller
    ">
      {!route &&
        <div className="
          text-slate-400
          self-center
        ">
          No route selected
        </div>
      }
      {route &&
        <div className="
          flex
          flex-col
          items-start
          space-y-6
          max-w-[65ch]
          grow
        ">
          {descriptionBlock &&
            <InstructionsEditor
              referenceSearch={referenceSearch}
              title="What should this route do?"
              placeholder="This is an API endpoint that ..."
              content={descriptionBlock.content}
              onChange={updateDescriptionBlock}
            />
          }
          {requestBodyBlock &&
            <RequestBodyEditor
              block={requestBodyBlock}
              onChange={updateRequestBodyBlock}
            />
          }
          {instructionsBlock &&
            <InstructionsEditor
              referenceSearch={referenceSearch}
              title="Step-by-step instructions"
              placeholder="1. Check if the incoming `email` is not empty ..."
              content={instructionsBlock.content}
              onChange={updateInstructionsBlock}
            />
          }
        </div>
      }
    </div >
  )
}

export default RouteEditor
