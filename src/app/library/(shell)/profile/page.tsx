import ShimmerImage from '../../../../components/library/ShimmerImage'

const links = [
  { icon: 'download', label: 'Downloads' },
  { icon: 'history', label: 'History' },
  { icon: 'notifications', label: 'Notification settings' },
  { icon: 'palette', label: 'Reader appearance' },
  { icon: 'settings', label: 'Account settings' },
]

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <div className="noir-glass-panel mb-[48px] flex flex-col items-center gap-4 rounded-[0.75rem] border border-white/5 p-8 text-center">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-white/10 bg-noir-surface-container-lowest">
          <ShimmerImage
            alt="Your avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuApo6SmPVVvmvzneWUEUpidjuLfPbRr8MPZS27dTIruPho4zfAXNqng4MjBu5kDxif_JkdzwwVwYlFpUQn1FdU72XpSo8cDCp_ryDotJcsm6N4Tu1RNDmE9BDykeQoVcKmyxq02ZURmAcVIXnpBIdslkSLwpmAF6iZa3tEK4I5ZYWQ1vU2OSGb1W6JvcZ1w3L0UBccrIoCsFWNcHEbAHskB66Lc_ArI70XnpwznqcZsSHT0cS-kQNnJ6w"
          />
        </div>
        <div>
          <h1 className="font-noir-display text-[24px] font-bold text-noir-on-surface">Library Bookstore</h1>
          <p className="mt-1 font-noir-mono text-[12px] text-noir-primary-container">Premium Member</p>
          <p className="font-noir-mono text-[12px] text-noir-on-surface-variant">128 Titles Saved</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <button
            key={link.label}
            type="button"
            className="flex items-center gap-4 rounded-[0.5rem] border border-white/5 bg-noir-surface-container-low px-6 py-4 text-left font-noir-display text-[16px] text-noir-on-surface-variant transition-colors hover:bg-white/5 hover:text-noir-on-surface"
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            {link.label}
          </button>
        ))}
      </div>

      <p className="mt-[24px] text-center font-noir-mono text-[11px] text-noir-on-surface-variant/60">
        This is a design demo — none of these settings are wired up yet.
      </p>
    </div>
  )
}
