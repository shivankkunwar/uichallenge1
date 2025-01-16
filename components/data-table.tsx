'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, Grid3X3, Filter, ArrowUpDown, Plus, ChevronRight, LinkIcon, Loader2, ChevronLeft, User, LayoutGrid, Settings, HelpCircle, Menu, Check, MoreVertical, ChevronDown, Copy, Trash2, Edit3, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Toggle } from '@/components/ui/toggle'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from '@/lib/utils'

interface Evaluation {
    id: number
    timestamp: string
    inputColumn: string
    actionColumn: string
    enrichCompany: {
        name: string
        status: 'loading' | 'complete' | 'error'
        description?: string
    }
    selected?: boolean
}

export default function DataTable() {
    const [view, setView] = useState<'1/1' | '3/3'>('1/1')
    const [searchQuery, setSearchQuery] = useState('')
    const [autoSave, setAutoSave] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [selectedRows, setSelectedRows] = useState<number[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [draggedRowId, setDraggedRowId] = useState<number | null>(null)
    const { toast } = useToast()
    const tableRef = useRef<HTMLDivElement>(null)

    const [demoData, setDemoData] = useState<Evaluation[]>([
        {
            id: 1,
            timestamp: 'Oct 12, 2024 at 14:08 PM',
            inputColumn: 'Bitscale Evaluation - Account relevancy',
            actionColumn: 'Bitscale Evaluation - Account relevancy',
            enrichCompany: { 
                name: 'Bitscale', 
                status: 'complete',
                description: 'Tech company specializing in blockchain solutions'
            }
        },
        {
            id: 2,
            timestamp: 'Oct 12, 2024 at 14:08 PM',
            inputColumn: 'cell data size exceeds limit',
            actionColumn: 'BMW Evaluation - Relevancy check',
            enrichCompany: { 
                name: 'BMW', 
                status: 'error',
                description: 'Luxury automobile manufacturer'
            }
        },
        {
            id: 3,
            timestamp: 'Oct 12, 2024 at 14:08 PM',
            inputColumn: 'https://www.linkedin.com/bai5...',
            actionColumn: 'Google Evaluation - Lifespan',
            enrichCompany: { 
                name: 'Google', 
                status: 'complete',
                description: 'Global technology company'
            }
        },
        {
            id: 4,
            timestamp: 'Oct 12, 2024 at 14:08 PM',
            inputColumn: 'Loading data, Please wait',
            actionColumn: 'Apple Evaluation - Olvancy check',
            enrichCompany: { 
                name: 'Apple', 
                status: 'loading',
                description: 'Consumer electronics company'
            }
        },
        {
            id: 5,
            timestamp: 'Oct 12, 2024 at 14:08 PM',
            inputColumn: 'Loading data, Please wait',
            actionColumn: 'Figma Evaluation - Evancy check',
            enrichCompany: { 
        name: 'Figma', 
        status: 'loading',
        description: 'Design platform for teams'
      }
    },
  ])

  const handleRowSelect = useCallback((id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }, [])

  const handleBulkAction = useCallback((action: string) => {
    switch (action) {
      case 'Delete':
        setDemoData(prev => prev.filter(row => !selectedRows.includes(row.id)))
        break
      case 'Export':
        const selectedData = demoData.filter(row => selectedRows.includes(row.id))
        console.log('Exporting:', selectedData)
        break
      case 'Copy':
        const newRows = selectedRows.map(id => {
          const row = demoData.find(r => r.id === id)
          return { ...row!, id: Date.now() + Math.random() }
        })
        setDemoData(prev => [...prev, ...newRows])
        break
    }
    
    toast({
      title: "Bulk Action",
      description: `${action} applied to ${selectedRows.length} rows`,
    })
    setSelectedRows([])
  }, [selectedRows, demoData, toast])

  const handleAutoSave = useCallback((enabled: boolean) => {
    setAutoSave(enabled)
    toast({
      title: enabled ? "Auto Save Enabled" : "Auto Save Disabled",
      description: enabled 
        ? "Changes will be saved automatically" 
        : "Remember to save your changes manually",
    })
  }, [toast])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        setSelectedRows(selectedRows.length === demoData.length 
          ? [] 
          : demoData.map(row => row.id)
        )
      }
      if (e.key === 'Escape') {
        setSelectedRows([])
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [demoData.length, selectedRows])

  // Drag and drop functionality
  const handleDragStart = (e: React.DragEvent, rowId: number) => {
    setIsDragging(true)
    setDraggedRowId(rowId)
    e.currentTarget.classList.add('opacity-50')
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    setDraggedRowId(null)
    e.currentTarget.classList.remove('opacity-50')
  }

  const handleDragOver = (e: React.DragEvent, targetRowId: number) => {
    e.preventDefault()
    if (draggedRowId === null || draggedRowId === targetRowId) return

    const draggedRowIndex = demoData.findIndex(row => row.id === draggedRowId)
    const targetRowIndex = demoData.findIndex(row => row.id === targetRowId)
    
    if (draggedRowIndex !== -1 && targetRowIndex !== -1) {
      const newData = [...demoData]
      const [draggedRow] = newData.splice(draggedRowIndex, 1)
      newData.splice(targetRowIndex, 0, draggedRow)
      setDemoData(newData)
    }
  }

  const handleCopyRow = useCallback((row: Evaluation) => {
    const newRow = { ...row, id: Date.now() }
    setDemoData(prev => [...prev, newRow])
    toast({
      title: "Row Copied",
      description: "A new copy has been created",
    })
  }, [toast])

  const handleDeleteRow = useCallback((id: number) => {
    setDemoData(prev => prev.filter(row => row.id !== id))
    toast({
      title: "Row Deleted",
      description: "The row has been removed",
      variant: "destructive",
    })
  }, [toast])

  // Performance optimization for search
  const filteredData = demoData.filter(row => 
    row.inputColumn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.actionColumn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    row.enrichCompany.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="border-b">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">Name of the file</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Auto Save</span>
              <Toggle 
                pressed={autoSave} 
                onPressedChange={(enabled) => {
                  handleAutoSave(enabled)
                }}
                className="h-6 w-11 bg-zinc-200 data-[state=on]:bg-emerald-500 rounded-full relative px-0.5 transition-colors"
              >
                <div className="absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 left-0.5 top-0.5 data-[state=on]:translate-x-5" />
              </Toggle>
            </div>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">User Profile</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your account settings and preferences
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-3.5rem)]">
        {/* Desktop Sidebar */}
        <aside className="border-r w-12 hidden md:flex flex-col items-center py-4 gap-4">
          <TooltipProvider>
            {[
              { icon: LayoutGrid, label: "Dashboard" },
              { icon: Settings, label: "Settings" },
              { icon: HelpCircle, label: "Help" }
            ].map(({ icon: Icon, label }) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="transition-colors hover:bg-accent">
                    <Icon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="w-64">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-4">
              {[
                { icon: LayoutGrid, label: "Dashboard" },
                { icon: Settings, label: "Settings" },
                { icon: HelpCircle, label: "Help" }
              ].map(({ icon: Icon, label }) => (
                <Button key={label} variant="ghost" className="justify-start" onClick={() => setIsSidebarOpen(false)}>
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="flex flex-col gap-4 max-w-[1200px] mx-auto h-full">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between sticky top-0 bg-background z-10 pb-2 transition-all duration-200">
              <div className="relative w-full lg:w-64 group">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search in all columns..."
                  className="pl-8 transition-all focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="group">
                      <Grid3X3 className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                      {view} Row
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setView('1/1')}>1/1 Row</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setView('3/3')}>3/3 Column</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" size="sm" className="hidden sm:flex group">
                  3/3 Column
                </Button>
                <Button variant="outline" size="sm" className="group">
                  <Filter className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  0 Filter
                </Button>
                <Button variant="outline" size="sm" className="group">
                  <ArrowUpDown className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                  Sort
                </Button>
                <Button variant="secondary" size="sm" className="group">
                  Enrich
                </Button>
                {selectedRows.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="default" size="sm" className="animate-in fade-in slide-in-from-left-5">
                        Actions ({selectedRows.length})
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleBulkAction('Copy')}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Selected
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('Export')}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Export Selected
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleBulkAction('Delete')}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Table */}
            <div 
              ref={tableRef}
              className="border rounded-lg overflow-auto flex-1 transition-all"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedRows(
                                selectedRows.length === demoData.length 
                                  ? [] 
                                  : demoData.map(row => row.id)
                              )}
                              className="transition-colors"
                            >
                              {selectedRows.length === demoData.length ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{selectedRows.length === demoData.length ? 'Deselect' : 'Select'} All Rows</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="bg-yellow-50/80 min-w-[200px] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-yellow-600">A</span>
                        Input Column
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">⊕</span>
                        Action column
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[200px]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500">★</span>
                          Enrich Company
                        </div>
                        <Button variant="ghost" size="sm" className="group">
                          <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                          Add Column
                        </Button>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow 
                      key={row.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, row.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, row.id)}
                      className={cn(
                        selectedRows.includes(row.id) ? 'bg-muted/50' : '',
                        'transition-colors hover:bg-accent/5 cursor-pointer select-none',
                        isDragging && 'cursor-move'
                      )}
                    >
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRowSelect(row.id)}
                          className="transition-colors hover:bg-accent"
                        >
                          {selectedRows.includes(row.id) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {row.inputColumn.startsWith('http') ? (
                              <div className="flex items-center gap-2 text-blue-600 group cursor-pointer">
                                <LinkIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                                <span className="group-hover:underline">{row.inputColumn}</span>
                              </div>
                            ) : row.inputColumn.includes('Loading') ? (
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
                                <Skeleton className="h-4 w-32 animate-pulse" />
                              </div>
                            ) : (
                              row.inputColumn
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuItem onClick={() => toast({ title: "Edit Row", description: "Editing functionality coming soon" })}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyRow(row)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteRow(row.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                      <TableCell>{row.actionColumn}</TableCell>
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger asChild>
                            <div className="flex items-center gap-2 cursor-pointer">
                              {row.enrichCompany.status === 'loading' ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : row.enrichCompany.status === 'error' ? (
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                              ) : (
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                              )}
                              {row.enrichCompany.name}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="flex justify-between space-x-4">
                              <div>
                                <h4 className="text-sm font-semibold">{row.enrichCompany.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {row.enrichCompany.description}
                                </p>
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Add Row Button */}
            <Button 
              variant="outline" 
              className="w-full group hover:border-primary transition-colors"
              onClick={() => {
                const newRow: Evaluation = {
                  id: Date.now(),
                  timestamp: new Date().toLocaleString(),
                  inputColumn: 'New Entry',
                  actionColumn: 'Pending Action',
                  enrichCompany: {
                    name: 'Pending',
                    status: 'loading',
                    description: 'New company entry'
                  }
                }
                setDemoData(prev => [...prev, newRow])
                toast({
                  title: "Row Added",
                  description: "New row has been added to the table",
                })
              }}
            >
              <Plus className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
              Add Row
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { default as DataTable } from '@/components/data-table'

