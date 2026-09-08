'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { useEffect } from 'react'

interface EditorProps {
  content: string
  onChange: (html: string) => void
  isEditable: boolean
}

export default function Editor({ content, onChange, isEditable }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: content,
    editable: isEditable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable)
    }
  }, [isEditable, editor])

  if (!editor) return null

  const addImage = () => {
    const url = window.prompt("Saisissez l'URL de l'image ou du schéma scientifique :")
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  const addVideoEmbed = () => {
    const url = window.prompt("Saisissez l'URL de la vidéo YouTube :")
    if (!url) return

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    const videoId = match && match[2].length === 11 ? match[2] : null

    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`

      const cardHtml = `
        <div class="my-4 p-2 bg-black border-4 border-white inline-block text-center font-mono">
          <div class="relative w-[280px] h-[157px] mx-auto overflow-hidden border-2 border-gray-600 bg-black flex items-center justify-center">
            <img src="${thumbnailUrl}" alt="Vignette" class="w-full h-full object-cover opacity-80 pointer-events-none select-none" />
            <a href="${youtubeUrl}" target="_blank" rel="noopener noreferrer" 
               title="Cliquer pour lancer la vidéo sur YouTube"
               class="absolute z-10 w-14 h-10 bg-red-600 hover:bg-red-700 border-2 border-white rounded-md flex items-center justify-center shadow-2xl cursor-pointer pointer-events-auto transition-transform active:scale-95">
              <div class="w-0 h-0 border-y-[8px] border-y-transparent border-l-[14px] border-l-white ml-1"></div>
            </a>
          </div>
          <div class="mt-2 text-[10px] font-bold text-yellow-300 tracking-tight uppercase">
            [ CLIQUER SUR LE BOUTON ROUGE CENTRAL ]
          </div>
        </div>
      `
      editor.chain().focus().insertContent(cardHtml).run()
    } else {
      alert("Format d'URL YouTube invalide.")
    }
  }

  return (
    <div className="w-full bg-[#c0c0c0] p-2 border-4 border-black font-mono">
      {isEditable && (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-black text-white border-2 border-white mb-4 shadow-md">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 text-xs font-black border-2 ${
              editor.isActive('bold')
                ? 'bg-yellow-400 text-black border-white'
                : 'bg-[#c0c0c0] text-black border-t-white border-l-white border-b-black border-r-black'
            }`}
          >
            <b>GRAS</b>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 text-xs italic font-black border-2 ${
              editor.isActive('italic')
                ? 'bg-yellow-400 text-black border-white'
                : 'bg-[#c0c0c0] text-black border-t-white border-l-white border-b-black border-r-black'
            }`}
          >
            <i>ITALIQUE</i>
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1 text-xs font-black border-2 ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-yellow-400 text-black border-white'
                : 'bg-[#c0c0c0] text-black border-t-white border-l-white border-b-black border-r-black'
            }`}
          >
            TITRE 1
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1 text-xs font-black border-2 ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-yellow-400 text-black border-white'
                : 'bg-[#c0c0c0] text-black border-t-white border-l-white border-b-black border-r-black'
            }`}
          >
            TITRE 2
          </button>

          <div className="h-6 w-0.5 bg-white mx-1"></div>

          <span className="text-[10px] font-bold text-yellow-300 uppercase">Couleurs :</span>

          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#00FF00').run()}
            className="w-6 h-6 bg-[#00FF00] border-2 border-white hover:scale-110 transition-transform"
            title="Vert Mat Fluo"
          />

          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#FFFFFF').run()}
            className="w-6 h-6 bg-white border-2 border-black hover:scale-110 transition-transform"
            title="Blanc Mat"
          />

          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#CC0000').run()}
            className="w-6 h-6 bg-[#CC0000] border-2 border-white hover:scale-110 transition-transform"
            title="Rouge Mat Industrial"
          />

          <button
            type="button"
            onClick={() => editor.chain().focus().setColor('#000055').run()}
            className="w-6 h-6 bg-[#000055] border-2 border-white hover:scale-110 transition-transform"
            title="Bleu Abyssal Foncé"
          />

          <div className="h-6 w-0.5 bg-white mx-1"></div>

          <button
            type="button"
            onClick={addImage}
            className="px-3 py-1 text-xs font-black bg-[#c0c0c0] text-black border-2 border-t-white border-l-white border-b-black border-r-black"
          >
            🖼️ SCHÉMA
          </button>

          <button
            type="button"
            onClick={addVideoEmbed}
            className="px-3 py-1 text-xs font-black bg-[#000080] text-white border-2 border-t-white border-l-white border-b-black border-r-black"
          >
            🎬 MINIATURE YOUTUBE
          </button>
        </div>
      )}

      {/* zone de texte avec fond noir absolu (#000000) et texte clair */}
      <div className="p-8 min-h-[600px] border-4 border-black bg-[#000000] text-white font-sans text-xl leading-relaxed tracking-wide">
        <EditorContent editor={editor} className="prose prose-invert max-w-none focus:outline-none min-h-[550px]" />
      </div>
    </div>
  )
}
