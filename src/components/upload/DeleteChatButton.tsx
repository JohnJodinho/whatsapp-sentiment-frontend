import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer"; // Use Drawer for Mobile
import { DeleteChatModal } from "./DeleteChatModal";
import { Trash2 } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface DeleteChatButtonProps {
  onDelete: () => Promise<void>;
  onError: () => void;
}

export function DeleteChatButton({ onDelete, onError }: DeleteChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const buttonClass = "h-12 w-full md:w-auto px-6 text-base font-semibold rounded-2xl border-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all";

  // Desktop Component: Dialog
  if (!isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button variant="outline" className={buttonClass} onClick={() => setIsOpen(true)}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Chat
        </Button>
        <DialogContent className="sm:max-w-md">
          <DeleteChatModal 
            onDeleteConfirmed={onDelete} 
            onClose={() => setIsOpen(false)} 
            onError={onError}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile Component: Drawer
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" className={buttonClass} onClick={() => setIsOpen(true)}>
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Chat
      </Button>
      <DrawerContent>
         <div className="p-4 pb-8">
            <DeleteChatModal 
                onDeleteConfirmed={onDelete} 
                onClose={() => setIsOpen(false)} 
                onError={onError}
            />
         </div>
      </DrawerContent>
    </Drawer>
  );
}