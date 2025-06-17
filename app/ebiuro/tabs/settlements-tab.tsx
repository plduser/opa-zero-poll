"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, FileText, Filter, Plus, Search } from "lucide-react"

export function SettlementsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Rozliczenia</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Wybierz okres
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nowe rozliczenie
          </Button>
        </div>
      </div>

      <Tabs defaultValue="declarations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="declarations">Deklaracje</TabsTrigger>
          <TabsTrigger value="payments">Płatności</TabsTrigger>
          <TabsTrigger value="settlements">Rozrachunki</TabsTrigger>
          <TabsTrigger value="zus">ZUS</TabsTrigger>
        </TabsList>

        <TabsContent value="declarations" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Deklaracje podatkowe</CardTitle>
              <CardDescription>Zarządzaj deklaracjami podatkowymi dla wszystkich klientów</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Szukaj deklaracji..." className="pl-8 w-[250px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Typ deklaracji" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie typy</SelectItem>
                      <SelectItem value="vat">VAT</SelectItem>
                      <SelectItem value="pit">PIT</SelectItem>
                      <SelectItem value="cit">CIT</SelectItem>
                      <SelectItem value="other">Inne</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Eksportuj
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Typ</TableHead>
                    <TableHead>Okres</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Termin</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      type: "VAT-7",
                      period: "04.2025",
                      client: "Firma ABC Sp. z o.o.",
                      deadline: "25.05.2025",
                      amount: "2 300,00 zł",
                      status: "W przygotowaniu",
                      statusColor: "bg-blue-100 text-blue-800",
                    },
                    {
                      type: "PIT-5",
                      period: "04.2025",
                      client: "Jan Kowalski - Usługi",
                      deadline: "20.05.2025",
                      amount: "1 250,00 zł",
                      status: "Nie rozpoczęto",
                      statusColor: "bg-gray-100 text-gray-800",
                    },
                    {
                      type: "CIT-8",
                      period: "2024",
                      client: "Sklep Internetowy XYZ",
                      deadline: "31.05.2025",
                      amount: "12 500,00 zł",
                      status: "W przygotowaniu",
                      statusColor: "bg-blue-100 text-blue-800",
                    },
                    {
                      type: "VAT-7",
                      period: "03.2025",
                      client: "Restauracja Pod Lipą",
                      deadline: "25.04.2025",
                      amount: "1 800,00 zł",
                      status: "Złożona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      type: "VAT-7",
                      period: "03.2025",
                      client: "Firma ABC Sp. z o.o.",
                      deadline: "25.04.2025",
                      amount: "3 200,00 zł",
                      status: "Złożona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      type: "PIT-5",
                      period: "03.2025",
                      client: "Jan Kowalski - Usługi",
                      deadline: "20.04.2025",
                      amount: "980,00 zł",
                      status: "Złożona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell>{item.period}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>{item.deadline}</TableCell>
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

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Płatności</CardTitle>
              <CardDescription>Zarządzaj płatnościami podatkowymi i ZUS</CardDescription>
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
                      <SelectValue placeholder="Typ płatności" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie typy</SelectItem>
                      <SelectItem value="vat">VAT</SelectItem>
                      <SelectItem value="pit">PIT</SelectItem>
                      <SelectItem value="cit">CIT</SelectItem>
                      <SelectItem value="zus">ZUS</SelectItem>
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
                    <TableHead>Data</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      date: "25.04.2025",
                      type: "VAT",
                      client: "Firma ABC Sp. z o.o.",
                      description: "VAT za 03.2025",
                      amount: "3 200,00 zł",
                      status: "Opłacona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      date: "20.04.2025",
                      type: "PIT",
                      client: "Jan Kowalski - Usługi",
                      description: "PIT-5 za 03.2025",
                      amount: "980,00 zł",
                      status: "Opłacona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      date: "15.04.2025",
                      type: "ZUS",
                      client: "Jan Kowalski - Usługi",
                      description: "ZUS DRA za 03.2025",
                      amount: "1 520,00 zł",
                      status: "Opłacona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      date: "25.05.2025",
                      type: "VAT",
                      client: "Firma ABC Sp. z o.o.",
                      description: "VAT za 04.2025",
                      amount: "2 300,00 zł",
                      status: "Do zapłaty",
                      statusColor: "bg-amber-100 text-amber-800",
                    },
                    {
                      date: "20.05.2025",
                      type: "PIT",
                      client: "Jan Kowalski - Usługi",
                      description: "PIT-5 za 04.2025",
                      amount: "1 250,00 zł",
                      status: "Do zapłaty",
                      statusColor: "bg-amber-100 text-amber-800",
                    },
                    {
                      date: "15.05.2025",
                      type: "ZUS",
                      client: "Jan Kowalski - Usługi",
                      description: "ZUS DRA za 04.2025",
                      amount: "1 520,00 zł",
                      status: "Do zapłaty",
                      statusColor: "bg-amber-100 text-amber-800",
                    },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>{item.description}</TableCell>
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

        <TabsContent value="settlements" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Rozrachunki</CardTitle>
              <CardDescription>Przeglądaj rozrachunki z kontrahentami</CardDescription>
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
                      <SelectValue placeholder="Typ rozrachunku" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie typy</SelectItem>
                      <SelectItem value="receivables">Należności</SelectItem>
                      <SelectItem value="liabilities">Zobowiązania</SelectItem>
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
                    <TableHead>Dokument</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Kontrahent</TableHead>
                    <TableHead>Termin płatności</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Pozostało</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      document: "FV/2025/05/001",
                      date: "10.05.2025",
                      client: "Firma ABC Sp. z o.o.",
                      contractor: "Klient X",
                      dueDate: "24.05.2025",
                      amount: "12 300,00 zł",
                      remaining: "12 300,00 zł",
                      status: "Niezapłacona",
                      statusColor: "bg-amber-100 text-amber-800",
                    },
                    {
                      document: "FV/2025/05/002",
                      date: "10.05.2025",
                      client: "Jan Kowalski - Usługi",
                      contractor: "Klient Y",
                      dueDate: "24.05.2025",
                      amount: "4 500,00 zł",
                      remaining: "4 500,00 zł",
                      status: "Niezapłacona",
                      statusColor: "bg-amber-100 text-amber-800",
                    },
                    {
                      document: "FV/2025/04/015",
                      date: "25.04.2025",
                      client: "Sklep Internetowy XYZ",
                      contractor: "Dostawca A",
                      dueDate: "09.05.2025",
                      amount: "8 750,00 zł",
                      remaining: "0,00 zł",
                      status: "Zapłacona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      document: "FV/2025/04/012",
                      date: "20.04.2025",
                      client: "Restauracja Pod Lipą",
                      contractor: "Dostawca B",
                      dueDate: "04.05.2025",
                      amount: "3 200,00 zł",
                      remaining: "1 200,00 zł",
                      status: "Częściowo zapłacona",
                      statusColor: "bg-blue-100 text-blue-800",
                    },
                    {
                      document: "FV/2025/04/010",
                      date: "15.04.2025",
                      client: "Gabinet Stomatologiczny Uśmiech",
                      contractor: "Klient Z",
                      dueDate: "29.04.2025",
                      amount: "1 500,00 zł",
                      remaining: "0,00 zł",
                      status: "Zapłacona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.document}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>{item.contractor}</TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell>{item.amount}</TableCell>
                      <TableCell>{item.remaining}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={item.statusColor}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zus" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Rozliczenia ZUS</CardTitle>
              <CardDescription>Zarządzaj deklaracjami i płatnościami ZUS</CardDescription>
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
                      <SelectValue placeholder="Typ deklaracji" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Wszystkie typy</SelectItem>
                      <SelectItem value="dra">ZUS DRA</SelectItem>
                      <SelectItem value="rca">ZUS RCA</SelectItem>
                      <SelectItem value="rza">ZUS RZA</SelectItem>
                      <SelectItem value="rsa">ZUS RSA</SelectItem>
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
                    <TableHead>Typ</TableHead>
                    <TableHead>Okres</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead>Termin</TableHead>
                    <TableHead>Kwota</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    {
                      type: "ZUS DRA",
                      period: "04.2025",
                      client: "Jan Kowalski - Usługi",
                      deadline: "15.05.2025",
                      amount: "1 520,00 zł",
                      status: "W przygotowaniu",
                      statusColor: "bg-blue-100 text-blue-800",
                    },
                    {
                      type: "ZUS RCA",
                      period: "04.2025",
                      client: "Firma ABC Sp. z o.o.",
                      deadline: "15.05.2025",
                      amount: "4 250,00 zł",
                      status: "W przygotowaniu",
                      statusColor: "bg-blue-100 text-blue-800",
                    },
                    {
                      type: "ZUS DRA",
                      period: "03.2025",
                      client: "Jan Kowalski - Usługi",
                      deadline: "15.04.2025",
                      amount: "1 520,00 zł",
                      status: "Złożona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      type: "ZUS RCA",
                      period: "03.2025",
                      client: "Firma ABC Sp. z o.o.",
                      deadline: "15.04.2025",
                      amount: "4 250,00 zł",
                      status: "Złożona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                    {
                      type: "ZUS RSA",
                      period: "03.2025",
                      client: "Firma ABC Sp. z o.o.",
                      deadline: "15.04.2025",
                      amount: "0,00 zł",
                      status: "Złożona",
                      statusColor: "bg-green-100 text-green-800",
                    },
                  ].map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.type}</TableCell>
                      <TableCell>{item.period}</TableCell>
                      <TableCell>{item.client}</TableCell>
                      <TableCell>{item.deadline}</TableCell>
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
      </Tabs>
    </div>
  )
}
