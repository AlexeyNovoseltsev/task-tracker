import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PlayCircle, CheckCircle } from "lucide-react";

interface SprintStatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sprintName: string;
  action: 'start' | 'complete';
  isLoading?: boolean;
}

export function SprintStatusDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  sprintName, 
  action, 
  isLoading = false 
}: SprintStatusDialogProps) {
  const isStartAction = action === 'start';
  
  const getDialogContent = () => {
    if (isStartAction) {
      return {
        title: "Запустить спринт",
        description: `Вы уверены, что хотите запустить спринт "${sprintName}"? Это действие нельзя отменить.`,
        icon: PlayCircle,
        confirmText: "Запустить спринт",
        confirmVariant: "default" as const,
      };
    } else {
      return {
        title: "Завершить спринт",
        description: `Вы уверены, что хотите завершить спринт "${sprintName}"? Все незавершенные задачи останутся в бэклоге.`,
        icon: CheckCircle,
        confirmText: "Завершить спринт",
        confirmVariant: "default" as const,
      };
    }
  };

  const content = getDialogContent();
  const IconComponent = content.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <IconComponent className="h-5 w-5 text-primary" />
            <DialogTitle>{content.title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            {content.description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button 
            variant={content.confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Обработка..." : content.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 