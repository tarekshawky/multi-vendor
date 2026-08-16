export function orderStatusTone(status: string) {
  switch (status) {
    case "PENDING":
      return "error" as const;
    case "PROCESSING":
      return "positive" as const;
    case "SHIPPED":
    case "DELIVERED":
      return "neutral" as const;
    case "CANCELLED":
      return "muted" as const;
    default:
      return "neutral" as const;
  }
}

export function promoStatusTone(status: string) {
  switch (status) {
    case "ACTIVE":
      return "neutral" as const;
    case "SCHEDULED":
      return "positive" as const;
    case "EXPIRED":
      return "muted" as const;
    default:
      return "neutral" as const;
  }
}

export function collectionStatusTone(status: string) {
  switch (status) {
    case "ACTIVE":
      return "neutral" as const;
    case "DRAFT":
      return "positive" as const;
    case "ARCHIVED":
      return "muted" as const;
    default:
      return "neutral" as const;
  }
}
