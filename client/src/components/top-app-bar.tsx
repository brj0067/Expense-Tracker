import { Wallet, SearchIcon, UserCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TopAppBar() {
  return (
    <header className="bg-primary text-white p-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="h-6 w-6" />
          <h1 className="text-xl font-medium">Budgify</h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-primary-foreground/20"
          >
            <SearchIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-primary-foreground/20"
          >
            <UserCircleIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
