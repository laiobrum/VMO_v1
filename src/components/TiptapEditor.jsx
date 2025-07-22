import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import './TiptapEditor.css'
import { Color, TextStyle } from "@tiptap/extension-text-style"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import { MdOutlineFormatListBulleted } from "react-icons/md";
import { HiMiniNumberedList } from "react-icons/hi2";



const TiptapEditor = ({ onSubmit }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure ({
                bulletList: false,
                orderedList: false,
            }),
            TextStyle,
            Color,
            BulletList,
            OrderedList,
            ListItem,
        ],
        content: '',
    })

    const handleSubmit = () => {
        const html = editor?.getHTML()
        if(html && html !== '<p></p>') {
            onSubmit(html)
        }
    }

    return (
        <div className="editor-container">
            <div className="txtBoxContainer">
                <EditorContent editor={editor} />
            </div>
            <div className="btnTxtContainer">
                <div className="editor-controls">
                    <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <MdOutlineFormatListBulleted />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                        <HiMiniNumberedList />
                    </button>
                    <input
                        type="color"
                        onChange={(e) =>
                        editor.chain().focus().setColor(e.target.value).run()
                        }
                        title="Escolher cor do texto"
                    />
                </div>
             <button onClick={handleSubmit} className="btnTxt">Inserir</button>
            </div>
        </div>
    )
}

export default TiptapEditor