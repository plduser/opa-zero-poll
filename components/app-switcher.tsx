"use client"

import { useState } from "react"
import { Grid3X3, X } from "lucide-react"
import Link from "next/link"

export function AppSwitcher() {
  const [isOpen, setIsOpen] = useState(false)

  const apps = [
    {
      id: "portal",
      name: "Portal Użytkownika",
      shortName: "PU",
      icon: "/app-icons/portal-icon.png",
      color: "#009A00",
      url: "/aplikacje",
    },
    {
      id: "ebiuro",
      name: "Symfonia eBiuro",
      shortName: "eB",
      icon: "/app-icons/ebiuro-icon.png",
      color: "#2563EB",
      url: "/ebiuro",
    },
    {
      id: "ksef",
      name: "Symfonia KSEF",
      shortName: "KS",
      icon: "/app-icons/ksef-icon.png",
      color: "#2563EB",
      url: "/ksef",
    },
    {
      id: "edokumenty",
      name: "Symfonia eDokumenty",
      shortName: "eD",
      icon: "/app-icons/edokumenty-icon.png",
      color: "#009A00",
      url: "/edokumenty",
    },
    {
      id: "edeklaracje",
      name: "Symfonia eDeklaracje",
      shortName: "eD",
      icon: "/app-icons/edeklaracje-icon.png",
      color: "#2563EB",
      url: "/edeklaracje",
    },
    {
      id: "eplace",
      name: "Symfonia ePłace",
      shortName: "eP",
      icon: "/app-icons/eplace-icon.png",
      color: "#F59E0B",
      url: "/eplace",
    },
    {
      id: "fk",
      name: "Symfonia Finanse i Księgowość",
      shortName: "FK",
      icon: "/app-icons/fk-icon.png",
      color: "#2563EB",
      url: "/fk",
    },
    {
      id: "handel",
      name: "Symfonia Handel",
      shortName: "H",
      icon: "/app-icons/handel-icon.png",
      color: "#9333EA",
      url: "/handel",
    },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Przełącz aplikacje"
      >
        {isOpen ? <X className="h-6 w-6 text-gray-600" /> : <Grid3X3 className="h-6 w-6 text-gray-600" />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <h3 className="text-lg font-medium mb-3 font-quicksand">Aplikacje Symfonia</h3>
            <div className="grid grid-cols-3 gap-4">
              {apps.map((app) => (
                <Link
                  key={app.id}
                  href={app.url}
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
                    style={{ backgroundColor: app.color }}
                  >
                    <span className="text-white font-bold text-lg">{app.shortName}</span>
                  </div>
                  <span className="text-xs text-center font-medium font-quicksand">{app.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
