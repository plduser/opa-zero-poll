"use client"

import { Database, Search, ChevronRight, ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"

interface DictionariesProps {
  handleGrantAccess: (dictionaryId: string) => void
}

export function Dictionaries({ handleGrantAccess }: DictionariesProps) {
  const [selectedDictionary, setSelectedDictionary] = useState<string | null>(null)

  const dictionaries = [
    { id: "budgets", name: "Budżety", count: 12, lastModified: "2023-05-01" },
    { id: "cn_codes", name: "Kody CN", count: 45, lastModified: "2023-04-15" },
    { id: "countries", name: "Kraje", count: 195, lastModified: "2023-03-20" },
    { id: "contractors", name: "Kontrahenci", count: 78, lastModified: "2023-04-28" },
    { id: "transaction_types", name: "Rodzaje transakcji", count: 24, lastModified: "2023-05-05" },
    { id: "currencies", name: "Waluty", count: 32, lastModified: "2023-04-10" },
    { id: "tax_rates", name: "Stawki podatkowe", count: 8, lastModified: "2023-05-12" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 font-quicksand">
        <Database className="h-6 w-6" />
        Słowniki
      </h1>

      <div className="flex justify-between items-center mb-4">
        <div className="relative w-[280px]">
          <Input type="text" placeholder="Wyszukaj słownik" className="pl-10 border-gray-300" />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 font-bold">Lista słowników</div>
          <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
            <Table>
              <TableBody>
                {dictionaries.map((dict) => (
                  <TableRow
                    key={dict.id}
                    className={selectedDictionary === dict.id ? "bg-blue-50" : ""}
                    onClick={() => setSelectedDictionary(dict.id)}
                  >
                    <TableCell className="font-medium cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span>{dict.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedDictionary(dict.id)
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200 font-bold">
            {dictionaries.find((d) => d.id === selectedDictionary)?.name || "Wybierz słownik"}
          </div>
          <div className="p-4">
            {selectedDictionary && (
              <Tabs defaultValue="elements">
                <TabsList className="mb-4">
                  <TabsTrigger value="elements" className="font-quicksand">
                    Elementy
                  </TabsTrigger>
                  <TabsTrigger value="attributes" className="font-quicksand">
                    Atrybuty
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="font-quicksand">
                    Ustawienia
                  </TabsTrigger>
                  <TabsTrigger value="permissions" className="font-quicksand">
                    Uprawnienia
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="elements">
                  <div className="flex justify-between items-center mb-4">
                    <div className="relative w-[280px]">
                      <Input type="text" placeholder="Wyszukaj element" className="pl-10 border-gray-300" />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-600" />
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                      Dodaj element <Plus className="ml-2 h-5 w-5" />
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nazwa</TableHead>
                        <TableHead>Skrót</TableHead>
                        <TableHead>Aktywny</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDictionary === "countries" && (
                        <>
                          <TableRow>
                            <TableCell>Polska</TableCell>
                            <TableCell>PL</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Niemcy</TableCell>
                            <TableCell>DE</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Francja</TableCell>
                            <TableCell>FR</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                      {selectedDictionary === "budgets" && (
                        <>
                          <TableRow>
                            <TableCell>Budżet operacyjny</TableCell>
                            <TableCell>BOP</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Budżet inwestycyjny</TableCell>
                            <TableCell>BIN</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                      {selectedDictionary === "cn_codes" && (
                        <>
                          <TableRow>
                            <TableCell>8471 30 00 - Komputery przenośne</TableCell>
                            <TableCell>8471 30 00</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>8471 41 00 - Pozostałe maszyny do automatycznego przetwarzania danych</TableCell>
                            <TableCell>8471 41 00</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                      {selectedDictionary === "contractors" && (
                        <>
                          <TableRow>
                            <TableCell>Dostawca</TableCell>
                            <TableCell>DOS</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Odbiorca</TableCell>
                            <TableCell>ODB</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Partner handlowy</TableCell>
                            <TableCell>PAR</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="attributes">
                  <div className="flex justify-between items-center mb-4">
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                      Dodaj atrybut <Plus className="ml-2 h-5 w-5" />
                    </Button>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nazwa</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Wymagany</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDictionary === "countries" && (
                        <>
                          <TableRow>
                            <TableCell>Kod ISO</TableCell>
                            <TableCell>Tekst</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Waluta</TableCell>
                            <TableCell>Słownik</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                      {selectedDictionary === "contractors" && (
                        <>
                          <TableRow>
                            <TableCell>NIP</TableCell>
                            <TableCell>Tekst</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Adres</TableCell>
                            <TableCell>Tekst</TableCell>
                            <TableCell>
                              <Checkbox checked />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Termin płatności</TableCell>
                            <TableCell>Liczba</TableCell>
                            <TableCell>
                              <Checkbox />
                            </TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="settings">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nazwa słownika</label>
                      <Input
                        value={dictionaries.find((d) => d.id === selectedDictionary)?.name || ""}
                        onChange={(e) => console.log("Dictionary name changed:", e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skrót</label>
                      <Input
                        value={
                          selectedDictionary === "countries"
                            ? "KR"
                            : selectedDictionary === "budgets"
                              ? "BUD"
                              : selectedDictionary === "cn_codes"
                                ? "CN"
                                : selectedDictionary === "contractors"
                                  ? "KON"
                                  : ""
                        }
                        onChange={(e) => console.log("Dictionary shortcut changed:", e.target.value)}
                        className="max-w-md"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="active" checked />
                      <label htmlFor="active" className="text-sm font-medium text-gray-700">
                        Aktywny
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Domyślny element</label>
                      <div className="relative">
                        <select
                          className="w-full max-w-md h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                          defaultValue=""
                          onChange={(e) => console.log(e.target.value)}
                        >
                          <option value="">Wybierz element</option>
                          {selectedDictionary === "countries" && (
                            <>
                              <option value="PL">Polska</option>
                              <option value="DE">Niemcy</option>
                              <option value="FR">Francja</option>
                            </>
                          )}
                          {selectedDictionary === "budgets" && (
                            <>
                              <option value="BOP">Budżet operacyjny</option>
                              <option value="BIN">Budżet inwestycyjny</option>
                            </>
                          )}
                          {selectedDictionary === "cn_codes" && (
                            <>
                              <option value="8471 30 00">8471 30 00 - Komputery przenośne</option>
                              <option value="8471 41 00">8471 41 00 - Pozostałe maszyny</option>
                            </>
                          )}
                          {selectedDictionary === "contractors" && (
                            <>
                              <option value="DOS">Dostawca</option>
                              <option value="ODB">Odbiorca</option>
                              <option value="PAR">Partner handlowy</option>
                            </>
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Proponowany element</label>
                      <div className="relative">
                        <select
                          className="w-full max-w-md h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
                          defaultValue={
                            selectedDictionary === "countries"
                              ? "PL"
                              : selectedDictionary === "budgets"
                                ? "BOP"
                                : selectedDictionary === "cn_codes"
                                  ? "8471 30 00"
                                  : selectedDictionary === "contractors"
                                    ? "DOS"
                                    : ""
                          }
                          onChange={(e) => console.log(e.target.value)}
                        >
                          <option value="">Wybierz element</option>
                          {selectedDictionary === "countries" && (
                            <>
                              <option value="PL">Polska</option>
                              <option value="DE">Niemcy</option>
                              <option value="FR">Francja</option>
                            </>
                          )}
                          {selectedDictionary === "budgets" && (
                            <>
                              <option value="BOP">Budżet operacyjny</option>
                              <option value="BIN">Budżet inwestycyjny</option>
                            </>
                          )}
                          {selectedDictionary === "cn_codes" && (
                            <>
                              <option value="8471 30 00">8471 30 00 - Komputery przenośne</option>
                              <option value="8471 41 00">8471 41 00 - Pozostałe maszyny</option>
                            </>
                          )}
                          {selectedDictionary === "contractors" && (
                            <>
                              <option value="DOS">Dostawca</option>
                              <option value="ODB">Odbiorca</option>
                              <option value="PAR">Partner handlowy</option>
                            </>
                          )}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-4">
                      <Button className="bg-green-600 hover:bg-green-700 text-white font-quicksand">
                        Zapisz zmiany
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="permissions">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Uprawnienia do słownika</h3>
                      <Button
                        className="bg-green-600 hover:bg-green-700 text-white font-quicksand"
                        onClick={() => handleGrantAccess(selectedDictionary || "")}
                      >
                        Nadaj dostęp
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Użytkownik</TableHead>
                          <TableHead className="text-center">Edycja</TableHead>
                          <TableHead className="text-center">Usuwanie</TableHead>
                          <TableHead className="text-center">Atrybuty</TableHead>
                          <TableHead className="text-center">Aktywność</TableHead>
                          <TableHead className="text-center">Edycja el.</TableHead>
                          <TableHead className="text-center">Dodawanie</TableHead>
                          <TableHead className="text-center">Usuwanie el.</TableHead>
                          <TableHead className="text-center">Udostępnianie</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Jan Kowalski</TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Anna Nowak</TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Piotr Wiśniewski</TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox checked />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                          <TableCell className="text-center">
                            <Checkbox />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
