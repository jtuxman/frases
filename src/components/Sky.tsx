export function Sky() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="cloud left-[8%] top-[8%] h-10 w-24" />
      <div className="cloud left-[18%] top-[12%] h-7 w-16" />
      <div className="cloud right-[12%] top-[10%] h-12 w-32" />
      <div className="cloud right-[22%] top-[16%] h-8 w-20" />
    </div>
  )
}
