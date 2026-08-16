import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { Mark, markInputRule, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import "./Notepad.css";

const DEFAULT_FONT_SIZE = 16;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;
const FONT_SIZE_STEP = 2;

const markdownLinkInputRegex =
  /(?=\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)$)\[([^\]\n]+)\]\(https?:\/\/[^\s)]+\)$/;

const MarkdownLink = Mark.create({
  name: "markdownLink",
  priority: 1000,
  inclusive: false,

  addAttributes() {
    return {
      href: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: "a[href]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "a",
      mergeAttributes(HTMLAttributes, {
        target: "_blank",
        rel: "noopener noreferrer",
      }),
      0,
    ];
  },

  addInputRules() {
    return [
      markInputRule({
        find: markdownLinkInputRegex,
        type: this.type,
        getAttributes: (match) => ({ href: match[2] }),
      }),
    ];
  },
});

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

const MenuBar = ({
  editor,
  fontSize,
  onDecreaseFontSize,
  onIncreaseFontSize,
  onClear,
}) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("markdownLink").href || "https://";
    const enteredUrl = window.prompt("Enter a link URL", previousUrl);

    if (enteredUrl === null) return;

    const url = enteredUrl.trim();

    if (!url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("markdownLink")
        .unsetMark("markdownLink")
        .run();
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    try {
      const parsedUrl = new URL(normalizedUrl);

      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      window.alert("Please enter a valid http or https URL.");
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("markdownLink")
      .setMark("markdownLink", { href: normalizedUrl })
      .run();
  };

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button
          type="button"
          className={`toolbar-button ${editor.isActive("bold") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
          aria-label="Bold"
        >
          B
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive("italic") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          aria-label="Italic"
        >
          I
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive("underline") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
          aria-label="Underline"
        >
          U
        </button>
        <div className="toolbar-divider"></div>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          title="Heading 1"
          aria-label="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          title="Heading 2"
          aria-label="Heading 2"
        >
          H2
        </button>
        <div className="toolbar-divider"></div>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive("bulletList") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bulleted List"
          aria-label="Bulleted list"
        >
          • List
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive("orderedList") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
          aria-label="Numbered list"
        >
          1. List
        </button>
        <div className="toolbar-divider"></div>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive("code") ? "active" : ""}`}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline code (or wrap text in backticks)"
          aria-label="Inline code"
        >
          {"< >"}
        </button>
        <button
          type="button"
          className={`toolbar-button ${editor.isActive("markdownLink") ? "active" : ""}`}
          onClick={setLink}
          title="Link (or type [title](https://example.com))"
          aria-label="Add or edit link"
        >
          🔗
        </button>
        <div className="toolbar-divider"></div>
        <div className="font-size-controls" aria-label="Font size controls">
          <button
            type="button"
            className="toolbar-button font-size-button"
            onClick={onDecreaseFontSize}
            disabled={fontSize === MIN_FONT_SIZE}
            title="Decrease font size"
            aria-label="Decrease font size"
          >
            A−
          </button>
          <button
            type="button"
            className="toolbar-button font-size-button"
            onClick={onIncreaseFontSize}
            disabled={fontSize === MAX_FONT_SIZE}
            title="Increase font size"
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>
      </div>
      <div className="toolbar-right">
        <button
          type="button"
          className="macos-button close-button"
          onClick={onClear}
          title="Clear Clippy"
          aria-label="Clear Clippy"
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
  const [fontSize, setFontSize] = useState(() => {
    try {
      const storedSize = Number(localStorage.getItem("clippy-font-size"));
      return storedSize >= MIN_FONT_SIZE && storedSize <= MAX_FONT_SIZE
        ? storedSize
        : DEFAULT_FONT_SIZE;
    } catch (error) {
      console.error("Error loading font size from localStorage:", error);
      return DEFAULT_FONT_SIZE;
    }
  });

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
  const debouncedSave = useMemo(
    () =>
      debounce((html) => {
        saveToLocalStorage(html);
      }, 1000),
    [saveToLocalStorage],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        link: false,
        underline: false,
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
      MarkdownLink,
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
    },
  });

  const changeFontSize = (amount) => {
    setFontSize((currentSize) => {
      const nextSize = Math.min(
        MAX_FONT_SIZE,
        Math.max(MIN_FONT_SIZE, currentSize + amount),
      );

      try {
        localStorage.setItem("clippy-font-size", String(nextSize));
      } catch (error) {
        console.error("Error saving font size to localStorage:", error);
      }

      return nextSize;
    });
  };

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
        <MenuBar
          editor={editor}
          fontSize={fontSize}
          onDecreaseFontSize={() => changeFontSize(-FONT_SIZE_STEP)}
          onIncreaseFontSize={() => changeFontSize(FONT_SIZE_STEP)}
          onClear={clearNotepad}
        />
        <div className="editor-container">
          <EditorContent
            className="editor"
            editor={editor}
            style={{ "--editor-font-size": `${fontSize}px` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notepad;
