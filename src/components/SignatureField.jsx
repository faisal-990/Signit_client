import React, { useState, useRef, forwardRef } from 'react'
import Draggable from 'react-draggable'

export const SIGNATURE_TYPE = 'SIGNATURE'

const SignatureBox = forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));

function SignatureField({ x, y, page, onDrop, style, name, fontFamily, fontWeight, onNameChange, children }) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(name || '')
  const nodeRef = useRef(null)

  const handleInputBlur = () => {
    setEditing(false)
    if (onNameChange) onNameChange(inputValue)
  }

  return (
    <Draggable
      position={{ x, y }}
      onStop={(e, data) => {
        if (onDrop) onDrop(null, { x: data.x, y: data.y })
      }}
      nodeRef={nodeRef}
    >
      <SignatureBox
        ref={nodeRef}
        className="absolute z-10 cursor-move"
        style={{ left: 0, top: 0 }}
      >
        <div className="bg-yellow-300 border border-yellow-600 px-2 py-1 rounded shadow text-xs font-bold" style={{ fontFamily, fontWeight }}>
          {style === 'type' ? (
            editing ? (
              <input
                className="bg-yellow-100 border rounded px-1 text-xs font-bold"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onBlur={handleInputBlur}
                autoFocus
                style={{ fontFamily, fontWeight }}
              />
            ) : (
              <span onClick={() => setEditing(true)}>{inputValue || 'Sign Here'}</span>
            )
          ) : (
            children || 'Sign Here'
          )}
        </div>
      </SignatureBox>
    </Draggable>
  )
}

export default SignatureField 