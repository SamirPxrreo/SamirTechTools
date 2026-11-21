import React, { ReactNode } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import { Button, Modal } from './ui';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  return (
    <Modal
      open={isOpen}
      onClose={onCancel}
      title={title}
      description={message}
      icon={danger ? <AlertTriangle size={18} /> : <HelpCircle size={18} />}
      tone={danger ? 'red' : 'indigo'}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>{cancelText}</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} autoFocus>{confirmText}</Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}
