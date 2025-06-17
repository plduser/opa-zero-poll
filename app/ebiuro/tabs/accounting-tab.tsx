"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, FileText, Filter, Plus, Search, Upload } from "lucide-react"

export function AccountingTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Księgowość</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Importuj
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nowy dokument
          </Button>
        </div>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Dokumenty</TabsTrigger>
          <TabsTrigger value="journal">Dziennik księgowy</TabsTrigger>
          <TabsTrigger value="ledger">Księga główna</TabsTrigger>
          <TabsTrigger value="vat">Rejestr VAT</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Dokumenty księgowe</CardTitle>
              <CardDescription>Zarządzaj dokumentami księgowymi dla wszystkich klientów</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Szukaj dokumentów..." className="pl-8 w-[250px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Typ dokumentu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie typy</SelectItem>
                      <SelectItem value="invoice">Faktury</SelectItem>
                      <SelectItem value="receipt">Paragony</SelectItem>
                      <SelectItem value="bank">Wyciągi bankowe</SelectItem>
                      <SelectItem value="other">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Wybierz okres
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Eksportuj
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numer</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      number: "FV/2025/05/001",
                      date: "10.05.2025",
                      client: "Firma ABC Sp. z o.o.",
                      type: "Faktura VAT",
                      amount: "12 300,00 zł",
                      status: "Zaksięgowany",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      number: "FV/2025/05/002",
                      date: "10.05.2025",
                      client: "Jan Kowalski - Usługi",
                      type: "Faktura VAT",
                      amount: "4 500,00 zł",
                      status: "Do zaksięgowania",
                      statusColor: "bg-amber-100 text-amber-800",
                    },
                    {
                      number: "WB/2025/05/001",
                      date: "09.05.2025",
                      client: "Sklep Internetowy XYZ",
                      type: "Wyciąg bankowy",
                      amount: "8 750,00 zł",
                      status: "Do zaksięgowania",
                      statusColor: "bg-amber-100 text-amber-800",
                    },
                    {
                      number: "FV/2025/05/003",
                      date: "08.05.2025",
                      client: "Restauracja Pod Lipą",
                      type: "Faktura VAT",
                      amount: "3 200,00 zł",
                      status: "Zaksięgowany",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      number: "KP/2025/05/001",
                      date: "07.05.2025",
                      client: "Gabinet Stomatologiczny Uśmiech",
                      type: "KP",
                      amount: "1 500,00 zł",
                      status: "Zaksięgowany",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      number: "FV/2025/05/004",
                      date: "06.05.2025",
                      client: "Firma ABC Sp. z o.o.",
                      type: "Faktura VAT",
                      amount: "9 800,00 zł",
                      status: "Zaksięgowany",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      number: "FV/2025/05/005",
                      date: "05.05.2025",
                      client: "Jan Kowalski - Usługi",
                      type: "Faktura VAT",
                      amount: "2 100,00 zł",
                      status: "Zaksięgowany",
                      statusColor: "bg-green-100 text-green-800",
                    },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.number}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={item.statusColor}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Dziennik księgowy</CardTitle>
              <CardDescription>Przeglądaj zapisy w dzienniku księgowym</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Szukaj zapisów..." className="pl-8 w-[250px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Klient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszyscy klienci</SelectItem>
                      <SelectItem value="abc">Firma ABC Sp. z o.o.</SelectItem>
                      <SelectItem value="kowalski">Jan Kowalski - Usługi</SelectItem>
                      <SelectItem value="xyz">Sklep Internetowy XYZ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Wybierz okres
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Eksportuj
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LP</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Dokument</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Konto Wn</TableHead>
                    <TableHead>Konto Ma</TableHead>
                    <TableHead>Kwota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      lp: "1",
                      date: "10.05.2025",
                      document: "FV/2025/05/001",
                      client: "Firma ABC Sp. z o.o.",
                      description: "Sprzedaż usług",
                      accountDr: "202",
                      accountCr: "702",
                      amount: "12 300,00 zł",
                    },
                    {
                      lp: "2",
                      date: "10.05.2025",
                      document: "FV/2025/05/001",
                      client: "Firma ABC Sp. z o.o.",
                      description: "VAT należny",
                      accountDr: "202",
                      accountCr: "221",
                      amount: "2 300,00 zł",
                    },
                    {
                      lp: "3",
                      date: "09.05.2025",
                      document: "WB/2025/05/001",
                      client: "Sklep Internetowy XYZ",
                      description: "Wpłata za fakturę",
                      accountDr: "130",
                      accountCr: "202",
                      amount: "8 750,00 zł",
                    },
                    {
                      lp: "4",
                      date: "08.05.2025",
                      document: "FV/2025/05/003",
                      client: "Restauracja Pod Lipą",
                      description: "Sprzedaż usług",
                      accountDr: "202",
                      accountCr: "702",
                      amount: "3 200,00 zł",
                    },
                    {
                      lp: "5",
                      date: "07.05.2025",
                      document: "KP/2025/05/001",
                      client: "Gabinet Stomatologiczny Uśmiech",
                      description: "Wpłata gotówkowa",
                      accountDr: "100",
                      accountCr: "202",
                      amount: "1 500,00 zł",
                    },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.lp}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.document}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.accountDr}</TableCell>
                      <TableCell>{item.accountCr}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Księga główna</CardTitle>
              <CardDescription>Przeglądaj zapisy na kontach księgi głównej</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Klient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszyscy klienci</SelectItem>
                      <SelectItem value="abc">Firma ABC Sp. z o.o.</SelectItem>
                      <SelectItem value="kowalski">Jan Kowalski - Usługi</SelectItem>
                      <SelectItem value="xyz">Sklep Internetowy XYZ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Konto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie konta</SelectItem>
                      <SelectItem value="100">100 - Kasa</SelectItem>
                      <SelectItem value="130">130 - Rachunek bankowy</SelectItem>
                      <SelectItem value="202">202 - Rozrachunki z odbiorcami</SelectItem>
                      <SelectItem value="221">221 - VAT należny</SelectItem>
                      <SelectItem value="702">702 - Przychody ze sprzedaży usług</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Wybierz okres
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Eksportuj
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Konto</TableHead>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>BO Wn</TableHead>
                    <TableHead>BO Ma</TableHead>
                    <TableHead>Obroty Wn</TableHead>
                    <TableHead>Obroty Ma</TableHead>
                    <TableHead>Saldo Wn</TableHead>
                    <TableHead>Saldo Ma</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      account: "100",
                      name: "Kasa",
                      boDr: "5 000,00 zł",
                      boCr: "0,00 zł",
                      turnoverDr: "1 500,00 zł",
                      turnoverCr: "800,00 zł",
                      balanceDr: "5 700,00 zł",
                      balanceCr: "0,00 zł",
                    },
                    {
                      account: "130",
                      name: "Rachunek bankowy",
                      boDr: "25 000,00 zł",
                      boCr: "0,00 zł",
                      turnoverDr: "8 750,00 zł",
                      turnoverCr: "12 300,00 zł",
                      balanceDr: "21 450,00 zł",
                      balanceCr: "0,00 zł",
                    },
                    {
                      account: "202",
                      name: "Rozrachunki z odbiorcami",
                      boDr: "15 000,00 zł",
                      boCr: "0,00 zł",
                      turnoverDr: "17 800,00 zł",
                      turnoverCr: "10 250,00 zł",
                      balanceDr: "22 550,00 zł",
                      balanceCr: "0,00 zł",
                    },
                    {
                      account: "221",
                      name: "VAT należny",
                      boDr: "0,00 zł",
                      boCr: "3 500,00 zł",
                      turnoverDr: "0,00 zł",
                      turnoverCr: "2 300,00 zł",
                      balanceDr: "0,00 zł",
                      balanceCr: "5 800,00 zł",
                    },
                    {
                      account: "702",
                      name: "Przychody ze sprzedaży usług",
                      boDr: "0,00 zł",
                      boCr: "45 000,00 zł",
                      turnoverDr: "0,00 zł",
                      turnoverCr: "15 500,00 zł",
                      balanceDr: "0,00 zł",
                      balanceCr: "60 500,00 zł",
                    },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.account}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.boDr}</TableCell>
                      <TableCell>{item.boCr}</TableCell>
                      <TableCell>{item.turnoverDr}</TableCell>
                      <TableCell>{item.turnoverCr}</TableCell>
                      <TableCell>{item.balanceDr}</TableCell>
                      <TableCell>{item.balanceCr}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vat" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Rejestr VAT</CardTitle>
              <CardDescription>Przeglądaj zapisy w rejestrze VAT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Klient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszyscy klienci</SelectItem>
                      <SelectItem value="abc">Firma ABC Sp. z o.o.</SelectItem>
                      <SelectItem value="kowalski">Jan Kowalski - Usługi</SelectItem>
                      <SelectItem value="xyz">Sklep Internetowy XYZ</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="sales">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Typ rejestru" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Rejestr sprzedaży</SelectItem>
                      <SelectItem value="purchase">Rejestr zakupu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Wybierz okres
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Eksportuj
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>LP</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Dokument</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Netto</TableHead>
                    <TableHead>VAT 23%</TableHead>
                    <TableHead>VAT 8%</TableHead>
                    <TableHead>VAT 5%</TableHead>
                    <TableHead>Brutto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      lp: "1",
                      date: "10.05.2025",
                      document: "FV/2025/05/001",
                      client: "Firma ABC Sp. z o.o.",
                      net: "10 000,00 zł",
                      vat23: "2 300,00 zł",
                      vat8: "0,00 zł",
                      vat5: "0,00 zł",
                      gross: "12 300,00 zł",
                    },
                    {
                      lp: "2",
                      date: "10.05.2025",
                      document: "FV/2025/05/002",
                      client: "Jan Kowalski - Usługi",
                      net: "4 166,67 zł",
                      vat23: "0,00 zł",
                      vat8: "333,33 zł",
                      vat5: "0,00 zł",
                      gross: "4 500,00 zł",
                    },
                    {
                      lp: "3",
                      date: "08.05.2025",
                      document: "FV/2025/05/003",
                      client: "Restauracja Pod Lipą",
                      net: "2 601,63 zł",
                      vat23: "598,37 zł",
                      vat8: "0,00 zł",
                      vat5: "0,00 zł",
                      gross: "3 200,00 zł",
                    },
                    {
                      lp: "4",
                      date: "06.05.2025",
                      document: "FV/2025/05/004",
                      client: "Firma ABC Sp. z o.o.",
                      net: "7 967,48 zł",
                      vat23: "1 832,52 zł",
                      vat8: "0,00 zł",
                      vat5: "0,00 zł",
                      gross: "9 800,00 zł",
                    },
                    {
                      lp: "5",
                      date: "05.05.2025",
                      document: "FV/2025/05/005",
                      client: "Jan Kowalski - Usługi",
                      net: "2 000,00 zł",
                      vat23: "0,00 zł",
                      vat8: "0,00 zł",
                      vat5: "100,00 zł",
                      gross: "2 100,00 zł",
                    },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.lp}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.document}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>{item.net}</TableCell>
                      <TableCell>{item.vat23}</TableCell>
                      <TableCell>{item.vat8}</TableCell>
                      <TableCell>{item.vat5}</TableCell>
                      <TableCell>{item.gross}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
