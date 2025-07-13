import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export default function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed right-4 bottom-24 w-14 h-14 rounded-full bg-accent hover:bg-accent/90 shadow-lg fab z-40"
      size="icon"
    >
      <PlusIcon className="h-6 w-6" />
    </Button>
  );
}
