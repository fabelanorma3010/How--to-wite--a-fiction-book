import type { Metadata } from 'next'
import Link from 'next/link'
import ShimmerNextImage from '../../../../components/ShimmerNextImage'

export const metadata: Metadata = { title: 'Updates' }

const updates = [
  {
    title: 'Neon Ascendant: Protocol Zero',
    update: 'Chapter 142 — "The Architect\'s Fall" just dropped',
    when: '1 hour ago',
    isNew: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA44t8f7WDYU30gO3u69bvfgVCzx2IbP3pmSJMJ5LLOXHwPf3Qs2oSHuFjohMvgCAVxR99KZWpwCXLKArzTFBjJ0cuGRsYffez_T3bjdq_Drzmr5VnoWpqYYpDGvHL682rc_8j9AfLLdmnfk1DoDf1l6LxjCPoqEqDynDw-AXKl8X9TNLKl_a5SlkVCKqqUp73GnRiGVfsd4wiDkTYn-chFJ3T6PHg30nF21jQ-Hc6rv6eQ_CgdDyonpw',
  },
  {
    title: 'Neon Abyss: The Silent Echo',
    update: 'Chapter 42 — "The Fractured Reflection" is out',
    when: 'Today',
    isNew: true,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKSB8tP5aZnx5NlX6wTLl17a9ApmzVSRiTRK3Tlm65LM8wP9oeP5NUQiW6iKgUTI_lW9NcV97l7L124HjyVFiOrvOWqWqsPjgIOd9WIq5rTK2LKqQf6NMrYOqUV_FgMNgYhhWsx8_JV2ARu_wqb42Xif9Na9wOuMINwZwG8gLqcR6wKqq_FdxCut8ngoy3geg-2dDblG7k-VM_1ZEaknuKa1jvvc82jbxf2q04fS3jla8v25zbvFNhuQ',
  },
  {
    title: 'Shadow Walkers',
    update: 'A new chapter is in the works — no date yet',
    when: '2 days ago',
    isNew: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkTZ-UkXzId53OoPqQl9mIrV8XwEjq7zDEhMyHRc0GL0lIirY5qrsvNfgUYnW4asK326bIT7v_lRb7kO8RBl_6u6s50NKkQMvryFlbcafKS2rbr9wgyVp82QGfSfFEYsf9edfTRoEisNmrHzUbfa056aEgccqRd06vsiZODekWIMX53UmCzlWz5CV9zQ9gIDDucAVsBEefiDrB6eBO6JDdpbLt-GEuQdCWGaf4pXmwxha0rBPrS8xwxw',
  },
  {
    title: 'Void Fragments',
    update: 'Back from hiatus — new chapters resuming next week',
    when: '5 days ago',
    isNew: false,
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChcas8OVp_fLn6JCFdOlKDjyPz44oMAM1QfWgoeY_kqk1Ysf_K2wtvfRtUz4Fj8-0SZOa-aN31RSx0AQHfLOOBR4vMlZK81sNd6DKm6OYzTLwJl43QUvN35THvXcPRIbT3-fTFdeNprVGE80UZQjNS-dU89B4V_SjhroxB-JGNMiNzmbk11U0646rro_Rx-rFpDBfHHWWQs-yN2VJCFd4XHx0BEiPEiY9cmvtPoQGPekvoTJIj-pP0Rw',
  },
]

export default function UpdatesPage() {
  return (
    <div className="mx-auto max-w-3xl px-[16px] py-[24px] md:px-[32px] md:py-[48px]">
      <h1 className="mb-[24px] font-noir-display text-[28px] font-bold text-noir-on-surface md:text-[48px]">
        Updates
      </h1>
      <div className="flex flex-col gap-2">
        {updates.map((item) => (
          <Link
            href="/library/book"
            key={item.title}
            className="group flex items-center gap-4 rounded-[0.5rem] border border-transparent bg-noir-surface-container-low p-3 transition-colors hover:border-white/10 hover:bg-noir-surface-container"
          >
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded">
              <ShimmerNextImage alt={item.title} src={item.img} fill sizes="48px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-noir-display text-[16px] text-noir-on-surface transition-colors group-hover:text-noir-primary">
                  {item.title}
                </h3>
                {item.isNew && (
                  <span className="shrink-0 rounded-[0.125rem] bg-noir-secondary/20 px-1.5 py-0.5 font-noir-mono text-[10px] uppercase tracking-wider text-noir-secondary">
                    New
                  </span>
                )}
              </div>
              <p className="truncate font-noir-mono text-[12px] text-noir-on-surface-variant">{item.update}</p>
            </div>
            <span className="shrink-0 font-noir-mono text-[12px] text-noir-on-surface-variant">{item.when}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
