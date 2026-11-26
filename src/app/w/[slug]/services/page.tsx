"use client";
import { useParams } from "next/navigation";
import { useServices } from "@/composables/use-services";
import { useWorkspace } from "@/composables/use-workspace";
import { peso } from "@/composables/use-format";
import { ServiceForm } from "@/components/service-form";
import { Button, Card, ErrorText } from "@/components/ui";

export default function ServicesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { isManager } = useWorkspace(slug);
  const { items, error, create, toggleActive, remove } = useServices(slug);

  return (
    <div className="space-y-4">
      {isManager && <Card><ServiceForm onSubmit={(v) => create(slug, v)} /></Card>}
      <Card>
        <ErrorText>{error}</ErrorText>
        <ul className="divide-y divide-stone-200">
          {items.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-3">
              <div className={s.isActive ? "" : "opacity-50"}>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-stone-500">{s.durationMinutes} min · {peso(s.priceCents)}</p>
              </div>
              {isManager && (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => toggleActive(slug, s)}>{s.isActive ? "Hide" : "Show"}</Button>
                  <Button variant="danger" onClick={() => remove(slug, s.id)}>Delete</Button>
                </div>
              )}
            </li>
          ))}
          {!items.length && <li className="py-3 text-sm text-stone-500">No services yet.</li>}
        </ul>
      </Card>
    </div>
  );
}
