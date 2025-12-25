import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 mt-8">
      <div className="p-4 flex flex-col md:flex-center items-center justify-between gap-3">
        <div className="text-sm text-neutral-400">
          © {new Date().getFullYear()} CineXerve. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
