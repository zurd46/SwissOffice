'use client'

const RIBBON_TABS = [
  { id: 'start', label: 'Start' },
  { id: 'einfuegen', label: 'Einfügen' },
  { id: 'seitenlayout', label: 'Seitenlayout' },
  { id: 'ansicht', label: 'Ansicht' },
]

interface RibbonTabStripProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function RibbonTabStrip({ activeTab, onTabChange }: RibbonTabStripProps) {
  return (
    <div className="flex items-end px-4 pt-0.5 bg-[#f3f3f3] gap-0.5">
      {RIBBON_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-4 py-1.5 text-sm rounded-t-[3px] transition-colors duration-150 relative
            ${activeTab === tab.id
              ? 'bg-white text-blue-700 font-medium border border-gray-300 border-b-white -mb-px z-10'
              : 'text-gray-600 hover:bg-white/60 border border-transparent'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
