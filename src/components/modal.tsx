// components/ui/Modal.tsx
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
// import { Cross2Icon } from "@radix-ui/react-icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button onClick={onClose}>
            {/* <Cross2Icon /> */}
          </button>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}