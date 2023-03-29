import {
  useEffect,
  useState,
} from 'react'
import { createDocument, Editor, getSchema } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { keymap } from 'prosemirror-keymap'
import { MarkdownSerializer, defaultMarkdownSerializer } from 'prosemirror-markdown'
import BulletList from '@tiptap/extension-bullet-list'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import CodeBlock from '@tiptap/extension-code-block'

import ContextAutocomplete from 'editor/extensions/contextAutocomplete'
import Context, { CONTEXT_TYPE_ATTRIBUTE_NAME, CONTEXT_VALUE_ATTRIBUTE_NAME, PromptContext } from 'editor/extensions/promptContext'

const extensions = [
  StarterKit.configure({
    blockquote: false,
    bold: false,
    // code: false,
    dropcursor: false,
    hardBreak: false,
    // heading: false,
    horizontalRule: false,
    italic: false,
    strike: false,

    // We use the Ordered List, Code block, Bullet List and List item from explicit packages
    // so we can use their names in the markdown serializer.
    codeBlock: false,
    bulletList: false,
    listItem: false,
    orderedList: false,
  }),
  CodeBlock,
  OrderedList,
  ListItem,
  BulletList,
  ContextAutocomplete,
  Context,
]

const schema = getSchema(extensions)

const serializer = new MarkdownSerializer({
  ...defaultMarkdownSerializer.nodes,
  [OrderedList.name]: defaultMarkdownSerializer.nodes.ordered_list,
  [ListItem.name]: defaultMarkdownSerializer.nodes.list_item,
  [BulletList.name]: defaultMarkdownSerializer.nodes.bullet_list,
  [CodeBlock.name]: defaultMarkdownSerializer.nodes.code_block,
  [Context.name]: (state, node, parent, index) => {
    state.text(node.attrs[CONTEXT_VALUE_ATTRIBUTE_NAME])
  },
}, {
  ...defaultMarkdownSerializer.marks,
})

export function html2markdown(html: string): [string, PromptContext[]] {
  const node = createDocument(html, schema)
  const markdown = serializer.serialize(node)
  const context: PromptContext[] = []
  node.descendants(n => {
    if (n.type.name === Context.name) {
      context.push({
        type: n.attrs[CONTEXT_TYPE_ATTRIBUTE_NAME],
        value: n.attrs[CONTEXT_VALUE_ATTRIBUTE_NAME],
      })
    }
  })

  return [markdown, context]
}

function useDocEditor({
  initialContent,
  onContentChange,
  placeholder,
}: {
  initialContent: string,
  onContentChange: (content: string) => void,
  placeholder?: string
}) {
  const [editor, setEditor] = useState<Editor | null>(null)

  useEffect(function initialize() {
    const instance = new Editor({
      content: initialContent,
      parseOptions: {
        preserveWhitespace: 'full',
      },
      injectCSS: false,
      editorProps: {
        attributes: {
          'data-gramm': 'false',
          'spellcheck': 'false',
        },
      },
      extensions: [
        ...extensions,
        Placeholder.configure({
          placeholder: ({ editor }) => {
            if (!editor.getText()) {
              return placeholder || ''
            }
            return ''
          }
        }),
      ],
    })

    // Override default browser Ctrl/Cmd+S shortcut.
    instance.registerPlugin(keymap({
      'Mod-s': function () {
        return true
      },
    }))

    instance.on('transaction', t => {
      if (t.transaction.docChanged) {
        onContentChange(t.editor.getHTML())
      }
    })

    setEditor(instance)

    return () => {
      instance.destroy()
      setEditor(null)
    }
  }, [
    onContentChange,
    // We don't want the initialContent in the dependencies because that would reload the editor when we type.
  ])

  return editor
}

export default useDocEditor
