export default function StatusBar({ wordCount = 0 }) {
  return (
    <div className="h-7 bg-[#202020] border-t border-[#333] flex items-center justify-between px-3 text-[10px] text-[#777] select-none">
      <div className="flex gap-4">
        <span className="hover:text-[#999] cursor-pointer">0 backlinks</span>
        <span className="hover:text-[#999] cursor-pointer">{wordCount} words</span>
        <span className="hover:text-[#999] cursor-pointer">100% characters</span>
      </div>
      <div className="flex gap-4">
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}