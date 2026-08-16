"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Switch } from "@/components/ui/Switch";
import { Badge, CountBadge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs } from "@/components/ui/Tabs";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pagination } from "@/components/ui/Pagination";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AccordionItem } from "@/components/ui/Accordion";
import { Dropzone } from "@/components/ui/Dropzone";
import { Icon } from "@/components/ui/icons/Icon";

type Row = { id: string; name: string; status: string };
const rows: Row[] = [
  { id: "#ORD-9921", name: "Elena Vance", status: "SHIPPED" },
  { id: "#ORD-9922", name: "Julian Cross", status: "PENDING" },
];
const columns: Column<Row>[] = [
  { key: "id", header: "Order ID", render: (r) => r.id },
  { key: "name", header: "Customer", render: (r) => r.name },
  { key: "status", header: "Status", align: "end", render: (r) => r.status },
];

export default function KitchenSink() {
  const [switch1, setSwitch1] = useState(true);
  const [switch2, setSwitch2] = useState(false);
  const [tab, setTab] = useState("month");
  const [page, setPage] = useState(1);
  const [tagActive, setTagActive] = useState(false);

  return (
    <main className="mx-auto max-w-4xl space-y-16 px-margin-mobile py-24 md:px-margin-desktop">
      <h1 className="font-display text-headline-lg text-primary">Kitchen Sink</h1>

      <section className="space-y-4">
        <Breadcrumb items={[{ label: "Dashboard", href: "/vendor/dashboard" }, { label: "Orders" }]} />
      </section>

      <section className="flex flex-wrap items-center gap-4">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Disabled</Button>
      </section>

      <section className="grid max-w-md grid-cols-1 gap-8">
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
            Collection Name
          </label>
          <Input placeholder="e.g. Resort 25" />
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
            Season
          </label>
          <Select defaultValue="">
            <option value="" disabled>
              Choose a season
            </option>
            <option>Spring/Summer 2025</option>
            <option>Autumn/Winter 2025</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
            Description
          </label>
          <Textarea rows={4} placeholder="Describe the inspiration..." />
        </div>
      </section>

      <section className="flex items-center gap-6">
        <label className="flex items-center gap-2">
          <Checkbox defaultChecked /> Selected
        </label>
        <Switch checked={switch1} onCheckedChange={setSwitch1} aria-label="Order notifications" />
        <Switch checked={switch2} onCheckedChange={setSwitch2} aria-label="Marketing updates" />
      </section>

      <section className="flex flex-wrap items-center gap-4">
        <Badge>VIP Client</Badge>
        <Badge variant="outline">Draft</Badge>
        <StatusPill label="Shipped" tone="neutral" />
        <StatusPill label="Pending" tone="error" />
        <StatusPill label="Processing" tone="positive" />
        <div className="relative">
          <Icon name="shopping_bag" />
          <CountBadge count={3} />
        </div>
        <Tag active={tagActive} onClick={() => setTagActive((v) => !v)}>
          Minimalist
        </Tag>
        <Tag dashed>+ Add tag</Tag>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard label="Total Revenue" value="$124,500" icon="account_balance_wallet" trend={{ direction: "up", label: "+14% vs last month" }} />
        <StatCard label="Pending Orders" value="12" icon="local_shipping" inverted />
        <Card>
          <p className="font-body-md text-on-surface-variant">Plain card content.</p>
        </Card>
      </section>

      <section className="space-y-4">
        <Tabs
          tabs={[
            { value: "month", label: "Month" },
            { value: "quarter", label: "Quarter" },
            { value: "year", label: "Year" },
          ]}
          value={tab}
          onChange={setTab}
        />
        <p className="text-on-surface-variant text-sm">Active: {tab}</p>
      </section>

      <section>
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} />
        <Pagination page={page} totalPages={5} onPageChange={setPage} />
      </section>

      <section className="flex items-center gap-4">
        <Avatar name="Elena Vance" />
        <Avatar name="Julian Cross" src={null} size={56} />
      </section>

      <section className="max-w-sm space-y-4">
        <ProgressBar label="VIP" percent={62} />
        <ProgressBar label="Elite" percent={28} />
      </section>

      <section className="max-w-lg">
        <AccordionItem title="Details & Dimensions" defaultOpen>
          Height 42cm, Width 30cm, Depth 18cm.
        </AccordionItem>
        <AccordionItem title="Shipping & Returns">
          Complimentary shipping on all orders over $500.
        </AccordionItem>
      </section>

      <section className="max-w-md">
        <Dropzone onFilesSelected={() => {}} hint="JPEG, PNG up to 50MB" />
      </section>
    </main>
  );
}
