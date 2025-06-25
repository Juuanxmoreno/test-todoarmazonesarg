enum OrderStatus {
  Pending = "PENDING",
  Shipped = "SHIPPED",
  Completed = "COMPLETED",
  Cancelled = "CANCELLED",
}

enum ShippingMethod {
  ParcelCompany = "PARCEL_COMPANY",
  Motorcycle = "MOTORCYCLE",
}

enum PaymentMethod {
  CashOnDelivery = "CASH_ON_DELIVERY",
  BankTransfer = "BANK_TRANSFER",
}

export { OrderStatus, ShippingMethod, PaymentMethod };
