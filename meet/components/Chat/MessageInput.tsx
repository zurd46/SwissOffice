'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Send,
  Paperclip,
  Smile,
  Bold,
  Italic,
  Code,
  List,
  AtSign,
  Image,
  Film,
  X,
  CornerUpLeft,
} from 'lucide-react'
import { Tooltip } from '@/components/Shared/Tooltip'
import { EmojiPicker } from './EmojiPicker'
import { cn } from '@/lib/utils/cn'
import type { Message } from '@/lib/types'

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void
  replyTo?: Message | null
  onCancelReply?: () => void
  placeholder?: string
}

export function MessageInput({ onSend, replyTo, onCancelReply, placeholder }: MessageInputProps) {
  const [content, setContent] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(() => {
    if (!content.trim() && attachments.length === 0) return
    onSend(content, attachments)
    setContent('')
    setAttachments([])
    textareaRef.current?.focus()
  }, [content, attachments, onSend])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    setAttachments(prev => [...prev, ...files])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const insertFormatting = useCallback((prefix: string, suffix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const newContent = content.substring(0, start) + prefix + selected + suffix + content.substring(end)
    setContent(newContent)
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }, [content])

  const handleEmojiSelect = useCallback((emoji: string) => {
    setContent(prev => prev + emoji)
    setShowEmoji(false)
    textareaRef.current?.focus()
  }, [])

  return (
    <div className="border-t border-[#edebe9] bg-white">
      {/* Reply Preview */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#f5f5f5] border-b border-[#edebe9]">
          <CornerUpLeft size={14} className="text-[#605e5c] shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-[#0078d4]">{replyTo.senderName}</span>
            <p className="text-xs text-[#605e5c] truncate">{replyTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="p-1 rounded hover:bg-[#e1dfdd] text-[#605e5c]">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-4 py-2 overflow-x-auto">
          {attachments.map((file, index) => (
            <div key={index} className="relative flex items-center gap-2 px-3 py-2 bg-[#f5f5f5] rounded-lg border border-[#e1dfdd]">
              {file.type.startsWith('image/') ? (
                <Image size={14} className="text-[#0078d4]" />
              ) : file.type.startsWith('video/') ? (
                <Film size={14} className="text-[#0078d4]" />
              ) : (
                <Paperclip size={14} className="text-[#0078d4]" />
              )}
              <span className="text-xs text-[#242424] max-w-[120px] truncate">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="ml-1 p-0.5 rounded-full hover:bg-[#e1dfdd] text-[#605e5c]"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formatting Toolbar */}
      {showFormatting && (
        <div className="flex items-center gap-0.5 px-4 py-1 border-b border-[#edebe9]">
          <Tooltip content="Fett">
            <button onClick={() => insertFormatting('**', '**')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <Bold size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Kursiv">
            <button onClick={() => insertFormatting('*', '*')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <Italic size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Code">
            <button onClick={() => insertFormatting('`', '`')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <Code size={14} />
            </button>
          </Tooltip>
          <Tooltip content="Liste">
            <button onClick={() => insertFormatting('\n- ', '')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
              <List size={14} />
            </button>
          </Tooltip>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder ?? `Nachricht eingeben...`}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border border-[#e1dfdd] px-3 py-2 text-sm text-[#242424]',
                'placeholder-[#a19f9d] focus:border-[#0078d4] focus:outline-none',
                'min-h-[38px] max-h-[120px]'
              )}
              style={{ height: 'auto', overflowY: content.split('\n').length > 3 ? 'auto' : 'hidden' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 120) + 'px'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-0.5">
            <Tooltip content="Formatierung">
              <button
                onClick={() => setShowFormatting(!showFormatting)}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded transition-colors',
                  showFormatting ? 'bg-[#e8e6e4] text-[#242424]' : 'hover:bg-[#f3f2f1] text-[#605e5c]'
                )}
              >
                <Bold size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Datei anhängen">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]"
              >
                <Paperclip size={16} />
              </button>
            </Tooltip>
            <Tooltip content="Erwähnung">
              <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#f3f2f1] text-[#605e5c]">
                <AtSign size={16} />
              </button>
            </Tooltip>
            <div className="relative">
              <Tooltip content="Emoji">
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded transition-colors',
                    showEmoji ? 'bg-[#e8e6e4] text-[#242424]' : 'hover:bg-[#f3f2f1] text-[#605e5c]'
                  )}
                >
                  <Smile size={16} />
                </button>
              </Tooltip>
              {showEmoji && (
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmoji(false)}
                />
              )}
            </div>
            <Tooltip content="Senden">
              <button
                onClick={handleSend}
                disabled={!content.trim() && attachments.length === 0}
                className={cn(
                  'w-8 h-8 flex items-center justify-center rounded transition-colors',
                  content.trim() || attachments.length > 0
                    ? 'bg-[#0078d4] text-white hover:bg-[#106ebe]'
                    : 'text-[#a19f9d] cursor-not-allowed'
                )}
              >
                <Send size={16} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
      />
    </div>
  )
}
