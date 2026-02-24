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
    <div className="flex items-end pl-3 electron-pl gap-[2px] bg-[#f3f3f3]">
      {RIBBON_TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            px-5 py-[7px] text-[13px] tracking-[0.01em] rounded-t transition-all duration-100 relative select-none
            ${activeTab === tab.id
              ? 'bg-white text-[#0078d4] font-semibold border-t-[2px] border-t-[#0078d4] border-x border-x-[#d2d0ce] border-b-0 -mb-px z-10'
              : 'text-[#616161] hover:text-[#323130] hover:bg-[#e8e8e8] border border-transparent'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
