import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export default function PromptNotFound() {
  return (
    <EmptyState
      icon={MessageSquareText}
      title="Prompt not found"
      description="This prompt isn't in the tracked set. It may have been removed from tracking."
      action={
        <Link href="/prompts">
          <Button variant="primary">Back to prompts</Button>
        </Link>
      }
    />
  );
}
