"use client";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAppointments } from "@/composables/use-appointments";
import { AppointmentList } from "@/components/appointment-list";
import { Button, Card, ErrorText } from "@/components/ui";

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export default function CalendarPage() {
  const { slug } = useParams<{ slug: string }>();
  const [offset, setOffset] = useState(0);
  const weekStart = useMemo(() => new Date(startOfWeek(new Date()).getTime() + offset * 7 * 86_400_000), [offset]);
  const { items, loading, error, setStatus, range } = useAppointments(slug, weekStart);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Week of {range.from.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
        </h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setOffset((o) => o - 1)}>←</Button>
          <Button variant="ghost" onClick={() => setOffset(0)}>Today</Button>
          <Button variant="ghost" onClick={() => setOffset((o) => o + 1)}>→</Button>
        </div>
      </div>
      <ErrorText>{error}</ErrorText>
      {loading ? <p className="text-sm text-stone-500">Loading…</p> : <AppointmentList items={items} onStatus={(id, s) => setStatus(slug, id, s)} />}
    </Card>
  );
}
