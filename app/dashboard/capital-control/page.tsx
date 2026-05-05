"use client";

import { useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

const DUMMY_DATA = [
  { id: 1, user: "Alice Walker", email: "alice@example.com", capital: 100000, balance: 105200, status: "Active", aBook: true },
  { id: 2, user: "Bob Smith", email: "bob@example.com", capital: 50000, balance: 48000, status: "Restricted", aBook: false },
  { id: 3, user: "Charlie Davis", email: "charlie@example.com", capital: 200000, balance: 215000, status: "Active", aBook: true },
  { id: 4, user: "Diana Prince", email: "diana@example.com", capital: 10000, balance: 9500, status: "Suspended", aBook: false },
];

export default function CapitalControlPage() {
  const [search, setSearch] = useState("");

  const filteredData = DUMMY_DATA.filter((item) => 
    item.user.toLowerCase().includes(search.toLowerCase()) ||
    item.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Capital Control</h1>
          <p className="text-[var(--muted)] mt-1">Manage user funds, a-book routing, and account restrictions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Export CSV</Button>
          <Button>Add Capital</Button>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <Input 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Capital Size</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>A-Book</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-medium text-white">{row.user}</div>
                  <div className="text-xs text-[var(--muted)]">{row.email}</div>
                </TableCell>
                <TableCell>${row.capital.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={row.balance >= row.capital ? "text-[var(--primary)]" : "text-[var(--danger)]"}>
                    ${row.balance.toLocaleString()}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      row.status === "Active" ? "success" : 
                      row.status === "Restricted" ? "warning" : "danger"
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={row.aBook ? "default" : "outline"}>
                    {row.aBook ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreVertical size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[var(--muted)]">
                  No accounts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
