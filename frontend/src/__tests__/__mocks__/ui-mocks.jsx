import React from 'react'
import { vi } from 'vitest'

vi.mock('../../components/ui/dialog', () => ({
  Dialog: ({ children, open }) => open ? children : null,
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
  DialogFooter: ({ children }) => <div data-testid="dialog-footer">{children}</div>
}))

vi.mock('../../components/ui/select', () => ({
  Select: ({ children, value, onValueChange }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ value, children }) => (
    <option value={value}>{children}</option>
  )
}))

vi.mock('../../components/ui/button', () => ({
  Button: ({ children, onClick, type, variant }) => (
    <button 
      type={type} 
      onClick={onClick}
      role="button"
      data-variant={variant}
    >
      {children}
    </button>
  )
}))

vi.mock('../../components/ui/input', () => ({
  Input: React.forwardRef((props, ref) => (
    <input {...props} ref={ref} />
  ))
}))

vi.mock('../../components/ui/label', () => ({
  Label: ({ children, htmlFor }) => (
    <label htmlFor={htmlFor}>{children}</label>
  )
}))

vi.mock('../../components/ui/textarea', () => ({
  Textarea: React.forwardRef((props, ref) => (
    <textarea {...props} ref={ref} />
  ))
}))

vi.mock('../../components/ui/toaster', () => ({
  Toaster: () => null,
  useToast: () => ({
    toast: vi.fn()
  })
})) 