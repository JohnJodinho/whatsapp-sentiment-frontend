import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Trash2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteChatModalProps {
  onDeleteConfirmed: () => Promise<void> | void;
  onClose: () => void;
  onError: () => void;
}

type ModalState = 'confirm' | 'deleting' | 'success';

export function DeleteChatModal({ onDeleteConfirmed, onClose, onError }: DeleteChatModalProps) {
  const [state, setState] = useState<ModalState>('confirm');

  // Automatically close the modal after success animation
  useEffect(() => {
    if (state === 'success') {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  const handleDelete = async () => {
    setState('deleting');
    try {
      await onDeleteConfirmed();
      setState('success');
    } catch (err) {
      // If deletion fails, log the error, call the error handler (which shows a toast)
      // and keep the modal open for another attempt.
      console.error(err);
      onError();
      setState('confirm'); // Revert to confirmation state
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'deleting':
        return (
          <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
            <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
            <p className="font-semibold text-lg">Deleting chat...</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center text-center gap-4 p-8">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="font-semibold text-lg">Chat deleted successfully.</p>
          </div>
        );
      case 'confirm':
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Delete Chat?</DialogTitle>
              <DialogDescription>
                This will permanently remove the uploaded chat and all related data. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 sm:justify-between">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <div className="min-h-[220px] flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}