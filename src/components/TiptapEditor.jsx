import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import './TiptapEditor.css'
import { Color, TextStyle } from "@tiptap/extension-text-style"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import ListItem from "@tiptap/extension-list-item"
import { MdFormatColorText, MdOutlineFormatListBulleted } from "react-icons/md";
import { HiMiniNumberedList } from "react-icons/hi2";
import { useEffect, useRef, useState } from "react"
import { BlockPicker, CirclePicker } from "react-color"

const TiptapEditor = ({ onSubmit }) => {
    const [selectedColor, setSelectedColor] = useState('#000000')
    const [showColorPicker, setShowColorPicker] = useState(false)

    const editor = useEditor({
        extensions: [
        StarterKit,
        TextStyle,
        Color,
        ],
        content: '',
    })

    const editorRef = useRef()
    const colorPickerRef = useRef()

    //Fecha o editor ao clicar fora
    useEffect(() => {
    function handleClickOutside(event) {
        if (editorRef.current && !editorRef.current.contains(event.target)) {
        onSubmit(null)  // ou apenas uma função para fechar o editor
        }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
        document.removeEventListener("mousedown", handleClickOutside)
    }
    }, [editor])

    useEffect(() => {
        function handleClickInsideEditor(event) {
            if (
            editorRef.current &&
            editorRef.current.contains(event.target) &&
            colorPickerRef.current &&
            !colorPickerRef.current.contains(event.target)
            ) {
            setShowColorPicker(false)
            }
        }

        if (showColorPicker) {
            document.addEventListener("mousedown", handleClickInsideEditor)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickInsideEditor)
        }
        }, [showColorPicker])

    const handleColorChange = (color) => {
        setSelectedColor(color.hex)
        editor.chain().focus().setColor(color.hex).run()
        setShowColorPicker(false) // fecha o picker
    }

    const handleSubmit = () => {
        const html = editor?.getHTML()
        const isEmpty = !html || html === '<p></p>' || html.trim() === '<p><br></p>'
        if (isEmpty) {
            onSubmit(null)  // apenas fecha, sem criar div alguma
            return
        }
        onSubmit(html)  // só envia o comentário se não for vazio
    }

    return (
        <div className="editor-container" ref={editorRef}>
            <div className="txtBoxContainer">
                <EditorContent editor={editor} />
            </div>
            <div className="btnTxtContainer">
                <div className="editor-controls">
                    <button className="editorBtn" onClick={() => editor.chain().focus().toggleBulletList().run()}>
                        <MdOutlineFormatListBulleted />
                    </button>
                    <button className="editorBtn" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                        <HiMiniNumberedList />
                    </button>
                    <div className="color-picker-wrapper">
                        <button className="colorBtn" onClick={() => setShowColorPicker(prev => !prev)} title="Cor do texto">
                            <MdFormatColorText />
                        </button>
                        {showColorPicker && (
                            <div ref={colorPickerRef} className="color-picker-popover">
                            <CirclePicker
                                color={selectedColor}
                                colors={[
                                '#000000', '#0059ffff', '#ff0400ff', '#ec407a', '#43a047', '#00bcd4',
                                '#fbc02d', '#9c27b0', '#5c6bc0', '#ff9800', '#00897b', '#616161'
                                ]}
                                onChangeComplete={handleColorChange}
                                triangle="hide"
                            />
                            </div>
                        )}
                    </div>

                </div>
             <button onClick={handleSubmit} className="btnTxt">Inserir</button>
            </div>
        </div>
    )
}

export default TiptapEditor