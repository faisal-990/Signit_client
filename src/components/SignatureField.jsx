import React, { useState, useRef, forwardRef } from "react";
import Draggable from "react-draggable";

export const SIGNATURE_TYPE = "SIGNATURE";

const SignatureBox = forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));

function SignatureField({
  x,
  y,
  page,
  onDrop,
  style,
  name,
  fontFamily,
  fontWeight,
  onNameChange,
  children,
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(name || "");
  const nodeRef = useRef(null);

  const handleInputBlur = () => {
    setEditing(false);
    if (onNameChange) onNameChange(inputValue);
  };

  return (
    <Draggable
      position={{ x, y }}
      onStop={(e, data) => {
        if (onDrop) onDrop(null, { x: data.x, y: data.y });
      }}
      nodeRef={nodeRef}
    >
      <SignatureBox
        ref={nodeRef}
        className="absolute z-10 cursor-move hover:scale-105 transition-transform"
        style={{ left: 0, top: 0 }}
      >
        {/* ADDED: text-black to force contrast against the yellow background */}
        <div
          className="bg-yellow-300 border border-yellow-600 px-3 py-2 rounded shadow-md text-sm text-black"
          style={{ fontFamily, fontWeight }}
        >
          {style === "type" ? (
            editing ? (
              <input
                className="bg-yellow-100 border border-yellow-400 rounded px-1 text-black w-32"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleInputBlur}
                autoFocus
                style={{ fontFamily, fontWeight }}
              />
            ) : (
              <span
                onClick={() => setEditing(true)}
                className="whitespace-nowrap"
              >
                {inputValue || "Sign Here"}
              </span>
            )
          ) : (
            children || "Sign Here"
          )}
        </div>
      </SignatureBox>
    </Draggable>
  );
}

export default SignatureField;

