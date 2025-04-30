import { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import "./Notepad.css";

// Utility function for debouncing
const debounce = (fn, delay) => {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

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
  const [currentContent, setCurrentContent] = useState(savedContent);

  // Create a ref to store the latest editor content
  const contentRef = useRef(currentContent);

  // Save function
  const saveToLocalStorage = useCallback((html) => {
    try {
      localStorage.setItem("clippy-content", html);
      setSavedContent(html);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, []);

  // Debounced save function - only saves after 1 second of inactivity
  const debouncedSave = useCallback(
    debounce((html) => {
      saveToLocalStorage(html);
    }, 1000),
    [saveToLocalStorage],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable history as it can cause performance issues with large documents
        history: {
          depth: 100, // Reduce history stack depth
          newGroupDelay: 500, // Increase delay for grouping history events
        },
      }),
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
      const html = editor.getHTML();
      contentRef.current = html; // Update the ref with latest content
      setCurrentContent(html);
      debouncedSave(html);
    },
    autofocus: true,
    // Add performance optimization settings
    enableInputRules: true,
    enablePasteRules: false, // Disable paste rules which can be expensive
    // Reduce amount of updates
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none",
      },
      handleDOMEvents: {
        keydown: (_view, event) => {
          // Allow default handling
          return false;
        },
      },
    },
  });

  // Effect to handle tab/window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save the latest content directly without debouncing when closing
      saveToLocalStorage(contentRef.current);
    };

    // Add event listeners for tab/window close
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Save content on component unmount as well
      saveToLocalStorage(contentRef.current);
    };
  }, [saveToLocalStorage]);

  const clearNotepad = () => {
    if (editor) {
      editor.commands.clearContent();
      localStorage.removeItem("clippy-content");
      setSavedContent("");
      setCurrentContent("");
      contentRef.current = "";
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
