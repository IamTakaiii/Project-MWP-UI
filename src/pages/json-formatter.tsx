import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, FileJson, GitCompare, Search, List, TreePine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JsonInput } from '@/components/json-input'
import { JsonViewer } from '@/components/json-viewer'
import { JsonTreeView } from '@/components/json-tree-view'
import { ActionButtons } from '@/components/action-buttons'
import { DiffOutput } from '@/components/diff-output'
import { useJsonFormatter } from '@/hooks/use-json-formatter'

type FormatterMode = 'format' | 'diff' | 'query'

interface ModeTab {
  id: FormatterMode
  label: string
  icon: React.ReactNode
}

const modeTabs: ModeTab[] = [
  { id: 'format', label: 'Format', icon: <FileJson className="w-4 h-4" /> },
  { id: 'diff', label: 'Diff', icon: <GitCompare className="w-4 h-4" /> },
  { id: 'query', label: 'Query', icon: <Search className="w-4 h-4" /> },
]

export function JsonFormatterPage() {
  const [viewMode, setViewMode] = useState<'text' | 'tree'>('text')
  const [queryViewMode, setQueryViewMode] = useState<'text' | 'tree'>('tree')
  const {
    mode,
    setMode,
    input,
    setInput,
    output,
    error,
    isValid,
    parsedJson,
    prettify,
    minify,
    clear,
    loadSample,
    copyToClipboard,
    downloadJson,
    isCopied,
    queryPath,
    setQueryPath,
    queryResult,
    queryError,
    executeQuery,
    leftInput,
    setLeftInput,
    rightInput,
    setRightInput,
    leftError,
    rightError,
    diffResults,
  } = useJsonFormatter()

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
              <FileJson className="w-5 h-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              JSON Formatter
            </h1>
          </div>
        </header>

        {/* Mode Selector Tabs */}
        <div className="bg-card border border-border rounded-2xl p-1 mb-6 inline-flex">
          {modeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                transition-all duration-200
                ${mode === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          {/* Format Mode */}
          {mode === 'format' && (
            <div className="space-y-6">
              {/* Action Buttons */}
              <ActionButtons
                onPrettify={prettify}
                onMinify={minify}
                onCopy={copyToClipboard}
                onDownload={downloadJson}
                onClear={clear}
                onLoadSample={loadSample}
                disabled={!isValid}
                hasOutput={!!output}
                isCopied={isCopied}
              />

              {/* Input and Output Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Area */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Input JSON
                    </label>
                    {/* Empty space to match Output's toggle height */}
                    <div className="h-[34px]"></div>
                  </div>
                  <JsonInput
                    value={input}
                    onChange={setInput}
                    error={error}
                    placeholder="วาง JSON ที่นี่..."
                    enableHighlight={true}
                  />
                </div>

                {/* Output Area */}
                <div className="space-y-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Output
                    </label>
                    
                    {/* Tree View Toggle */}
                    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('text')}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium
                          transition-all duration-200
                          ${viewMode === 'text'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        <List className="w-3.5 h-3.5" />
                        Text
                      </button>
                      <button
                        onClick={() => setViewMode('tree')}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium
                          transition-all duration-200
                          ${viewMode === 'tree'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                          }
                        `}
                      >
                        <TreePine className="w-3.5 h-3.5" />
                        Tree
                      </button>
                    </div>
                  </div>

                  {/* Output Display */}
                  {viewMode === 'text' ? (
                    <JsonViewer
                      value={output}
                      placeholder="ผลลัพธ์จะแสดงที่นี่..."
                    />
                  ) : (
                    <JsonTreeView
                      data={parsedJson}
                      onPathClick={(path) => {
                        // Copy path to clipboard
                        navigator.clipboard.writeText(path)
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Diff Mode */}
          {mode === 'diff' && (
            <div className="space-y-6">
              {/* Two Input Areas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    JSON ซ้าย
                  </label>
                  <JsonInput
                    value={leftInput}
                    onChange={setLeftInput}
                    error={leftError}
                    placeholder="วาง JSON ชุดแรก..."
                  />
                </div>

                {/* Right Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    JSON ขวา
                  </label>
                  <JsonInput
                    value={rightInput}
                    onChange={setRightInput}
                    error={rightError}
                    placeholder="วาง JSON ชุดที่สอง..."
                  />
                </div>
              </div>

              {/* Diff Output */}
              {(leftInput && rightInput) && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ความแตกต่าง
                  </label>
                  <DiffOutput results={diffResults} />
                </div>
              )}
            </div>
          )}

          {/* Query Mode */}
          {mode === 'query' && (
            <div className="space-y-6">
              {/* JSON Input with View Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Input JSON
                  </label>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                    <button
                      onClick={() => setQueryViewMode('text')}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium
                        transition-all duration-200
                        ${queryViewMode === 'text'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <List className="w-3.5 h-3.5" />
                      Text
                    </button>
                    <button
                      onClick={() => setQueryViewMode('tree')}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium
                        transition-all duration-200
                        ${queryViewMode === 'tree'
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <TreePine className="w-3.5 h-3.5" />
                      Tree
                    </button>
                  </div>
                </div>

                {/* Input Display */}
                {queryViewMode === 'text' ? (
                  <JsonInput
                    value={input}
                    onChange={setInput}
                    error={error}
                    placeholder="วาง JSON ที่นี่..."
                  />
                ) : (
                  <JsonTreeView
                    data={parsedJson}
                    onPathClick={(path) => {
                      navigator.clipboard.writeText(path)
                    }}
                  />
                )}
              </div>

              {/* JSONPath Input with Execute Button */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  JSONPath Query
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={queryPath}
                    onChange={(e) => setQueryPath(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        executeQuery()
                      }
                    }}
                    className="flex-1 p-3 bg-muted/30 border border-border rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    placeholder="$.store.book[0].title"
                  />
                  <Button
                    onClick={executeQuery}
                    disabled={!isValid || !queryPath.trim()}
                    className="px-6"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Query
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ตัวอย่าง: $.users[0].name, $.config.indentSize, $.features[*]
                </p>
              </div>

              {/* Query Result */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-foreground pb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  ผลลัพธ์
                </label>
                
                {queryError && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {queryError}
                    </p>
                  </div>
                )}
                
                {!queryError && queryResult !== null && (
                  <JsonTreeView
                    data={queryResult}
                    onPathClick={(path) => {
                      navigator.clipboard.writeText(path)
                    }}
                  />
                )}
                
                {!queryError && queryResult === null && !queryPath && (
                  <div className="p-4 bg-muted/30 border border-border rounded-xl h-32 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">
                      ใส่ JSONPath query และกด Enter หรือคลิกปุ่ม Query
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
