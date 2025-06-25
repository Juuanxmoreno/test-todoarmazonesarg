import { OrderStatus } from "@/enums/order.enum";
import { Info, CheckCircle2, XCircle, Truck } from "lucide-react";

interface Props {
  status: OrderStatus;
}

export const OrderStatusBadge = ({ status }: Props) => {
  switch (status) {
    case OrderStatus.Pending:
      return (
        <span className="badge badge-warning gap-1">
          <Info className="size-[1em]" />
          Pendiente
        </span>
      );
    case OrderStatus.Shipped:
      return (
        <span className="badge badge-info gap-1">
          <Truck className="size-[1em]" />
          Enviado
        </span>
      );
    case OrderStatus.Completed:
      return (
        <span className="badge badge-success gap-1">
          <CheckCircle2 className="size-[1em]" />
          Completado
        </span>
      );
    case OrderStatus.Cancelled:
      return (
        <span className="badge badge-error gap-1">
          <XCircle className="size-[1em]" />
          Cancelado
        </span>
      );
    default:
      return (
        <span className="badge badge-neutral gap-1">
          <Info className="size-[1em]" />
          Desconocido
        </span>
      );
  }
};
