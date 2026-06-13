import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { MessageSquare, X, ChevronLeft, Send } from 'lucide-react'
import { chatApi } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import type { ChatContact, ChatMessage } from '@/types'

export default function ChatWidget() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Only show for specific roles
  const allowedRoles = ['admin', 'incident_manager', 'risk_analyst']
  if (!user || !allowedRoles.includes(user.role)) return null

  // Fetch contacts
  const { data: contactsResponse } = useQuery({
    queryKey: ['chatContacts'],
    queryFn: () => chatApi.getContacts(),
    refetchInterval: isOpen && !activeContact ? 5000 : 15000,
  })
  const contacts = contactsResponse?.data?.data || []
  
  // Total unread count for badge
  const totalUnread = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0)

  // Fetch messages for active contact
  const { data: messagesResponse } = useQuery({
    queryKey: ['chatMessages', activeContact?.id],
    queryFn: () => activeContact ? chatApi.getMessages(activeContact.id) : null,
    enabled: !!activeContact,
    refetchInterval: isOpen && activeContact ? 3000 : false,
  })
  const messages = messagesResponse?.data?.data || []

  // Mark as read when opening a conversation
  useEffect(() => {
    if (activeContact && isOpen) {
      chatApi.markAsRead(activeContact.id).then(() => {
        queryClient.invalidateQueries({ queryKey: ['chatContacts'] })
      })
    }
  }, [activeContact, isOpen, queryClient])

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(activeContact!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatMessages', activeContact?.id] })
      setMessage('')
    }
  })

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeContact) return
    sendMutation.mutate(message.trim())
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Popover */}
      {isOpen && (
        <div className="mb-4 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '400px' }}>
          
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeContact ? (
                <button onClick={() => setActiveContact(null)} className="hover:bg-primary/80 p-1 rounded transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
              <h3 className="font-medium">
                {activeContact ? activeContact.name : 'Messages'}
              </h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary/80 p-1 rounded transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto bg-muted/20">
            {!activeContact ? (
              // Contacts List
              <div className="divide-y divide-border">
                {contacts.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No contacts available.
                  </div>
                ) : (
                  contacts.map(contact => (
                    <div 
                      key={contact.id} 
                      onClick={() => setActiveContact(contact)}
                      className="p-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{contact.role.replace('_', ' ')}</p>
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              // Messages View
              <div className="p-4 space-y-3 flex flex-col justify-end min-h-full">
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground pb-4">
                    No messages yet. Say hi!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.senderId === user.id
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div 
                          className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                            isMe 
                              ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                              : 'bg-muted text-foreground rounded-tl-sm border border-border'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Footer Input */}
          {activeContact && (
            <div className="p-3 bg-card border-t border-border">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 text-sm bg-muted/50 border border-border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button 
                  type="submit" 
                  disabled={!message.trim() || sendMutation.isPending}
                  className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all relative group flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-card">
            {totalUnread > 9 ? '9+' : totalUnread}
          </span>
        )}
      </button>
    </div>
  )
}
