let commissionDraft = {
  photoData: null,
  order: null,
  pendingOrder: null,
};

export function getCommissionDraft() {
  return commissionDraft;
}

export function setCommissionPhoto(photoData) {
  commissionDraft = { ...commissionDraft, photoData };
}

export function setCommissionOrder(order) {
  commissionDraft = { ...commissionDraft, order };
}

export function setCommissionPendingOrder(pendingOrder) {
  commissionDraft = { ...commissionDraft, pendingOrder };
}

export function clearCommissionDraft() {
  commissionDraft = { photoData: null, order: null, pendingOrder: null };
}
