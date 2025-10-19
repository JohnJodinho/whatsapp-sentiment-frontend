import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DeleteChatModal } from "./DeleteChatModal";
import { Trash2 } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface DeleteChatButtonProps {
  onDelete: () => Promise<void>;
  onError: () => void;
}

export function DeleteChatButton({ onDelete, onError }: DeleteChatButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 640px)')

  const buttonClass = isMobile
  ? "h-12 text-base font-semibold rounded-full w-120"
  : "h-12 text-base font-semibold rounded-full w-70";

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={buttonClass}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Chat
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DeleteChatModal 
          onDeleteConfirmed={onDelete} 
          onClose={() => setIsModalOpen(false)} 
          onError={onError}
        />
      </DialogContent>
    </Dialog>
  );
}