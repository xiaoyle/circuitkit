import { ToolCard } from "@/components/tool-card";
import { tools } from "@/lib/tools";

export function ToolsDirectory() {
  return (
    <ul className="grid list-none gap-x-12 border-b border-line md:grid-cols-2">
      {tools.map((tool) => (
        <ToolCard key={tool.slug} tool={tool} />
      ))}
    </ul>
  );
}
