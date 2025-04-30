import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import "./Notepad.css";

const MenuBar = ({ editor, onClear }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button
          className={`toolbar-button ${editor.isActive("bold") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          B
        </button>
        <button
          className={`toolbar-button ${editor.isActive("italic") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          I
        </button>
        <button
          className={`toolbar-button ${editor.isActive("underline") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          U
        </button>
        <div className="toolbar-divider"></div>
        <button
          className={`toolbar-button ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Heading 1"
        >
          H1
        </button>
        <button
          className={`toolbar-button ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
        >
          H2
        </button>
        <div className="toolbar-divider"></div>
        <button
          className={`toolbar-button ${editor.isActive("bulletList") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bulleted List"
        >
          • List
        </button>
        <button
          className={`toolbar-button ${editor.isActive("orderedList") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          1. List
        </button>
      </div>
      <div className="toolbar-right">
        <button
          className="macos-button close-button"
          onClick={onClear}
          title="Clear Clippy"
        ></button>
      </div>
    </div>
  );
};

const Notepad = () => {
  // Retrieve content from local storage
  const [savedContent, setSavedContent] = useState(() => {
    try {
      const saved = localStorage.getItem("clippy-content");
      return saved || "";
    } catch (error) {
      console.error("Error loading from localStorage:", error);
      return "";
    }
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Start typing...",
      }),
      Heading.configure({
        levels: [1, 2],
      }),
    ],
    content: savedContent,
    onUpdate: ({ editor }) => {
      try {
        const html = editor.getHTML();
        localStorage.setItem("clippy-content", html);
        setSavedContent(html);
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    },
    autofocus: true,
  });

  const clearNotepad = () => {
    if (editor) {
      editor.commands.clearContent();
      localStorage.removeItem("clippy-content");
      setSavedContent("");
    }
  };

  return (
    <div className="notepad-container">
      <div className="notepad-paper">
        <MenuBar editor={editor} onClear={clearNotepad} />
        <div className="editor-container">
          <EditorContent className="editor" editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default Notepad;
